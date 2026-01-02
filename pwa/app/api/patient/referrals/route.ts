import { NextResponse } from 'next/server';
import { translateText } from '@/lib/utils/translate';
import { supabaseService } from '@/lib/supabase/service';
import { env } from '@/lib/env';
import { parseFollowUpInstructions, scheduleFollowUpAppointment } from '@/lib/utils/followup-scheduler';
import { assertPatientAttached } from '@/lib/server/assertAttachedPatient';

type ReferralResponsePayload = {
  id: string;
  solopractice_referral_id?: string;
  patient_id: string;
  referral_request_id?: string;
  specialty?: string;
  specialist_name?: string;
  specialist_clinic?: string;
  specialist_phone?: string;
  specialist_address?: string;
  status?: 'pending' | 'approved' | 'scheduled' | 'completed' | 'cancelled';
  appointment_date?: string;
  appointment_time?: string;
  appointment_location?: string;
  notes?: string;
  messageToPatient?: string;
  doctorNote?: string;
  requiresFollowUp?: boolean;
  response_date?: string;
};

export async function POST(req: Request) {
  try {
    const signature = req.headers.get('x-mha-signature');
    if (!env.INBOUND_WEBHOOK_SECRET || signature !== env.INBOUND_WEBHOOK_SECRET) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = (await req.json()) as ReferralResponsePayload;
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
      console.log(`Patient ${body.patient_id} not found in MHA - referral response sync skipped`);
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
    const doctorNote = body.doctorNote || body.messageToPatient || body.notes || '';
    const { translatedText: translatedNote } = doctorNote
      ? await translateText(doctorNote, preferredLang)
      : { translatedText: '', detectedLang: preferredLang };

    // Prepare referral response data
    const referralData: Record<string, unknown> = {
      patient_id: body.patient_id,
      solopractice_referral_id: body.id || body.solopractice_referral_id || null,
      referral_request_id: body.referral_request_id || null,
      specialty: body.specialty || null,
      specialist_name: body.specialist_name || null,
      specialist_clinic: body.specialist_clinic || null,
      specialist_phone: body.specialist_phone || null,
      specialist_address: body.specialist_address || null,
      status: body.status || 'approved',
      appointment_date: body.appointment_date || null,
      appointment_time: body.appointment_time || null,
      appointment_location: body.appointment_location || null,
      notes: translatedNote || doctorNote,
      notes_language: preferredLang,
      response_date: body.response_date || new Date().toISOString().split('T')[0],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Check if referral response already exists
    const solopracticeId = body.id || body.solopractice_referral_id;
    let existingReferral = null;

    if (solopracticeId) {
      const { data: existing } = await supabaseService
        .from('referral_responses')
        .select('id')
        .eq('solopractice_referral_id', solopracticeId)
        .maybeSingle();
      
      existingReferral = existing;
    }

    // Upsert referral response
    let result;
    if (existingReferral) {
      const { data, error } = await supabaseService
        .from('referral_responses')
        .update(referralData)
        .eq('id', existingReferral.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating referral response:', error);
        return new NextResponse(`Error updating referral response: ${error.message}`, { status: 500 });
      }

      result = data;
    } else {
      const { data, error } = await supabaseService
        .from('referral_responses')
        .insert(referralData)
        .select()
        .single();

      if (error) {
        console.error('Error creating referral response:', error);
        return new NextResponse(`Error creating referral response: ${error.message}`, { status: 500 });
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
            type: 'referral',
            id: result.id,
            description: `${body.specialty || 'Specialist'} Referral`,
          }
        );

        if (followUpResult.success) {
          followUpScheduled = true;
          followUpAppointmentId = followUpResult.appointmentId;
        }
      }
    }

    // If appointment is already scheduled, we might want to create an appointment record
    if (body.appointment_date && body.appointment_time && !followUpScheduled) {
      // Appointment already scheduled by specialist - no need to schedule follow-up
      // But we could create an appointment record in MHA for tracking
    }

    return NextResponse.json({ 
      ok: true, 
      referral_response_id: result.id,
      action: existingReferral ? 'updated' : 'created',
      translated_notes: translatedNote,
      preferred_language: preferredLang,
      follow_up_scheduled: followUpScheduled,
      follow_up_appointment_id: followUpAppointmentId,
    });

  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to process referral response';
    console.error('Referral response webhook error:', err);
    return new NextResponse(message, { status: 500 });
  }
}

