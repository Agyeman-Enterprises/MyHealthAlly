/**
 * AI Usage Tracking Service
 * 
 * Tracks AI interactions for billing and usage monitoring
 */

import { createClient } from '@supabase/supabase-js';
import { env } from '@/lib/env';

const supabase = env.SUPABASE_SERVICE_ROLE_KEY
  ? createClient(env.NEXT_PUBLIC_SUPABASE_URL || '', env.SUPABASE_SERVICE_ROLE_KEY)
  : null;

export interface AIUsageRecord {
  subscriptionId?: string;
  practiceSubscriptionId?: string;
  userId?: string;
  interactionType: 'chat' | 'symptom_analysis' | 'discharge_parse' | 'medication_parse' | 'other';
  tokensUsed: number;
  inputTokens: number;
  outputTokens: number;
  costCents: number;
  metadata?: Record<string, unknown>;
}

/**
 * Calculate cost in cents based on token usage
 * Using Anthropic Claude pricing: $3/1M input, $15/1M output
 */
function calculateCost(inputTokens: number, outputTokens: number): number {
  const inputCostPerMillion = 3.0; // $3 per 1M tokens
  const outputCostPerMillion = 15.0; // $15 per 1M tokens
  
  const inputCost = (inputTokens / 1_000_000) * inputCostPerMillion;
  const outputCost = (outputTokens / 1_000_000) * outputCostPerMillion;
  
  // Convert to cents
  return Math.round((inputCost + outputCost) * 100);
}

/**
 * Get current billing period (month)
 */
function getCurrentPeriod(): { start: Date; end: Date } {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  
  return { start, end };
}

/**
 * Record an AI interaction
 */
export async function recordAIUsage(record: AIUsageRecord): Promise<void> {
  if (!supabase) {
    console.error('Supabase service role not configured');
    return;
  }

  const { start, end } = getCurrentPeriod();
  const costCents = record.costCents || calculateCost(record.inputTokens, record.outputTokens);

  const { error } = await supabase
    .from('ai_usage_tracking')
    .insert({
      subscription_id: record.subscriptionId || null,
      practice_subscription_id: record.practiceSubscriptionId || null,
      user_id: record.userId || null,
      interaction_type: record.interactionType,
      tokens_used: record.tokensUsed,
      input_tokens: record.inputTokens,
      output_tokens: record.outputTokens,
      cost_cents: costCents,
      metadata: record.metadata || {},
      period_start: start.toISOString().split('T')[0],
      period_end: end.toISOString().split('T')[0],
    });

  if (error) {
    console.error('Error recording AI usage:', error);
    throw new Error(`Failed to record AI usage: ${error.message}`);
  }
}

/**
 * Get usage summary for a subscription
 */
export async function getUsageSummary(
  subscriptionId?: string,
  practiceSubscriptionId?: string,
  userId?: string
): Promise<{
  totalInteractions: number;
  totalTokens: number;
  totalCostCents: number;
  periodStart: string;
  periodEnd: string;
}> {
  if (!supabase) {
    throw new Error('Supabase service role not configured');
  }

  const { start, end } = getCurrentPeriod();
  const periodStart = start.toISOString().split('T')[0];
  const periodEnd = end.toISOString().split('T')[0];

  let query = supabase
    .from('ai_usage_tracking')
    .select('tokens_used, cost_cents')
    .eq('period_start', periodStart)
    .eq('period_end', periodEnd);

  if (subscriptionId && typeof subscriptionId === 'string') {
    query = query.eq('subscription_id', subscriptionId);
  } else if (practiceSubscriptionId && typeof practiceSubscriptionId === 'string') {
    query = query.eq('practice_subscription_id', practiceSubscriptionId);
  } else if (userId && typeof userId === 'string') {
    query = query.eq('user_id', userId);
  } else {
    throw new Error('Must provide subscriptionId, practiceSubscriptionId, or userId');
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching usage summary:', error);
    throw new Error(`Failed to fetch usage summary: ${error.message}`);
  }

  const totalInteractions = data?.length || 0;
  const totalTokens = data?.reduce((sum, record) => sum + (record.tokens_used || 0), 0) || 0;
  const totalCostCents = data?.reduce((sum, record) => sum + (record.cost_cents || 0), 0) || 0;

  return {
    totalInteractions,
    totalTokens,
    totalCostCents,
    periodStart: periodStart as string,
    periodEnd: periodEnd as string,
  };
}

/**
 * Check if usage limit is exceeded
 */
export async function checkUsageLimit(
  subscriptionId?: string,
  practiceSubscriptionId?: string,
  userId?: string
): Promise<{
  limit: number | null;
  used: number;
  remaining: number | null;
  exceeded: boolean;
}> {
  if (!supabase) {
    throw new Error('Supabase service role not configured');
  }

  // Get plan limits
  let planId: string | null = null;

  if (subscriptionId) {
    const { data: sub } = await supabase
      .from('subscriptions')
      .select('plan_id')
      .eq('id', subscriptionId)
      .single();
    planId = sub?.plan_id || null;
  } else if (practiceSubscriptionId) {
    const { data: ps } = await supabase
      .from('practice_subscriptions')
      .select('plan_id')
      .eq('id', practiceSubscriptionId)
      .single();
    planId = ps?.plan_id || null;
  } else if (userId) {
    const { data: sub } = await supabase
      .from('subscriptions')
      .select('plan_id')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single();
    planId = sub?.plan_id || null;
  }

  if (!planId) {
    // No active subscription - return unlimited for now (free tier)
    return {
      limit: null,
      used: 0,
      remaining: null,
      exceeded: false,
    };
  }

  const { data: plan } = await supabase
    .from('plans')
    .select('max_ai_interactions')
    .eq('id', planId)
    .single();

  const limit = plan?.max_ai_interactions || null;

  // Get current usage
  const usage = await getUsageSummary(subscriptionId, practiceSubscriptionId, userId);
  const used = usage.totalInteractions;

  const remaining = limit !== null ? Math.max(0, limit - used) : null;
  const exceeded = limit !== null && used >= limit;

  return {
    limit,
    used,
    remaining,
    exceeded,
  };
}
