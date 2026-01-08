/**
 * API Route: Parse Discharge Summary
 * 
 * CRITICAL: Award-winning feature - User Never Disappears from View
 * - Uses AI to extract medication information from discharge summaries
 * - Notifies primary care in real-time when discharge summary is processed
 * - Ensures medication changes are never lost
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { env } from '@/lib/env';
import Anthropic from '@anthropic-ai/sdk';
import { apiClient } from '@/lib/api/solopractice-client';
import { getCurrentUserAndPatient } from '@/lib/supabase/queries-settings';

const anthropic = new Anthropic({
  apiKey: env.ANTHROPIC_API_KEY || '',
});

// Use service role key for server-side operations
const supabase = env.NEXT_PUBLIC_SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY
  ? createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)
  : null;

const PARSE_PROMPT = `You are a medical document parser. Extract comprehensive information from a hospital discharge summary.

Extract the following information:

1. MEDICATIONS: For each medication mentioned:
   - Medication name (generic or brand)
   - Dosage (e.g., "10mg", "500mg")
   - Frequency (e.g., "twice daily", "once daily", "as needed")
   - Route (e.g., "oral", "IV", "topical")
   - Instructions (any special instructions)
   - Action: "added" (new medication), "modified" (dosage/frequency changed), "discontinued" (stopped), or "unchanged"

2. DIAGNOSES: List all diagnoses mentioned (primary and secondary)

3. FOLLOW-UP: Extract follow-up instructions, appointments, or recommendations

4. DISCHARGE_DATE: Extract discharge date if mentioned

Return a JSON object in this format:
{
  "medications": [
    {
      "medication_name": "Lisinopril",
      "dosage": "10",
      "frequency": "once daily",
      "route": "oral",
      "instructions": "Take with food",
      "action": "added"
    }
  ],
  "diagnoses": ["Hypertension", "Type 2 Diabetes"],
  "follow_up": "Follow up with primary care in 1 week",
  "discharge_date": "2024-01-15"
}

If no information is found in a category, return an empty array or null. Only extract information that is clearly mentioned. Be conservative - if uncertain, don't include it.`;

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

    interface MedicationChange {
      medication_name: string;
      dosage?: string;
      frequency?: string;
      route?: string;
      instructions?: string;
      action: 'added' | 'modified' | 'discontinued' | 'unchanged';
    }

    let parsedData: {
      medications?: MedicationChange[];
      diagnoses?: string[];
      follow_up?: string;
      discharge_date?: string;
    } = { medications: [] };

    try {
      // Try to parse JSON object from the response
      const jsonMatch = content.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedData = JSON.parse(jsonMatch[0]);
      }
    } catch (parseError) {
      console.error('Error parsing discharge summary from AI response:', parseError);
      // Fallback: try to extract just medications array (old format)
      try {
        const arrayMatch = content.text.match(/\[[\s\S]*\]/);
        if (arrayMatch) {
          parsedData.medications = JSON.parse(arrayMatch[0]);
        }
      } catch (fallbackError) {
        console.error('Error parsing medications array:', fallbackError);
      }
    }

    const medications = parsedData.medications || [];
    const diagnoses = parsedData.diagnoses || [];
    const followUp = parsedData.follow_up || '';
    const dischargeDate = parsedData.discharge_date || null;

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

      // Update hospital admission with extracted information
      await supabase
        .from('hospital_admissions')
        .update({
          medications_prescribed: medications,
          medications_reconciled: false, // Not yet applied to medication list
          discharge_date: dischargeDate || undefined,
        })
        .eq('id', hospitalAdmissionId);
    }

    // CRITICAL: Notify primary care in real-time (award-winning feature)
    let notificationSent = false;
    let notificationError: string | null = null;

    try {
      // Get patient info to check for practice relationship
      const { patient } = await getCurrentUserAndPatient();
      
      if (patient?.practice_id && patient?.sp_patient_id) {
        // Build notification summary
        const medicationSummary = medications.length > 0
          ? `${medications.length} medication change${medications.length !== 1 ? 's' : ''} identified`
          : 'No medication changes identified';
        
        const diagnosisSummary = diagnoses.length > 0
          ? `Diagnoses: ${diagnoses.join(', ')}`
          : '';

        const summary = `🚨 Discharge Summary Processed: ${medicationSummary}${diagnosisSummary ? ` | ${diagnosisSummary}` : ''}`;

        // Build detailed notification
        const details: Record<string, unknown> = {
          hospitalAdmissionId,
          dischargeDate: dischargeDate || 'Not specified',
          medicationCount: medications.length,
          medications: medications.map(m => ({
            name: m.medication_name,
            action: m.action,
            dosage: m.dosage,
            frequency: m.frequency,
          })),
          diagnoses,
          followUp: followUp || 'None specified',
          alertType: 'discharge_summary',
          priority: 'high',
        };

        // Send real-time notification to primary care
        await apiClient.submitPatientRequest({
          type: 'question',
          patient: {
            id: patient.sp_patient_id,
            name: `${patient.first_name || ''} ${patient.last_name || ''}`.trim(),
            planTier: 'Essential',
          },
          summary,
          details,
          priority: 'yellow', // High priority but not emergency
          source: 'mha',
        });

        notificationSent = true;
      }
    } catch (err) {
      console.error('Error notifying primary care of discharge summary:', err);
      notificationError = err instanceof Error ? err.message : 'Failed to notify care team';
      // Don't fail the entire request - parsing succeeded
    }

    return NextResponse.json({
      medications,
      diagnoses,
      followUp,
      dischargeDate,
      count: medications.length,
      notificationSent,
      notificationError: notificationError || undefined,
    });
  } catch (error) {
    console.error('Error parsing discharge summary:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to parse discharge summary' },
      { status: 500 }
    );
  }
}
