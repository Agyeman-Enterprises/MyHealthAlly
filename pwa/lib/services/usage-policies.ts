/**
 * Usage Policies
 * 
 * Defines how overages are handled for different plan types
 */

export type OveragePolicy = 
  | 'block'              // Hard limit - block all requests when exceeded
  | 'allow_with_billing' // Soft limit - allow but charge for overage (default)
  | 'throttle';          // Throttle requests when exceeded

/**
 * Get overage policy for a plan
 */
export function getOveragePolicy(planId: string): OveragePolicy {
  // Individual plans: allow with billing
  if (planId === 'individual') {
    return 'allow_with_billing';
  }

  // Practice plans: allow with billing (default)
  if (planId.startsWith('practice-')) {
    return 'allow_with_billing';
  }

  // Enterprise: allow with billing (higher limits, but still track)
  if (planId === 'enterprise-plus') {
    return 'allow_with_billing';
  }

  // Default: allow with billing
  return 'allow_with_billing';
}

/**
 * Check if a plan allows overages
 */
export function allowsOverage(planId: string): boolean {
  const policy = getOveragePolicy(planId);
  return policy === 'allow_with_billing';
}
