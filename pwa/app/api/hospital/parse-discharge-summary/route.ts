/**
 * API Route: Parse Discharge Summary
 * 
 * Uses AI to extract medication information from discharge summaries
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { env } from '@/lib/env';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: env.ANTHROPIC_API_KEY || '',
});

// Use service role key for server-side operations
const supabase = env.NEXT_PUBLIC_SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY
  ? createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)
  : null;

const PARSE_PROMPT = `You are a medical document parser. Extract medication information from a hospital discharge summary.

Extract the following information for each medication mentioned:
1. Medication name (generic or brand)
2. Dosage (e.g., "10mg", "500mg")
3. Frequency (e.g., "twice daily", "once daily", "as needed")
4. Route (e.g., "oral", "IV", "topical")
5. Instructions (any special instructions)
6. Action: "added" (new medication), "modified" (dosage/frequency changed), "discontinued" (stopped), or "unchanged"

Return a JSON array of medications in this format:
[
  {
    "medication_name": "Lisinopril",
    "dosage": "10",
    "frequency": "once daily",
    "route": "oral",
    "instructions": "Take with food",
    "action": "added"
  }
]

If no medications are found, return an empty array [].

Only extract medications that are clearly mentioned in the discharge summary. Be conservative - if uncertain, don't include it.`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { documentText, hospitalAdmissionId, patientId } = body;

    if (!documentText || typeof documentText !== 'string') {
      return NextResponse.json(
        { error: 'Document text is required' },
        { status: 400 }
      );
    }

    if (!hospitalAdmissionId || !patientId) {
      return NextResponse.json(
        { error: 'Hospital admission ID and patient ID are required' },
        { status: 400 }
      );
    }

    // Use Anthropic to parse the discharge summary
    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4000,
      messages: [
        {
          role: 'user',
          content: `${PARSE_PROMPT}\n\nDischarge Summary:\n\n${documentText.substring(0, 50000)}` // Limit to 50k chars
        }
      ],
    });

    // Extract JSON from response
    const content = message.content[0];
    if (!content || content.type !== 'text') {
      throw new Error('Unexpected response format');
    }

    let medications: any[] = [];
    try {
      // Try to parse JSON from the response
      const jsonMatch = content.text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        medications = JSON.parse(jsonMatch[0]);
      }
    } catch (parseError) {
      console.error('Error parsing medications from AI response:', parseError);
      // Return empty array if parsing fails
    }

    // Save medication reconciliation records
    if (supabase && medications.length > 0) {
      const reconciliationRecords = medications.map((med) => ({
        hospital_admission_id: hospitalAdmissionId,
        patient_id: patientId,
        medication_name: med.medication_name || '',
        dosage: med.dosage || null,
        frequency: med.frequency || null,
        route: med.route || null,
        instructions: med.instructions || null,
        action: med.action || 'added',
        applied: false,
      }));

      const { error: insertError } = await supabase
        .from('medication_reconciliation')
        .insert(reconciliationRecords);

      if (insertError) {
        console.error('Error saving medication reconciliation:', insertError);
      }

      // Update hospital admission to mark medications as extracted
      await supabase
        .from('hospital_admissions')
        .update({
          medications_prescribed: medications,
          medications_reconciled: false, // Not yet applied to medication list
        })
        .eq('id', hospitalAdmissionId);
    }

    return NextResponse.json({
      medications,
      count: medications.length,
    });
  } catch (error) {
    console.error('Error parsing discharge summary:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to parse discharge summary' },
      { status: 500 }
    );
  }
}
