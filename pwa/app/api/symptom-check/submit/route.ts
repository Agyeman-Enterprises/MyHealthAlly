import { NextResponse } from 'next/server';
import { assertAttachedPatient } from '@/lib/server/assertAttachedPatient';
import { apiClient } from '@/lib/api/solopractice-client';
import { getCurrentUserAndPatient } from '@/lib/supabase/queries-settings';

export async function POST(req: Request) {
  try {
    const ctx = await assertAttachedPatient(); // 🔒 HARD GATE
    const body = await req.json();

    const { symptomCheckId, chiefConcern, category, redFlags, triageLevel, answers, summaryClinician } = body;

    if (!chiefConcern || !symptomCheckId) {
      return NextResponse.json({ error: 'Missing required fields: chiefConcern, symptomCheckId' }, { status: 400 });
    }

    // Get patient info for SP request
    const { patient, userRecord } = await getCurrentUserAndPatient();
    if (!patient || !userRecord) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    }

    // Map triage level to SP priority
    const priorityMap: Record<string, 'red' | 'yellow' | 'green'> = {
      'emergent': 'red',
      'urgent': 'yellow',
      'routine': 'green',
    };

    // Create SP patient request (symptom check task)
    const spResponse = await apiClient.submitPatientRequest({
      type: 'question',
      patient: {
        id: ctx.patientId,
        name: `${patient.first_name || ''} ${patient.last_name || ''}`.trim(),
        planTier: 'Essential', // TODO: Get from patient record if available
      },
      summary: `Symptom Check: ${chiefConcern}`,
      details: {
        symptomCheckId,
        category,
        redFlags,
        triageLevel,
        answers,
        summaryClinician,
      },
      priority: priorityMap[triageLevel] || 'green',
      source: 'mha',
    });

    return NextResponse.json({ ok: true, response: spResponse });
  } catch (error) {
    console.error('Error submitting symptom check to care team:', error);
    const message = error instanceof Error ? error.message : 'Failed to submit symptom check';
    
    // Check if it's an attachment error
    if (message.includes('not attached') || message.includes('No patient record')) {
      return NextResponse.json({ error: message }, { status: 403 });
    }
    
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

