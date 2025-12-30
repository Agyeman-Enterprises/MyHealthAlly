import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getStripe } from '@/lib/billing/stripe';
import { supabaseService } from '@/lib/supabase/service';
import { env } from '@/lib/env';
import { PRICE_ID_MAP, type PlanId } from '@/lib/billing/plans';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function upsertSubscription(payload: {
  userId?: string | null;
  planId?: PlanId | null;
  customerId?: string | null;
  subscriptionId?: string | null;
  status?: string | null;
  currentPeriodStart?: number | null;
  currentPeriodEnd?: number | null;
}) {
  if (!supabaseService) return;
  const { userId, planId, customerId, subscriptionId, status, currentPeriodStart, currentPeriodEnd } = payload;
  if (!userId || !subscriptionId || !planId) return;

  await supabaseService
    .from('subscriptions')
    .upsert(
      {
        user_id: userId,
        plan_id: planId,
        stripe_customer_id: customerId ?? undefined,
        stripe_subscription_id: subscriptionId,
        status: status ?? undefined,
        current_period_start: currentPeriodStart ? new Date(currentPeriodStart * 1000).toISOString() : undefined,
        current_period_end: currentPeriodEnd ? new Date(currentPeriodEnd * 1000).toISOString() : undefined,
      },
      { onConflict: 'stripe_subscription_id' }
    );
}

function mapPriceToPlan(priceId?: string | null): PlanId | null {
  const entries = Object.entries(PRICE_ID_MAP) as Array<[PlanId, string | undefined]>;
  for (const [planId, pid] of entries) {
    if (pid && pid === priceId) return planId;
  }
  return null;
}

export async function POST(req: Request) {
  const sigHeader = req.headers.get('stripe-signature');
  if (!env.STRIPE_WEBHOOK_SECRET || !sigHeader) {
    return new NextResponse('Missing signature', { status: 400 });
  }

  // Optional secondary secret header for parity with patient webhooks
  const mhaSignature = req.headers.get('x-mha-signature');
  if (env.INBOUND_WEBHOOK_SECRET && mhaSignature !== env.INBOUND_WEBHOOK_SECRET) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  if (!env.STRIPE_WEBHOOK_SECRET) {
    return new NextResponse('Webhook secret not configured', { status: 500 });
  }
  if (!supabaseService) {
    return new NextResponse('Supabase service not configured', { status: 500 });
  }

  const stripe = getStripe();
  const text = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(text, sigHeader, env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Invalid signature';
    return new NextResponse(message, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const subId = typeof session.subscription === 'string' ? session.subscription : session.subscription?.id;
        const priceId = session.line_items?.data?.[0]?.price?.id || undefined;
        const planId = (session.metadata?.['plan_id'] as PlanId | undefined) || mapPriceToPlan(priceId);
        await upsertSubscription({
          userId: session.metadata?.['user_id'] ?? null,
          planId: planId ?? null,
          customerId: session.customer?.toString() ?? null,
          subscriptionId: subId ?? null,
          status: session.status ?? null,
          currentPeriodStart: session.created,
          currentPeriodEnd: session.expires_at,
        });
        break;
      }
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;
        const planId = mapPriceToPlan(sub.items.data[0]?.price?.id || undefined);
        const userId = (sub.metadata?.['user_id'] as string | undefined) ?? null;
        const periodStart = (sub as Stripe.Subscription & { current_period_start?: number }).current_period_start;
        const periodEnd = (sub as Stripe.Subscription & { current_period_end?: number }).current_period_end;
        await upsertSubscription({
          userId,
          planId: planId ?? null,
          customerId: sub.customer?.toString() ?? null,
          subscriptionId: sub.id,
          status: sub.status,
          currentPeriodStart: periodStart ?? null,
          currentPeriodEnd: periodEnd ?? null,
        });
        break;
      }
      default:
        // No-op for other events
        break;
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Webhook handling failed';
    return new NextResponse(message, { status: 500 });
  }
}
