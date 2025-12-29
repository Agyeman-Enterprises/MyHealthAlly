'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth-store';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import type { Stripe } from '@stripe/stripe-js';
import { getStripe, createPaymentIntent } from '@/lib/stripe/client';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { DisclaimerBanner } from '@/components/governance/DisclaimerBanner';

function PaymentForm() {
  const router = useRouter();
  const stripe = useStripe();
  const elements = useElements();
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    const amountNum = parseFloat(amount);
    if (!amountNum || amountNum <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Get patient ID
      const { data: { user } } = await (await import('@/lib/supabase/client')).supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: userRecord } = await (await import('@/lib/supabase/client')).supabase
        .from('users')
        .select('id, patients(id)')
        .eq('supabase_auth_id', user.id)
        .single();

      if (!userRecord || !userRecord.patients) {
        throw new Error('Patient record not found');
      }

      const patientsArray = Array.isArray(userRecord.patients) ? userRecord.patients : [userRecord.patients];
      const patientId = patientsArray[0]?.id;
      if (!patientId) throw new Error('Patient ID not found');

      // Create payment intent
      const { clientSecret } = await createPaymentIntent({
        amount: amountNum,
        description: description || 'MyHealth Ally Payment',
        metadata: {
          patient_id: patientId,
          source: 'mha', // MHA payment indicator
        },
      });

      // Confirm payment with Stripe
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        setError('Card element not found');
        setLoading(false);
        return;
      }
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
        },
      });

      if (stripeError) {
        setError(stripeError.message || 'Payment failed');
        setLoading(false);
        return;
      }

      if (paymentIntent?.status === 'succeeded') {
        router.push('/payments?payment-success=true');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Payment failed';
      setError(errorMessage);
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Input
        id="amount"
        name="amount"
        label="Payment Amount *"
        type="number"
        step="0.01"
        min="0.01"
        placeholder="0.00"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        required
        icon={
          <span className="text-gray-500">$</span>
        }
      />

      <Input
        id="description"
        name="description"
        label="Description (Optional)"
        type="text"
        placeholder="e.g., Payment for services"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Card Information *
        </label>
        <div className="border-2 border-gray-200 rounded-xl p-4">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#424770',
                  '::placeholder': {
                    color: '#aab7c4',
                  },
                },
                invalid: {
                  color: '#9e2146',
                },
              },
            }}
          />
        </div>
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 border-2 border-red-200 p-4">
          <p className="text-sm font-medium text-red-800">{error}</p>
        </div>
      )}

      <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
        <p className="text-sm text-blue-800">
          <strong>Secure Payment:</strong> Your payment is processed securely through Stripe. We do not store your card information.
        </p>
      </div>

      <Button
        type="submit"
        variant="primary"
        size="lg"
        isLoading={loading}
        disabled={!stripe || !amount || parseFloat(amount) <= 0}
        className="w-full"
      >
        Pay ${amount || '0.00'}
      </Button>
    </form>
  );
}

export default function MakePaymentPage() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [stripePromise, setStripePromise] = useState<Promise<Stripe | null> | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
    }
    setStripePromise(getStripe());
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50/30 pb-20 md:pb-8">
      <Header title="Make Payment" showBack />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <DisclaimerBanner type="standard" className="mb-6" />

        <Card variant="elevated" className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Payment</h2>
          {stripePromise && (
            <Elements stripe={stripePromise}>
              <PaymentForm />
            </Elements>
          )}
        </Card>
      </main>

      <BottomNav />
    </div>
  );
}

