/**
 * Practice Subscription Billing Utilities
 * 
 * Handles Stripe integration for practice subscriptions
 */

import Stripe from 'stripe';
import { getStripe } from './stripe';
import { env } from '@/lib/env';
import { createClient } from '@supabase/supabase-js';
import { PRICING_PLANS, type PlanType } from '@/lib/pricing/plans';

const supabase = env.SUPABASE_SERVICE_ROLE_KEY
  ? createClient(env.NEXT_PUBLIC_SUPABASE_URL || '', env.SUPABASE_SERVICE_ROLE_KEY)
  : null;

/**
 * Create Stripe checkout session for practice subscription
 */
export async function createPracticeCheckoutSession(
  practiceId: string,
  planId: PlanType,
  returnUrl: string
): Promise<string> {
  const stripe = getStripe();
  if (!stripe) {
    throw new Error('Stripe not configured');
  }

  const plan = PRICING_PLANS[planId];
  if (!plan || plan.price === 0) {
    throw new Error('Invalid plan or custom pricing required');
  }

  // Create or get Stripe customer for practice
  let customerId: string;
  const existingSubResult = await supabase
    ?.from('practice_subscriptions')
    .select('stripe_customer_id')
    .eq('practice_id', practiceId)
    .eq('status', 'active')
    .single();

  if (existingSubResult?.data?.stripe_customer_id) {
    customerId = existingSubResult.data.stripe_customer_id;
  } else {
    // Get practice info for customer creation
    const practiceResult = await supabase
      ?.from('practices')
      .select('name, email')
      .eq('practice_id', practiceId)
      .single();
    
    const practice = practiceResult?.data;

    const customer = await stripe.customers.create({
      email: practice?.email || undefined,
      name: practice?.name || `Practice ${practiceId}`,
      metadata: {
        practice_id: practiceId,
        source: 'mha',
      },
    });
    customerId = customer.id;
  }

  // Create Stripe price if it doesn't exist (or use existing)
  // For now, we'll create a one-time price for the subscription
    const price = await stripe.prices.create({
      unit_amount: Math.round(plan.price * 100), // Convert to cents
      currency: 'usd',
      recurring: {
        interval: plan.billingCycle === 'annual' ? 'year' : 'month',
      },
      product_data: {
        name: plan.name,
      },
      metadata: {
        plan_id: planId,
        practice_id: practiceId,
        description: plan.description,
      },
    });

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    line_items: [
      {
        price: price.id,
        quantity: 1,
      },
    ],
    metadata: {
      practice_id: practiceId,
      plan_id: planId,
    },
    success_url: `${returnUrl}?success=1&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${returnUrl}?cancel=1`,
    subscription_data: {
      metadata: {
        practice_id: practiceId,
        plan_id: planId,
      },
    },
  });

  return session.url || '';
}

/**
 * Update practice subscription from Stripe webhook
 */
export async function upsertPracticeSubscription(payload: {
  practiceId?: string;
  planId?: string;
  customerId?: string;
  subscriptionId?: string;
  status?: string;
  currentPeriodStart?: number;
  currentPeriodEnd?: number;
}): Promise<void> {
  if (!supabase) return;

  const {
    practiceId,
    planId,
    customerId,
    subscriptionId,
    status,
    currentPeriodStart,
    currentPeriodEnd,
  } = payload;

  if (!practiceId || !subscriptionId || !planId) return;

  await supabase
    .from('practice_subscriptions')
    .upsert(
      {
        practice_id: practiceId,
        plan_id: planId,
        stripe_customer_id: customerId || undefined,
        stripe_subscription_id: subscriptionId,
        status: status || 'active',
        current_period_start: currentPeriodStart
          ? new Date(currentPeriodStart * 1000).toISOString()
          : undefined,
        current_period_end: currentPeriodEnd
          ? new Date(currentPeriodEnd * 1000).toISOString()
          : undefined,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'stripe_subscription_id' }
    );
}

/**
 * Get practice subscription
 */
export async function getPracticeSubscription(
  practiceId: string
): Promise<{
  id: string;
  planId: string;
  status: string;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
} | null> {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('practice_subscriptions')
    .select('id, plan_id, status, current_period_start, current_period_end')
    .eq('practice_id', practiceId)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error || !data) return null;

  return {
    id: data.id,
    planId: data.plan_id,
    status: data.status,
    currentPeriodStart: data.current_period_start,
    currentPeriodEnd: data.current_period_end,
  };
}
