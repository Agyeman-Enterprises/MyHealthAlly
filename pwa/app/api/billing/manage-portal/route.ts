import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/auth-helpers-nextjs';
import { getStripe, getAppBaseUrl } from '@/lib/billing/stripe';
import { supabaseService } from '@/lib/supabase/service';
import { env } from '@/lib/env';

export async function POST(req: Request) {
  try {
    const cookieStore = cookies();
    if (!env.NEXT_PUBLIC_SUPABASE_URL || !env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return new NextResponse('Supabase env not configured', { status: 500 });
    }
    const supabase = createServerClient(
      env.NEXT_PUBLIC_SUPABASE_URL,
      env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll: () => cookieStore.getAll().map(({ name, value }) => ({ name, value })),
          setAll: (cookiesToSet) => {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set({ name, value, ...options });
            });
          },
        },
      }
    );
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    if (!supabaseService) {
      return new NextResponse('Service client not configured', { status: 500 });
    }

    const { data: sub } = await supabaseService
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })
      .limit(1)
      .single();

    if (!sub?.stripe_customer_id) {
      return new NextResponse('No active subscription found', { status: 404 });
    }

    const stripe = getStripe();
    const origin = req.headers.get('origin') || getAppBaseUrl();
    const session = await stripe.billingPortal.sessions.create({
      customer: sub.stripe_customer_id,
      return_url: `${origin}/settings`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unable to open billing portal';
    return new NextResponse(message, { status: 500 });
  }
}
