/**
 * Usage Throttling Service
 * 
 * Enforces usage limits and handles overage policies
 */

import { createClient } from '@supabase/supabase-js';
import { env } from '@/lib/env';
import { checkUsageLimit } from './ai-usage-tracking';
import { OveragePolicy } from './usage-policies';

const supabase = env.SUPABASE_SERVICE_ROLE_KEY
  ? createClient(env.NEXT_PUBLIC_SUPABASE_URL || '', env.SUPABASE_SERVICE_ROLE_KEY)
  : null;

export interface ThrottleResult {
  allowed: boolean;
  reason?: string;
  remaining?: number | null;
  limit?: number | null;
  overageAllowed?: boolean;
  overageRate?: number;
}

/**
 * Check if an AI interaction should be allowed
 * 
 * Policies:
 * - Hard limit: Block if exceeded (for strict plans)
 * - Soft limit: Allow with overage billing (default)
 * - Unlimited: Always allow (enterprise plans)
 */
export async function throttleAIUsage(
  subscriptionId?: string,
  practiceSubscriptionId?: string,
  userId?: string,
  policy: OveragePolicy = 'allow_with_billing'
): Promise<ThrottleResult> {
  try {
    const usageCheck = await checkUsageLimit(subscriptionId, practiceSubscriptionId, userId);
    
    // Unlimited plan - always allow
    if (usageCheck.limit === null) {
      return {
        allowed: true,
        remaining: null,
        limit: null,
      };
    }

    // Within limit - allow
    if (!usageCheck.exceeded) {
      return {
        allowed: true,
        remaining: usageCheck.remaining || 0,
        limit: usageCheck.limit,
      };
    }

    // Limit exceeded - apply policy
    switch (policy) {
      case 'block':
        // Hard limit - block all overage
        return {
          allowed: false,
          reason: `You've reached your monthly limit of ${usageCheck.limit.toLocaleString()} AI interactions. Please upgrade your plan or wait until next month.`,
          remaining: 0,
          limit: usageCheck.limit,
          overageAllowed: false,
        };

      case 'allow_with_billing':
        // Soft limit - allow but track for billing
        // Get overage rate from plan
        const overageRate = await getOverageRate(subscriptionId, practiceSubscriptionId, userId);
        
        return {
          allowed: true,
          reason: `You've exceeded your monthly limit. Additional interactions will be charged at $${(overageRate / 100).toFixed(3)} per interaction.`,
          remaining: 0,
          limit: usageCheck.limit,
          overageAllowed: true,
          overageRate,
        };

      case 'throttle':
        // Throttle - allow but with rate limiting
        return {
          allowed: true,
          reason: `You've exceeded your monthly limit. Requests are now rate-limited.`,
          remaining: 0,
          limit: usageCheck.limit,
          overageAllowed: false,
        };

      default:
        // Default to allow with billing
        return {
          allowed: true,
          remaining: 0,
          limit: usageCheck.limit,
          overageAllowed: true,
        };
    }
  } catch (error) {
    console.error('Error checking usage throttle:', error);
    // On error, allow the request (fail open)
    // Log for monitoring but don't block users
    return {
      allowed: true,
      reason: 'Unable to verify usage limits. Request allowed.',
    };
  }
}

/**
 * Get overage rate for a subscription
 */
async function getOverageRate(
  subscriptionId?: string,
  practiceSubscriptionId?: string,
  userId?: string
): Promise<number> {
  if (!supabase) {
    return 8; // Default $0.008 per interaction
  }

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
    return 8; // Default
  }

  const { data: plan } = await supabase
    .from('plans')
    .select('ai_overage_rate_cents')
    .eq('id', planId)
    .single();

  return plan?.ai_overage_rate_cents || 8; // Default to $0.008
}
