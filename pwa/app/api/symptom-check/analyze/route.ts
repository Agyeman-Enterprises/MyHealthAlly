/**
 * API Route: AI-Powered Symptom Analysis
 * Uses Anthropic Claude to generate summaries and insights
 * R9 Compliance: All outputs are advisory only, non-diagnostic
 */

import { NextResponse } from 'next/server';
import { assertAttachedPatient } from '@/lib/server/assertAttachedPatient';
import { analyzeSymptoms, type SymptomAnalysisRequest } from '@/lib/services/anthropic-service';

export async function POST(req: Request) {
  try {
    // Patient attachment is optional - navigation mode doesn't require it
    // Only check if we're in clinical mode (will be checked in submit route)
    try {
      await assertAttachedPatient();
    } catch {
      // Navigation mode - continue without patient attachment
    }

    const body = await req.json();
    const { chiefConcern, category, redFlags, answers, triageLevel } = body;

    if (!chiefConcern || !answers || !Array.isArray(answers)) {
      return NextResponse.json(
        { error: 'Missing required fields: chiefConcern, answers' },
        { status: 400 }
      );
    }

    const request: SymptomAnalysisRequest = {
      chiefConcern,
      category: category || null,
      redFlags: redFlags || [],
      answers,
      triageLevel: triageLevel || 'routine',
    };

    const analysis = await analyzeSymptoms(request);

    return NextResponse.json(analysis);
  } catch (error) {
    console.error('Error in symptom analysis:', error);
    const message = error instanceof Error ? error.message : 'Failed to analyze symptoms';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
