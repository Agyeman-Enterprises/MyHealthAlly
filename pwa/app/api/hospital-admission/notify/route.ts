import { NextResponse } from 'next/server';
import { assertAttachedPatient } from '@/lib/server/assertAttachedPatient';
import { apiClient } from '@/lib/api/solopractice-client';
import { getCurrentUserAndPatient } from '@/lib/supabase/queries-settings';

export async function POST(req: Request) {
  try {
    const ctx = await assertAttachedPatient(); // 🔒 HARD GATE
    const body = await req.json();

    const {
      admissionId,
      hospitalName,
      hospitalAddress,
      hospitalPhone,
      admissionDate,
      admissionReason,
      admissionType,
      dischargeDate,
      patientNotes,
    } = body;

    if (!hospitalName || !admissionDate || !admissionId) {
      return NextResponse.json(
        { error: 'Missing required fields: hospitalName, admissionDate, admissionId' },
        { status: 400 }
      );
    }

    // Get patient info for SP request
    const { patient, userRecord } = await getCurrentUserAndPatient();
    if (!patient || !userRecord) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    }

    // Determine priority based on admission type
    const priorityMap: Record<string, 'red' | 'yellow' | 'green'> = {
      'emergency': 'red',
      'planned': 'yellow',
      'observation': 'green',
    };

    // Create SP patient request (hospital admission notification)
    const spResponse = await apiClient.submitPatientRequest({
      type: 'question',
      patient: {
        id: ctx.patientId,
        name: `${patient.first_name || ''} ${patient.last_name || ''}`.trim(),
        planTier: 'Essential', // TODO: Get from patient record if available
      },
      summary: `Hospital Admission: ${hospitalName}`,
      details: {
        admissionId,
        hospitalName,
        hospitalAddress,
        hospitalPhone,
        admissionDate,
        admissionReason,
        admissionType,
        dischargeDate,
        patientNotes,
      },
      priority: priorityMap[admissionType] || 'yellow',
      source: 'mha',
    });

    return NextResponse.json({ ok: true, response: spResponse });
  } catch (error) {
    console.error('Error notifying care team of hospital admission:', error);
    const message = error instanceof Error ? error.message : 'Failed to notify care team';
    
    // Check if it's an attachment error
    if (message.includes('not attached') || message.includes('No patient record')) {
      return NextResponse.json({ error: message }, { status: 403 });
    }
    
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

