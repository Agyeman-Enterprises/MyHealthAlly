/**
 * Stripe Client
 * Handles Stripe payment integration with MHA payment indicator
 */

import { loadStripe, Stripe } from '@stripe/stripe-js';

const STRIPE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '';

let stripePromise: Promise<Stripe | null>;

export function getStripe(): Promise<Stripe | null> {
  if (!stripePromise) {
    stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);
  }
  return stripePromise;
}

export interface PaymentIntentRequest {
  amount: number; // in cents
  currency?: string;
  description?: string;
  metadata?: {
    patient_id?: string;
    invoice_id?: string;
    source: 'mha'; // MHA payment indicator
    [key: string]: string | undefined;
  };
}

export interface PaymentIntentResponse {
  clientSecret: string;
  paymentIntentId: string;
}

/**
 * Create a payment intent via API route
 */
export async function createPaymentIntent(
  request: PaymentIntentRequest
): Promise<PaymentIntentResponse> {
  const response = await fetch('/api/payments/create-intent', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ...request,
      metadata: {
        ...request.metadata,
        source: 'mha', // Always mark as MHA payment
      },
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create payment intent');
  }

  return response.json();
}

