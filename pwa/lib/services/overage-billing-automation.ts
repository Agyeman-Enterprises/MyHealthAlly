/**
 * Overage Billing Automation
 * 
 * Automatically calculates and bills overages at the end of each billing period
 * This should be run as a scheduled job (cron) at the end of each month
 */

import { createClient } from '@supabase/supabase-js';
import { env } from '@/lib/env';
import { calculateUserOverage, calculatePracticeOverage, createOverageCharge, createPracticeOverageCharge } from './overage-billing';
import { getStripe } from '@/lib/billing/stripe';

const supabase = env.SUPABASE_SERVICE_ROLE_KEY
  ? createClient(env.NEXT_PUBLIC_SUPABASE_URL || '', env.SUPABASE_SERVICE_ROLE_KEY)
  : null;

/**
 * Process overages for all active subscriptions
 * 
 * This should be called at the end of each billing period (monthly)
 * It will:
 * 1. Calculate overages for all active subscriptions
 * 2. Create overage charge records
 * 3. Create Stripe invoices for overages
 */
export async function processMonthlyOverages(): Promise<{
  processed: number;
  totalOverageCents: number;
  errors: Array<{ subscriptionId: string; error: string }>;
}> {
  if (!supabase) {
    throw new Error('Supabase service role not configured');
  }

  const errors: Array<{ subscriptionId: string; error: string }> = [];
  let totalOverageCents = 0;
  let processed = 0;

  // Get last month's period
  const now = new Date();
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

  // Process user subscriptions
  const { data: userSubscriptions } = await supabase
    .from('subscriptions')
    .select('id, user_id, plan_id, stripe_customer_id')
    .eq('status', 'active');

  if (userSubscriptions) {
    for (const sub of userSubscriptions) {
      try {
        const overage = await calculateUserOverage(sub.id, lastMonth);
        
        if (overage.overageInteractions > 0) {
          // Create overage charge record
          const chargeId = await createOverageCharge(
            sub.id,
            overage,
            lastMonth,
            lastMonthEnd
          );

          // Create Stripe invoice item for overage
          if (sub.stripe_customer_id && chargeId) {
            await createStripeOverageInvoiceItem(
              sub.stripe_customer_id,
              overage.totalChargeCents,
              `AI Interactions Overage - ${overage.overageInteractions} interactions`,
              chargeId
            );
          }

          totalOverageCents += overage.totalChargeCents;
          processed++;
        }
      } catch (error) {
        errors.push({
          subscriptionId: sub.id,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }
  }

  // Process practice subscriptions
  const { data: practiceSubscriptions } = await supabase
    .from('practice_subscriptions')
    .select('id, practice_id, plan_id, stripe_customer_id')
    .eq('status', 'active');

  if (practiceSubscriptions) {
    for (const sub of practiceSubscriptions) {
      try {
        const overage = await calculatePracticeOverage(sub.id, lastMonth);
        
        if (overage.overageInteractions > 0) {
          // Create overage charge record
          const chargeId = await createPracticeOverageCharge(
            sub.id,
            overage,
            lastMonth,
            lastMonthEnd
          );

          // Create Stripe invoice item for overage
          if (sub.stripe_customer_id && chargeId) {
            await createStripeOverageInvoiceItem(
              sub.stripe_customer_id,
              overage.totalChargeCents,
              `AI Interactions Overage - ${overage.overageInteractions} interactions`,
              chargeId
            );
          }

          totalOverageCents += overage.totalChargeCents;
          processed++;
        }
      } catch (error) {
        errors.push({
          subscriptionId: sub.id,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }
  }

  return {
    processed,
    totalOverageCents,
    errors,
  };
}

/**
 * Create a Stripe invoice item for overage charges
 */
async function createStripeOverageInvoiceItem(
  customerId: string,
  amountCents: number,
  description: string,
  chargeId: string
): Promise<void> {
  const stripe = getStripe();
  if (!stripe) {
    throw new Error('Stripe not configured');
  }

  try {
    await stripe.invoiceItems.create({
      customer: customerId,
      amount: amountCents,
      currency: 'usd',
      description,
      metadata: {
        charge_id: chargeId,
        type: 'overage',
        source: 'mha',
      },
    });

    // Update overage charge status to 'invoiced'
    if (supabase) {
      await supabase
        .from('overage_charges')
        .update({ status: 'invoiced' })
        .eq('id', chargeId);
    }
  } catch (error) {
    console.error('Error creating Stripe invoice item:', error);
    throw error;
  }
}
