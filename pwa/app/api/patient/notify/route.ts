import { NextResponse } from 'next/server';
import { translateText } from '@/lib/utils/translate';
import { supabaseService } from '@/lib/supabase/service';
import { env } from '@/lib/env';

type StatusUpdate = {
  id: string;
  type: 'lab' | 'refill' | 'referral' | 'question' | 'appointment' | 'results';
  status: 'NEW' | 'PEND' | 'DONE';
  actionTaken?: 'approve' | 'deny' | 'edit' | 'message' | 'schedule' | 'escalate';
  messageToPatient?: string;
  scheduledAt?: string;
  updatedAt?: string;
  patient_id?: string;
};

export async function POST(req: Request) {
  try {
    const signature = req.headers.get('x-mha-signature');
    if (!env.INBOUND_WEBHOOK_SECRET || signature !== env.INBOUND_WEBHOOK_SECRET) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = (await req.json()) as StatusUpdate;
    if (!body?.id || !body?.type || !body?.status) {
      return new NextResponse('Invalid payload', { status: 400 });
    }

    // Determine patient preferred language (fallback to 'en')
    let preferredLang = 'en';
    if (body.patient_id && supabaseService) {
      try {
        const { data: patientRow } = await supabaseService
          .from('patients')
          .select('id,user_id,preferred_language,users(preferred_language)')
          .eq('id', body.patient_id)
          .single();
        const langFromPatient = (patientRow as { preferred_language?: string })?.preferred_language;
        const langFromUser = (patientRow as { users?: { preferred_language?: string } })?.users?.preferred_language;
        preferredLang = langFromPatient || langFromUser || 'en';
      } catch {
        // best effort
      }
    }

    const translated = body.messageToPatient
      ? await translateText(body.messageToPatient, preferredLang)
      : { translatedText: '', detectedLang: preferredLang };

    // TODO: persist update, translate to patient notification/timeline entry, store translated.translatedText

    return NextResponse.json({ ok: true, translatedText: translated.translatedText, preferredLang });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to process';
    return new NextResponse(message, { status: 500 });
  }
}
