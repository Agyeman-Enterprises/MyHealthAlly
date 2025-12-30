import { NextResponse } from 'next/server';
import { translateText } from '@/lib/utils/translate';
import { supabaseService } from '@/lib/supabase/service';
import { env } from '@/lib/env';

type CareTeamMessagePayload = {
  thread_id?: string;
  patient_id: string;
  message_id: string;
  body: string;
  attachments?: Array<{ type: string; url: string; name?: string }>;
  sentAt?: string;
  from?: { role?: string; name?: string };
};

export async function POST(req: Request) {
  try {
    const signature = req.headers.get('x-mha-signature');
    if (!env.INBOUND_WEBHOOK_SECRET || signature !== env.INBOUND_WEBHOOK_SECRET) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = (await req.json()) as CareTeamMessagePayload;
    if (!body?.patient_id || !body?.message_id || !body?.body) {
      return new NextResponse('Invalid payload', { status: 400 });
    }

    // Determine patient preferred language (fallback to 'en')
    let preferredLang = 'en';
    if (supabaseService) {
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

    const { translatedText } = await translateText(body.body, preferredLang);

    // TODO: persist message, notify patient, link to thread, store translatedText

    return NextResponse.json({ ok: true, translatedText, preferredLang });

  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to process';
    return new NextResponse(message, { status: 500 });
  }
}
