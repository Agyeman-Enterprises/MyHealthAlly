import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabase } from '@/lib/supabase/client';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-12-18.acacia',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'No signature' },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    );
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      await handlePaymentSuccess(paymentIntent);
      break;

    case 'payment_intent.payment_failed':
      const failedPayment = event.data.object as Stripe.PaymentIntent;
      await handlePaymentFailure(failedPayment);
      break;

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  return NextResponse.json({ received: true });
}

async function handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
  try {
    const patientId = paymentIntent.metadata?.patient_id;
    const invoiceId = paymentIntent.metadata?.invoice_id;
    const source = paymentIntent.metadata?.source || 'mha'; // MHA payment indicator

    if (!patientId) {
      console.error('No patient_id in payment intent metadata');
      return;
    }

    // Create payment record in database
    const { error } = await supabase
      .from('patient_payments')
      .insert({
        patient_id: patientId,
        amount: paymentIntent.amount / 100, // Convert from cents
        currency: paymentIntent.currency,
        payment_method: 'stripe',
        stripe_payment_intent_id: paymentIntent.id,
        status: 'completed',
        source: source, // MHA payment indicator
        metadata: {
          invoice_id: invoiceId,
          description: paymentIntent.description,
          source: 'mha',
        },
        paid_at: new Date().toISOString(),
      });

    if (error) {
      console.error('Error storing payment:', error);
    }

    // Update invoice status if invoice_id provided
    if (invoiceId) {
      await supabase
        .from('patient_billing')
        .update({ status: 'paid' })
        .eq('id', invoiceId);
    }
  } catch (error) {
    console.error('Error handling payment success:', error);
  }
}

async function handlePaymentFailure(paymentIntent: Stripe.PaymentIntent) {
  try {
    const patientId = paymentIntent.metadata?.patient_id;

    if (!patientId) return;

    // Log failed payment
    const { error } = await supabase
      .from('patient_payments')
      .insert({
        patient_id: patientId,
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency,
        payment_method: 'stripe',
        stripe_payment_intent_id: paymentIntent.id,
        status: 'failed',
        source: 'mha',
        metadata: {
          failure_reason: paymentIntent.last_payment_error?.message,
        },
      });

    if (error) {
      console.error('Error storing failed payment:', error);
    }
  } catch (error) {
    console.error('Error handling payment failure:', error);
  }
}

