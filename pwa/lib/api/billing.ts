import { PlanId } from '@/lib/billing/plans';

export async function createCheckoutSession(planId: PlanId) {
  const res = await fetch('/api/billing/create-checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ planId }),
  });
  if (!res.ok) {
    const message = await res.text();
    throw new Error(message || 'Unable to start checkout');
  }
  return res.json() as Promise<{ url: string }>;
}

export async function createPortalSession() {
  const res = await fetch('/api/billing/manage-portal', { method: 'POST' });
  if (!res.ok) {
    const message = await res.text();
    throw new Error(message || 'Unable to open billing portal');
  }
  return res.json() as Promise<{ url: string }>;
}
