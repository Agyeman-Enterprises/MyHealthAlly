import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabase } from '@/lib/supabase/client';

// Lazy initialization to avoid build-time errors when env vars are missing
let stripe: Stripe | null = null;

function getStripe(): Stripe {
  if (!stripe) {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      throw new Error('STRIPE_SECRET_KEY environment variable is not set');
    }
    stripe = new Stripe(secretKey, {
      apiVersion: '2025-12-15.clover',
    });
  }
  return stripe;
}

export async function POST(request: NextRequest) {
  try {
    // Check if Stripe is configured
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: 'Payment processing not configured' },
        { status: 503 }
      );
    }

    const body = await request.json();
    const { amount, currency = 'usd', description, metadata } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount' },
        { status: 400 }
      );
    }

    // Get authenticated user
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Create payment intent with MHA indicator
    const paymentIntent = await getStripe().paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      description: description || 'MyHealth Ally Payment',
      metadata: {
        ...metadata,
        source: 'mha', // MHA payment indicator
        timestamp: new Date().toISOString(),
      },
    });

    // Store payment intent in database for tracking
    if (metadata?.patient_id) {
      try {
        await supabase.from('patient_payments').insert({
          patient_id: metadata.patient_id,
          payment_intent_id: paymentIntent.id,
          amount: Math.round(amount * 100),
          currency,
          status: 'pending',
          description: description || 'MyHealth Ally Payment',
          metadata: {
            ...metadata,
            source: 'mha',
            timestamp: new Date().toISOString(),
          },
          created_at: new Date().toISOString(),
        });
      } catch (dbError) {
        console.error('Failed to store payment intent:', dbError);
        // Continue even if DB storage fails - webhook will handle it
      }
    }

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error: any) {
    console.error('Payment intent creation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create payment intent' },
      { status: 500 }
    );
  }
}

