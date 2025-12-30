import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { cookies } from 'next/headers';
import { getStripe, getPriceIdForPlan, getAppBaseUrl } from '@/lib/billing/stripe';
import { PLAN_DEFS, type PlanId } from '@/lib/billing/plans';
import { createServerClient } from '@supabase/auth-helpers-nextjs';
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

    const body = await req.json().catch(() => ({}));
    const planId = body.planId as PlanId | undefined;
    if (!planId || !PLAN_DEFS[planId]) {
      return new NextResponse('Invalid plan', { status: 400 });
    }

    const priceId = getPriceIdForPlan(planId);
    if (!priceId) {
      return new NextResponse('Stripe price not configured for this plan', { status: 500 });
    }

    const stripe = getStripe();
    const origin = req.headers.get('origin') || getAppBaseUrl();
    const successUrl = `${origin}/pricing?success=1`;
    const cancelUrl = `${origin}/pricing?cancel=1`;

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      metadata: {
        user_id: user.id,
        plan_id: planId,
      },
      success_url: successUrl,
      cancel_url: cancelUrl,
    };
    if (user.email) {
      sessionParams.customer_email = user.email;
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    return NextResponse.json({ url: session.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unable to start checkout';
    return new NextResponse(message, { status: 500 });
  }
}
