import Stripe from 'stripe';
import { env } from '@/lib/env';
import { PRICE_ID_MAP, type PlanId } from './plans';

export function getStripe() {
  if (!env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY not configured');
  }
  return new Stripe(env.STRIPE_SECRET_KEY, { apiVersion: '2024-10-28.acacia' as Stripe.LatestApiVersion });
}

export function getPriceIdForPlan(planId: PlanId) {
  return PRICE_ID_MAP[planId];
}

export function getAppBaseUrl(fallbackOrigin?: string) {
  return env.NEXT_PUBLIC_APP_URL || fallbackOrigin || 'http://localhost:3000';
}
