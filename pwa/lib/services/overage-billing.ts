/**
 * Overage Billing Service
 * 
 * Calculates and manages overage charges for AI interactions
 */

import { createClient } from '@supabase/supabase-js';
import { env } from '@/lib/env';
import { getUsageSummary } from './ai-usage-tracking';

const supabase = env.SUPABASE_SERVICE_ROLE_KEY
  ? createClient(env.NEXT_PUBLIC_SUPABASE_URL || '', env.SUPABASE_SERVICE_ROLE_KEY)
  : null;

export interface OverageCalculation {
  includedInteractions: number;
  actualInteractions: number;
  overageInteractions: number;
  overageRateCents: number;
  totalChargeCents: number;
}

/**
 * Calculate overage for a user subscription
 */
export async function calculateUserOverage(
  subscriptionId: string,
  periodStart?: Date
): Promise<OverageCalculation> {
  if (!supabase) {
    throw new Error('Supabase service role not configured');
  }

  const period = periodStart || new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const periodStartStr = period.toISOString().split('T')[0];

  // Use database function
  const { data, error } = await supabase.rpc('calculate_subscription_overage', {
    p_subscription_id: subscriptionId,
    p_period_start: periodStartStr,
  });

  if (error) {
    console.error('Error calculating overage:', error);
    throw new Error(`Failed to calculate overage: ${error.message}`);
  }

  if (!data || data.length === 0) {
    return {
      includedInteractions: 0,
      actualInteractions: 0,
      overageInteractions: 0,
      overageRateCents: 0,
      totalChargeCents: 0,
    };
  }

  const result = data[0];
  return {
    includedInteractions: result.included_interactions || 0,
    actualInteractions: Number(result.actual_interactions) || 0,
    overageInteractions: Number(result.overage_interactions) || 0,
    overageRateCents: result.overage_rate_cents || 0,
    totalChargeCents: Number(result.total_charge_cents) || 0,
  };
}

/**
 * Calculate overage for a practice subscription
 */
export async function calculatePracticeOverage(
  practiceSubscriptionId: string,
  periodStart?: Date
): Promise<OverageCalculation> {
  if (!supabase) {
    throw new Error('Supabase service role not configured');
  }

  const period = periodStart || new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const periodStartStr = period.toISOString().split('T')[0];

  // Use database function
  const { data, error } = await supabase.rpc('calculate_practice_overage', {
    p_practice_subscription_id: practiceSubscriptionId,
    p_period_start: periodStartStr,
  });

  if (error) {
    console.error('Error calculating practice overage:', error);
    throw new Error(`Failed to calculate practice overage: ${error.message}`);
  }

  if (!data || data.length === 0) {
    return {
      includedInteractions: 0,
      actualInteractions: 0,
      overageInteractions: 0,
      overageRateCents: 0,
      totalChargeCents: 0,
    };
  }

  const result = data[0];
  return {
    includedInteractions: result.included_interactions || 0,
    actualInteractions: Number(result.actual_interactions) || 0,
    overageInteractions: Number(result.overage_interactions) || 0,
    overageRateCents: result.overage_rate_cents || 0,
    totalChargeCents: Number(result.total_charge_cents) || 0,
  };
}

/**
 * Create overage charge record
 */
export async function createOverageCharge(
  subscriptionId: string,
  calculation: OverageCalculation,
  periodStart: Date,
  periodEnd: Date
): Promise<string> {
  if (!supabase) {
    throw new Error('Supabase service role not configured');
  }

  if (calculation.overageInteractions === 0) {
    // No overage, skip creating charge
    return '';
  }

  const { data, error } = await supabase
    .from('overage_charges')
    .insert({
      subscription_id: subscriptionId,
      period_start: periodStart.toISOString().split('T')[0],
      period_end: periodEnd.toISOString().split('T')[0],
      included_interactions: calculation.includedInteractions,
      actual_interactions: calculation.actualInteractions,
      overage_interactions: calculation.overageInteractions,
      overage_rate_cents: calculation.overageRateCents,
      total_charge_cents: calculation.totalChargeCents,
      status: 'pending',
    })
    .select('id')
    .single();

  if (error) {
    console.error('Error creating overage charge:', error);
    throw new Error(`Failed to create overage charge: ${error.message}`);
  }

  return data.id;
}

/**
 * Create practice overage charge record
 */
export async function createPracticeOverageCharge(
  practiceSubscriptionId: string,
  calculation: OverageCalculation,
  periodStart: Date,
  periodEnd: Date
): Promise<string> {
  if (!supabase) {
    throw new Error('Supabase service role not configured');
  }

  if (calculation.overageInteractions === 0) {
    // No overage, skip creating charge
    return '';
  }

  const { data, error } = await supabase
    .from('overage_charges')
    .insert({
      practice_subscription_id: practiceSubscriptionId,
      period_start: periodStart.toISOString().split('T')[0],
      period_end: periodEnd.toISOString().split('T')[0],
      included_interactions: calculation.includedInteractions,
      actual_interactions: calculation.actualInteractions,
      overage_interactions: calculation.overageInteractions,
      overage_rate_cents: calculation.overageRateCents,
      total_charge_cents: calculation.totalChargeCents,
      status: 'pending',
    })
    .select('id')
    .single();

  if (error) {
    console.error('Error creating practice overage charge:', error);
    throw new Error(`Failed to create practice overage charge: ${error.message}`);
  }

  return data.id;
}

/**
 * Get pending overage charges
 */
export async function getPendingOverageCharges(): Promise<Array<{
  id: string;
  subscriptionId?: string;
  practiceSubscriptionId?: string;
  totalChargeCents: number;
  periodStart: string;
  periodEnd: string;
}>> {
  if (!supabase) {
    throw new Error('Supabase service role not configured');
  }

  const { data, error } = await supabase
    .from('overage_charges')
    .select('id, subscription_id, practice_subscription_id, total_charge_cents, period_start, period_end')
    .eq('status', 'pending')
    .order('period_start', { ascending: false });

  if (error) {
    console.error('Error fetching pending overage charges:', error);
    throw new Error(`Failed to fetch pending overage charges: ${error.message}`);
  }

  return (data || []).map((charge) => ({
    id: charge.id,
    subscriptionId: charge.subscription_id || undefined,
    practiceSubscriptionId: charge.practice_subscription_id || undefined,
    totalChargeCents: charge.total_charge_cents || 0,
    periodStart: charge.period_start,
    periodEnd: charge.period_end,
  }));
}
