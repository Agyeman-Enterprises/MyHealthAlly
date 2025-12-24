import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabase } from '@/lib/supabase/client';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-12-18.acacia',
});

export async function POST(request: NextRequest) {
  try {
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
    const paymentIntent = await stripe.paymentIntents.create({
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
    // This will be updated when webhook confirms payment
    if (metadata?.patient_id) {
      // Store in patient_payments table (will be created by webhook)
      // For now, just return the client secret
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

