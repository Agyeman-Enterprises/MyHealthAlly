import { NextResponse } from 'next/server';
import { translateText } from '@/lib/utils/translate';
import { supabaseService } from '@/lib/supabase/service';
import { env } from '@/lib/env';
import { parseFollowUpInstructions, scheduleFollowUpAppointment } from '@/lib/utils/followup-scheduler';
import { assertPatientAttached } from '@/lib/server/assertAttachedPatient';

type LabResultPayload = {
  id: string;
  solopractice_lab_id?: string; // Alternative field name
  patient_id: string;
  order_id?: string;
  test_name?: string;
  test_type?: string;
  ordered_date?: string;
  result_date?: string;
  collection_date?: string;
  status?: 'ordered' | 'in_progress' | 'completed' | 'cancelled';
  tests?: Array<{ 
    name: string; 
    value?: string | number; 
    unit?: string; 
    reference?: string;
    flag?: 'normal' | 'high' | 'low' | 'critical';
  }>;
  results?: Record<string, {
    value: string | number;
    unit: string;
    reference_range: string;
    flag?: 'normal' | 'high' | 'low' | 'critical';
  }>;
  attachmentUrl?: string;
  pdf_url?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  messageToPatient?: string;
  doctorNote?: string; // Note from doctor about results
  requiresFollowUp?: boolean; // Explicit flag for follow-up
};

export async function POST(req: Request) {
  try {
    const signature = req.headers.get('x-mha-signature');
    if (!env.INBOUND_WEBHOOK_SECRET || signature !== env.INBOUND_WEBHOOK_SECRET) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = (await req.json()) as LabResultPayload;
    if (!body?.id || !body?.patient_id) {
      return new NextResponse('Invalid payload', { status: 400 });
    }

    if (!supabaseService) {
      return new NextResponse('Database service not available', { status: 500 });
    }

    // Check if patient exists and is registered in MHA
    const { data: patient, error: patientError } = await supabaseService
      .from('patients')
      .select('id,user_id,preferred_language,users(preferred_language)')
      .eq('id', body.patient_id)
      .single();

    if (patientError || !patient) {
      console.log(`Patient ${body.patient_id} not found in MHA - lab result sync skipped`);
      return NextResponse.json({ 
        ok: false, 
        message: 'Patient not registered in MHA',
        patient_id: body.patient_id 
      });
    }

    // Determine patient preferred language
    const langFromPatient = (patient as { preferred_language?: string })?.preferred_language;
    const langFromUser = (patient as { users?: { preferred_language?: string } })?.users?.preferred_language;
    const preferredLang = langFromPatient || langFromUser || 'en';

    // Translate doctor's note and message
    const doctorNote = body.doctorNote || body.messageToPatient || '';
    const { translatedText: translatedNote } = doctorNote
      ? await translateText(doctorNote, preferredLang)
      : { translatedText: '' };

    // Prepare lab result data
    const labResultData: Record<string, unknown> = {
      patient_id: body.patient_id,
      solopractice_lab_id: body.id || body.solopractice_lab_id || null,
      order_id: body.order_id || null,
      test_name: body.test_name || 'Lab Results',
      test_type: body.test_type || null,
      ordered_date: body.ordered_date || null,
      result_date: body.result_date || body.collection_date || new Date().toISOString().split('T')[0],
      collection_date: body.collection_date || null,
      status: body.status || 'completed',
      results: body.results || (body.tests ? (() => {
        const resultsObj: Record<string, unknown> = {};
        body.tests.forEach((test, idx) => {
          resultsObj[test.name || `test_${idx}`] = {
            value: test.value,
            unit: test.unit || '',
            reference_range: test.reference || '',
            flag: test.flag || 'normal',
          };
        });
        return resultsObj;
      })() : null) as Record<string, unknown> | null,
      attachment_url: body.attachmentUrl || body.pdf_url || null,
      reviewed_by: body.reviewedBy || null,
      reviewed_at: body.reviewedAt || null,
      doctor_note: translatedNote,
      doctor_note_language: preferredLang,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Check if lab result already exists
    const solopracticeId = body.id || body.solopractice_lab_id;
    let existingResult = null;

    if (solopracticeId) {
      const { data: existing } = await supabaseService
        .from('lab_results')
        .select('id')
        .eq('solopractice_lab_id', solopracticeId)
        .maybeSingle();
      
      existingResult = existing;
    }

    // Upsert lab result
    let result;
    if (existingResult) {
      const { data, error } = await supabaseService
        .from('lab_results')
        .update(labResultData)
        .eq('id', existingResult.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating lab result:', error);
        return new NextResponse(`Error updating lab result: ${error.message}`, { status: 500 });
      }

      result = data;
    } else {
      const { data, error } = await supabaseService
        .from('lab_results')
        .insert(labResultData)
        .select()
        .single();

      if (error) {
        console.error('Error creating lab result:', error);
        return new NextResponse(`Error creating lab result: ${error.message}`, { status: 500 });
      }

      result = data;
    }

    // Parse follow-up instructions and schedule if needed
    let followUpScheduled = false;
    let followUpAppointmentId: string | undefined;

    if (body.requiresFollowUp || doctorNote) {
      // Assert patient is attached before making SP call
      await assertPatientAttached(body.patient_id);
      
      const followUpInstructions = parseFollowUpInstructions(doctorNote);
      
      if (followUpInstructions.needsFollowUp || body.requiresFollowUp) {
        const followUpResult = await scheduleFollowUpAppointment(
          body.patient_id,
          followUpInstructions,
          {
            type: 'lab',
            id: result.id,
            description: body.test_name || 'Lab Results Review',
          }
        );

        if (followUpResult.success) {
          followUpScheduled = true;
          followUpAppointmentId = followUpResult.appointmentId;
        }
      }
    }

    return NextResponse.json({ 
      ok: true, 
      lab_result_id: result.id,
      action: existingResult ? 'updated' : 'created',
      translated_note: translatedNote,
      preferred_language: preferredLang,
      follow_up_scheduled: followUpScheduled,
      follow_up_appointment_id: followUpAppointmentId,
    });

  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to process lab result';
    console.error('Lab result webhook error:', err);
    return new NextResponse(message, { status: 500 });
  }
}
