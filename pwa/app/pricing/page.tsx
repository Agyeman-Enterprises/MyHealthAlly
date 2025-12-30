'use client';

import { useCallback, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { Card } from '@/components/ui/Card';
import { PLAN_DEFS, type PlanId } from '@/lib/billing/plans';
import { createCheckoutSession } from '@/lib/api/billing';

const corePromise = [
  'Access, continuity, and guided care — not unlimited visits.',
  'You are buying: a care relationship, a response SLA, a clinical backstop, and a guided self-management system.',
  'You are NOT buying: unlimited clinician time, 24/7 emergency care, or instant answers.',
];

const excluded = [
  'Emergency or urgent care',
  'Same-day responses',
  'On-demand video visits',
  'Controlled substance prescribing',
  'Specialist-level management without referral',
  'Crisis mental health services',
  'Unlimited visits',
];

const planOrder: PlanId[] = ['essential', 'complete', 'family', 'premium'];

export default function PricingPage() {
  const params = useSearchParams();
  const [checkingOut, setCheckingOut] = useState<PlanId | null>(null);
  const success = params.get('success') === '1';
  const canceled = params.get('cancel') === '1';

  const plans = useMemo(() => planOrder.map((id) => PLAN_DEFS[id]), []);

  const handleCheckout = useCallback(async (planId: PlanId) => {
    try {
      setCheckingOut(planId);
      const { url } = await createCheckoutSession(planId);
      if (url) window.location.href = url;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to start checkout.';
      alert(message); // inline warning for now
    } finally {
      setCheckingOut(null);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-sky-50 pb-20 md:pb-8">
      <Header />
      <main className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-navy-600">Membership Pricing</h1>
          <p className="text-gray-600 mt-2">Aligned with the published tiers in marketing.</p>
          {success && <p className="text-sm text-green-700 mt-2">Checkout completed. Your subscription will be activated shortly.</p>}
          {canceled && <p className="text-sm text-amber-700 mt-2">Checkout canceled. You can try again anytime.</p>}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {plans.map((plan) => (
            <Card key={plan.id} className="space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm uppercase tracking-wide text-primary-600 font-semibold">{plan.name}</p>
                  <p className="text-3xl font-bold text-navy-700">${(plan.monthly / 100).toFixed(0)}<span className="text-base font-medium text-gray-600">/month</span></p>
                  {plan.description && <p className="text-sm text-gray-600 mt-1">{plan.description}</p>}
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold text-navy-600 mb-1">Includes:</p>
                <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                  {plan.features.map((f) => <li key={f}>{f}</li>)}
                </ul>
              </div>
              <button
                type="button"
                onClick={() => handleCheckout(plan.id)}
                disabled={checkingOut === plan.id}
                className="w-full rounded-lg bg-primary-600 text-white py-2 font-semibold hover:bg-primary-700 disabled:opacity-50"
              >
                {checkingOut === plan.id ? 'Starting checkout…' : 'Get Started'}
              </button>
            </Card>
          ))}
        </div>

        <Card className="space-y-2">
          <h3 className="text-lg font-semibold text-navy-600">Core Promise</h3>
          <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
            {corePromise.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </Card>

        <Card className="space-y-3">
          <h3 className="text-lg font-semibold text-navy-600">Excludes</h3>
          <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
            {excluded.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </Card>

        <Card className="space-y-2 bg-amber-50 border-amber-200">
          <h3 className="text-lg font-semibold text-amber-800">Emergency Disclaimer</h3>
          <p className="text-sm text-amber-800">
            AI-assisted symptom intake is not a diagnosis or medical advice. If you think you may be having an emergency,
            call your local emergency number or go to the nearest emergency department. Same-day responses and emergency care are not included.
          </p>
        </Card>
      </main>
      <BottomNav />
    </div>
  );
}
