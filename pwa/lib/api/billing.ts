/**
 * Billing API Client Functions
 * 
 * These functions are meant to be called from event handlers (onClick, onSubmit, etc.)
 * or useEffect hooks, NOT during render. They perform async network operations.
 * 
 * Usage:
 *   const handleCheckout = async () => {
 *     const { url } = await createCheckoutSession('essential');
 *     window.location.href = url;
 *   };
 */

import { PlanId } from '@/lib/billing/plans';

interface CheckoutSessionResponse {
  url: string;
}

interface PortalSessionResponse {
  url: string;
}

/**
 * Create a Stripe checkout session for a subscription plan.
 * Call this from an event handler, not during render.
 */
export async function createCheckoutSession(planId: PlanId): Promise<CheckoutSessionResponse> {
  const controller = new AbortController();
  const requestInit: RequestInit = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ planId }),
    signal: controller.signal,
  };
  const response = await fetch('/api/billing/create-checkout', requestInit);
  if (!response.ok) {
    const errorMessage = await response.text();
    throw new Error(errorMessage || 'Unable to start checkout');
  }
  const jsonData = await response.json();
  const sessionResponse: CheckoutSessionResponse = {
    url: jsonData.url,
  };
  return sessionResponse;
}

/**
 * Create a Stripe billing portal session.
 * Call this from an event handler, not during render.
 */
export async function createPortalSession(): Promise<PortalSessionResponse> {
  const controller = new AbortController();
  const requestInit: RequestInit = {
    method: 'POST',
    signal: controller.signal,
  };
  const response = await fetch('/api/billing/manage-portal', requestInit);
  if (!response.ok) {
    const errorMessage = await response.text();
    throw new Error(errorMessage || 'Unable to open billing portal');
  }
  const jsonData = await response.json();
  const portalResponse: PortalSessionResponse = {
    url: jsonData.url,
  };
  return portalResponse;
}
