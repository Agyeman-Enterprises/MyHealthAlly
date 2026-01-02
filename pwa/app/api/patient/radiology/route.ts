import { NextResponse } from 'next/server';
import { translateText } from '@/lib/utils/translate';
import { supabaseService } from '@/lib/supabase/service';
import { env } from '@/lib/env';
import { parseFollowUpInstructions, scheduleFollowUpAppointment } from '@/lib/utils/followup-scheduler';
import { assertPatientAttached } from '@/lib/server/assertAttachedPatient';

type RadiologyResultPayload = {
  id: string;
  solopractice_radiology_id?: string;
  patient_id: string;
  order_id?: string;
  study_type?: string; // e.g., "CT", "MRI", "X-Ray", "Ultrasound"
  study_name?: string;
  body_part?: string;
  ordered_date?: string;
  performed_date?: string;
  result_date?: string;
  status?: 'ordered' | 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  findings?: string;
  impression?: string;
  recommendation?: string;
  attachmentUrl?: string;
  pdf_url?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  messageToPatient?: string;
  doctorNote?: string;
  requiresFollowUp?: boolean;
};

export async function POST(req: Request) {
  try {
    const signature = req.headers.get('x-mha-signature');
    if (!env.INBOUND_WEBHOOK_SECRET || signature !== env.INBOUND_WEBHOOK_SECRET) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = (await req.json()) as RadiologyResultPayload;
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
      console.log(`Patient ${body.patient_id} not found in MHA - radiology result sync skipped`);
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

    // Translate doctor's note and findings
    const doctorNote = body.doctorNote || body.messageToPatient || body.recommendation || '';
    const findings = body.findings || '';
    const impression = body.impression || '';

    const { translatedText: translatedNote } = doctorNote
      ? await translateText(doctorNote, preferredLang)
      : { translatedText: '', detectedLang: preferredLang };

    const { translatedText: translatedFindings } = findings
      ? await translateText(findings, preferredLang)
      : { translatedText: '', detectedLang: preferredLang };

    const { translatedText: translatedImpression } = impression
      ? await translateText(impression, preferredLang)
      : { translatedText: '', detectedLang: preferredLang };

    // Prepare radiology result data
    const radiologyData: Record<string, unknown> = {
      patient_id: body.patient_id,
      solopractice_radiology_id: body.id || body.solopractice_radiology_id || null,
      order_id: body.order_id || null,
      study_type: body.study_type || null,
      study_name: body.study_name || body.study_type || 'Radiology Study',
      body_part: body.body_part || null,
      ordered_date: body.ordered_date || null,
      performed_date: body.performed_date || null,
      result_date: body.result_date || new Date().toISOString().split('T')[0],
      status: body.status || 'completed',
      findings: translatedFindings || findings,
      findings_language: preferredLang,
      impression: translatedImpression || impression,
      impression_language: preferredLang,
      recommendation: translatedNote || doctorNote,
      recommendation_language: preferredLang,
      attachment_url: body.attachmentUrl || body.pdf_url || null,
      reviewed_by: body.reviewedBy || null,
      reviewed_at: body.reviewedAt || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Check if radiology result already exists
    const solopracticeId = body.id || body.solopractice_radiology_id;
    let existingResult = null;

    if (solopracticeId) {
      const { data: existing } = await supabaseService
        .from('radiology_results')
        .select('id')
        .eq('solopractice_radiology_id', solopracticeId)
        .maybeSingle();
      
      existingResult = existing;
    }

    // Upsert radiology result
    let result;
    if (existingResult) {
      const { data, error } = await supabaseService
        .from('radiology_results')
        .update(radiologyData)
        .eq('id', existingResult.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating radiology result:', error);
        return new NextResponse(`Error updating radiology result: ${error.message}`, { status: 500 });
      }

      result = data;
    } else {
      const { data, error } = await supabaseService
        .from('radiology_results')
        .insert(radiologyData)
        .select()
        .single();

      if (error) {
        console.error('Error creating radiology result:', error);
        return new NextResponse(`Error creating radiology result: ${error.message}`, { status: 500 });
      }

      result = data;
    }

    // Parse follow-up instructions and schedule if needed
    let followUpScheduled = false;
    let followUpAppointmentId: string | undefined;

    if (body.requiresFollowUp || doctorNote || body.recommendation) {
      // Assert patient is attached before making SP call
      await assertPatientAttached(body.patient_id);
      
      const followUpNote = doctorNote || body.recommendation || '';
      const followUpInstructions = parseFollowUpInstructions(followUpNote);
      
      if (followUpInstructions.needsFollowUp || body.requiresFollowUp) {
        const followUpResult = await scheduleFollowUpAppointment(
          body.patient_id,
          followUpInstructions,
          {
            type: 'radiology',
            id: result.id,
            description: `${body.study_type || 'Radiology'} - ${body.body_part || 'Study'}`,
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
      radiology_result_id: result.id,
      action: existingResult ? 'updated' : 'created',
      translated_findings: translatedFindings,
      translated_impression: translatedImpression,
      translated_recommendation: translatedNote,
      preferred_language: preferredLang,
      follow_up_scheduled: followUpScheduled,
      follow_up_appointment_id: followUpAppointmentId,
    });

  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to process radiology result';
    console.error('Radiology result webhook error:', err);
    return new NextResponse(message, { status: 500 });
  }
}

