import { NextResponse } from 'next/server';
import { getCurrentUserAndPatient } from '@/lib/supabase/queries-settings';
import { apiClient } from '@/lib/api/solopractice-client';
import { translateText } from '@/lib/utils/translate';

export async function POST(req: Request) {
  try {
    // CRITICAL: Allow hospital notification even without full attachment
    // This is the award-winning feature - user never disappears from view
    const { patient, userRecord } = await getCurrentUserAndPatient();
    if (!patient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    }

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

    // Translate patient notes to English if needed (for clinic)
    let englishNotes = patientNotes || '';
    if (patientNotes && userRecord?.preferred_language && userRecord.preferred_language !== 'en') {
      try {
        const { translatedText } = await translateText(patientNotes, 'en');
        englishNotes = translatedText;
      } catch (err) {
        console.error('Translation failed for patient notes:', err);
        // Continue with original notes if translation fails
      }
    }

    // Translate admission reason to English if needed
    let englishReason = admissionReason || '';
    if (admissionReason && userRecord?.preferred_language && userRecord.preferred_language !== 'en') {
      try {
        const { translatedText } = await translateText(admissionReason, 'en');
        englishReason = translatedText;
      } catch (err) {
        console.error('Translation failed for admission reason:', err);
      }
    }

    // Determine priority based on admission type
    const priorityMap: Record<string, 'red' | 'yellow' | 'green'> = {
      'emergency': 'red',
      'planned': 'yellow',
      'observation': 'green',
    };

    // CRITICAL: Notify primary care if patient has a practice relationship
    // This is the award-winning feature - real-time awareness
    let notificationSent = false;
    let notificationError: string | null = null;

    if (patient.practice_id && patient.sp_patient_id) {
      try {
        // Patient has a practice relationship - notify immediately
        await apiClient.submitPatientRequest({
          type: 'question',
          patient: {
            id: patient.sp_patient_id,
            name: `${patient.first_name || ''} ${patient.last_name || ''}`.trim(),
            planTier: 'Essential', // TODO: Get from patient record if available
          },
          summary: `🚨 Hospital Admission: ${hospitalName}`,
          details: {
            admissionId,
            hospitalName,
            hospitalAddress,
            hospitalPhone,
            admissionDate,
            admissionReason: englishReason,
            admissionType,
            dischargeDate,
            patientNotes: englishNotes,
            // CRITICAL: Mark as real-time alert
            alertType: 'hospital_admission',
            priority: 'high',
          },
          priority: priorityMap[admissionType] || 'yellow',
          source: 'mha',
        });
        notificationSent = true;
      } catch (err) {
        console.error('Error notifying primary care:', err);
        notificationError = err instanceof Error ? err.message : 'Failed to notify care team';
        // Don't fail the entire request - hospital admission is still recorded
      }
    } else {
      // Patient doesn't have a practice relationship yet
      // Still record the admission - they can share records later
      console.log('Patient not attached to practice - hospital admission recorded but not notified');
    }

    return NextResponse.json({
      ok: true,
      notificationSent,
      notificationError: notificationError || undefined,
      message: notificationSent
        ? 'Hospital admission recorded and primary care notified'
        : 'Hospital admission recorded. Connect to a care team to enable automatic notifications.',
    });
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

