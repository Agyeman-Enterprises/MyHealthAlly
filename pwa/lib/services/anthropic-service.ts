/**
 * Anthropic Claude API Service
 * Provides AI-powered symptom analysis with strict medical advisory boundaries (R9 compliance)
 */

import Anthropic from '@anthropic-ai/sdk';
import { env } from '@/lib/env';

const anthropic = env.ANTHROPIC_API_KEY
  ? new Anthropic({
      apiKey: env.ANTHROPIC_API_KEY,
    })
  : null;

export interface SymptomAnalysisRequest {
  chiefConcern: string;
  category: string | null;
  redFlags: string[];
  answers: Array<{ key: string; question: string; answer: string }>;
  triageLevel: 'emergent' | 'urgent' | 'routine';
}

export interface SymptomAnalysisResponse {
  summaryPatient: string; // Patient-safe summary (no diagnoses, no treatment advice)
  summaryClinician: string; // Clinical summary for care team
  educationContent: string[]; // Educational tips based on symptoms
  suggestedFollowUps: string[]; // Suggested follow-up questions (if any)
  insights: string; // General health insights (non-diagnostic)
}

/**
 * R9 Compliance: AI Advisory Boundary
 * All AI outputs must:
 * - Never diagnose conditions
 * - Never prescribe treatments
 * - Never provide specific medical advice
 * - Always include disclaimers
 * - Be clearly marked as advisory/non-diagnostic
 */
const SYSTEM_PROMPT = `You are a health navigation assistant helping patients organize their symptoms for their care team. 

CRITICAL RULES (R9 Compliance):
1. NEVER diagnose conditions or suggest specific diagnoses
2. NEVER prescribe treatments, medications, or dosages
3. NEVER provide specific medical advice
4. ALWAYS emphasize that this is NOT a diagnosis
5. Focus on organizing information and providing general health education
6. For patient-facing content: Use simple, reassuring language without medical jargon
7. For clinician-facing content: Use clinical terminology but emphasize non-diagnostic nature

Your role is to:
- Help organize symptom information clearly
- Provide general health education
- Suggest when to seek care (general guidance only)
- Help patients prepare for their care team visit

Always end patient-facing content with: "This is not a diagnosis or medical advice. Your care team will review this information."`;

/**
 * Generate AI-powered symptom analysis
 */
export async function analyzeSymptoms(request: SymptomAnalysisRequest): Promise<SymptomAnalysisResponse> {
  if (!anthropic) {
    throw new Error('Anthropic API key not configured');
  }

  const { chiefConcern, category, redFlags, answers, triageLevel } = request;

  // Build context for Claude
  const symptomContext = `
Chief Concern: ${chiefConcern}
Category: ${category || 'Not specified'}
Red Flags Selected: ${redFlags.length > 0 ? redFlags.join(', ') : 'None'}
Triage Level: ${triageLevel}

Symptom Details:
${answers.map((a) => `${a.question}: ${a.answer}`).join('\n')}
`.trim();

  try {
    // Generate patient-safe summary
    const patientSummaryResponse = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 500,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: `Create a patient-friendly summary of these symptoms. Focus on organizing the information clearly. Do NOT diagnose or suggest treatments. Use simple, reassuring language. Include a reminder that this is not a diagnosis.

${symptomContext}`,
        },
      ],
    });

    const summaryPatient =
      patientSummaryResponse.content[0]?.type === 'text'
        ? patientSummaryResponse.content[0].text
        : 'Unable to generate summary.';

    // Generate clinician summary
    const clinicianSummaryResponse = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 800,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: `Create a clinical summary for the care team. Use clinical terminology but emphasize this is non-diagnostic and for information organization only. Structure it clearly for clinician review.

${symptomContext}`,
        },
      ],
    });

    const summaryClinician =
      clinicianSummaryResponse.content[0]?.type === 'text'
        ? clinicianSummaryResponse.content[0].text
        : 'Unable to generate clinical summary.';

    // Generate educational content
    const educationResponse = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 400,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: `Based on these symptoms, provide 3-5 general health education tips. Focus on:
- General self-care (hydration, rest, monitoring)
- When to seek care (general guidance)
- What information to have ready for the care team
- General wellness tips

Do NOT provide specific medical advice or treatments. Keep it general and educational.

${symptomContext}`,
        },
      ],
    });

    const educationText =
      educationResponse.content[0]?.type === 'text'
        ? educationResponse.content[0].text
        : 'Keep track of your symptoms and be ready to share details with your care team.';

    // Parse education into bullet points
    const educationContent = educationText
      .split('\n')
      .filter((line) => line.trim().length > 0)
      .map((line) => line.replace(/^[-•*]\s*/, '').trim())
      .filter((line) => line.length > 0)
      .slice(0, 5);

    // Generate general insights (non-diagnostic)
    const insightsResponse = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 300,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: `Provide general health insights about these symptoms. Focus on:
- Patterns or connections between symptoms (non-diagnostic)
- General health considerations
- What information might be helpful for the care team

Do NOT diagnose or suggest specific conditions. Keep it general and informational.

${symptomContext}`,
        },
      ],
    });

    const insights =
      insightsResponse.content[0]?.type === 'text'
        ? insightsResponse.content[0].text
        : 'Your care team will review all the information you provided.';

    return {
      summaryPatient: sanitizePatientFacing(summaryPatient),
      summaryClinician,
      educationContent: educationContent.length > 0 ? educationContent : ['Keep track of symptom changes and any new issues.'],
      suggestedFollowUps: [], // Can be enhanced later
      insights: sanitizePatientFacing(insights),
    };
  } catch (error) {
    console.error('Error calling Anthropic API:', error);
    throw new Error('Failed to generate AI analysis. Please try again.');
  }
}

/**
 * Sanitize patient-facing content to ensure R9 compliance
 */
function sanitizePatientFacing(text: string): string {
  const forbidden = [
    /\b(you (have|likely have|probably have|definitely have)|this is|it is)\b.*\b(infection|pneumonia|appendicitis|flu|covid|stroke|heart attack|uti|migraine|cancer)\b/gi,
    /\b(diagnos(e|is)|diagnostic|pathognomonic)\b/gi,
    /\b(I think you have|sounds like you have|consistent with)\b/gi,
    /\b(you should|you need to|you must|I recommend)\b(?!.*\b(call (911|emergency)|go to (the )?(ER|emergency))\b)/gi,
    /\b(start|stop|increase|decrease|take)\b.*\b(mg|milligram|tablet|capsule|dose|dosing)\b/gi,
    /\b(antibiotic|steroid|opioid|benzodiazepine|insulin|warfarin)\b/gi,
    /\b\d{1,4}\s?(mg|mcg|g|ml)\b/gi,
    /\b(once|twice|three times)\s+(daily|a day)\b/gi,
    /\b(every)\s+\d+\s+(hours|hrs)\b/gi,
    /\b(\d{1,3}%|percent|chance|odds|probability)\b/gi,
    /\b(most likely|unlikely|highly likely)\b/gi,
    /\b(as your doctor|I am diagnosing|medical diagnosis)\b/gi,
  ];

  let cleaned = text;
  forbidden.forEach((re) => {
    cleaned = cleaned.replace(
      re,
      "I can't diagnose or give treatment advice. I can help organize your symptoms and send them to your care team."
    );
  });

  // Ensure disclaimer is present
  if (!cleaned.includes('not a diagnosis') && !cleaned.includes('not medical advice')) {
    cleaned += '\n\nThis is not a diagnosis or medical advice. Your care team will review.';
  }

  return cleaned;
}
