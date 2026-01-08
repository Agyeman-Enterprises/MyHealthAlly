/**
 * Pricing Page
 * 
 * Display pricing plans and allow users to subscribe/upgrade/downgrade
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useRequireAuth } from '@/lib/auth/use-require-auth';
import { useAuthStore } from '@/lib/store/auth-store';
import { supabase } from '@/lib/supabase/client';
import { Header } from '@/components/layout/Header';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { 
  PRICING_PLANS, 
  getAllPlans, 
  formatPrice, 
  getAnnualPrice,
  type PlanType 
} from '@/lib/pricing/plans';
import { getUsageSummary, checkUsageLimit } from '@/lib/services/ai-usage-tracking';

export default function PricingPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useRequireAuth();
  const userId = useAuthStore((state) => state.user?.id);
  const [currentPlan, setCurrentPlan] = useState<PlanType | null>(null);
  const [usage, setUsage] = useState<{
    used: number;
    limit: number | null;
    remaining: number | null;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

  useEffect(() => {
    if (isAuthenticated && userId) {
      loadCurrentSubscription();
    }
  }, [isAuthenticated, userId]);

  const loadCurrentSubscription = async () => {
    try {
      // Get current subscription
      const { data: sub } = await supabase
        .from('subscriptions')
        .select('plan_id, status')
        .eq('user_id', userId)
        .eq('status', 'active')
        .single();

      if (sub) {
        setCurrentPlan(sub.plan_id as PlanType);
        
        // Get usage
        const usageLimit = await checkUsageLimit(userId);
        setUsage({
          used: usageLimit.used,
          limit: usageLimit.limit,
          remaining: usageLimit.remaining,
        });
      }
    } catch (error) {
      console.error('Error loading subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (planId: PlanType) => {
    if (!isAuthenticated) {
      router.push('/auth/login?redirect=/pricing');
      return;
    }

    // Redirect to checkout
    router.push(`/billing/checkout?plan=${planId}&cycle=${billingCycle}`);
  };

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-sky-50">
        <Header />
        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-gray-600">Loading pricing...</p>
          </div>
        </main>
      </div>
    );
  }

  const plans = getAllPlans();
  const individualPlans = plans.filter(p => p.id === 'individual');
  const practicePlans = plans.filter(p => p.id.startsWith('practice-'));

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-sky-50 pb-20 md:pb-8">
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-navy-600 mb-2">Choose Your Plan</h1>
          <p className="text-gray-600 mb-4">Flexible pricing for individuals and practices</p>
          
          {/* Billing Cycle Toggle */}
          <div className="inline-flex items-center gap-2 bg-white rounded-lg p-1 border-2 border-primary-200">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-4 py-2 rounded-md transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-primary-500 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('annual')}
              className={`px-4 py-2 rounded-md transition-all ${
                billingCycle === 'annual'
                  ? 'bg-primary-500 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Annual
              <span className="ml-1 text-xs text-green-600">(Save up to 20%)</span>
            </button>
          </div>
        </div>

        {/* Current Plan Status */}
        {currentPlan && (
          <Card className="mb-6 bg-primary-50 border-primary-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-primary-700 font-medium">Current Plan</p>
                <p className="text-xl font-bold text-navy-600">
                  {PRICING_PLANS[currentPlan].name}
                </p>
                {usage && (
                  <p className="text-sm text-gray-600 mt-1">
                    {usage.used.toLocaleString()} / {usage.limit?.toLocaleString() || '∞'} AI interactions used this month
                    {usage.remaining !== null && (
                      <span className="ml-2 text-green-600">
                        ({usage.remaining.toLocaleString()} remaining)
                      </span>
                    )}
                  </p>
                )}
              </div>
              <Button
                variant="outline"
                onClick={() => router.push('/settings/billing')}
              >
                Manage Subscription
              </Button>
            </div>
          </Card>
        )}

        {/* Individual Plans */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-navy-600 mb-4">Individual Plans</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {individualPlans.map((plan) => {
              const isCurrent = currentPlan === plan.id;
              const price = billingCycle === 'annual' && plan.annualDiscount
                ? getAnnualPrice(plan) / 12
                : plan.price;
              
              return (
                <Card
                  key={plan.id}
                  className={`relative ${isCurrent ? 'ring-2 ring-primary-500' : ''}`}
                >
                  {isCurrent && (
                    <div className="absolute top-4 right-4 bg-primary-500 text-white text-xs font-bold px-2 py-1 rounded">
                      Current
                    </div>
                  )}
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-navy-600 mb-2">{plan.name}</h3>
                    <p className="text-sm text-gray-600 mb-4">{plan.description}</p>
                    <div className="mb-4">
                      <span className="text-3xl font-bold text-primary-600">
                        {formatPrice(price)}
                      </span>
                      <span className="text-gray-500">/{plan.billingCycle}</span>
                      {billingCycle === 'annual' && plan.annualDiscount && (
                        <p className="text-sm text-green-600 mt-1">
                          Save {plan.annualDiscount}% with annual billing
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <ul className="space-y-2 mb-6">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                        <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <Button
                    variant={isCurrent ? 'outline' : 'primary'}
                    className="w-full"
                    onClick={() => handleSubscribe(plan.id)}
                    disabled={isCurrent}
                  >
                    {isCurrent ? 'Current Plan' : 'Subscribe'}
                  </Button>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Practice Plans */}
        <div>
          <h2 className="text-2xl font-bold text-navy-600 mb-4">Practice Plans</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {practicePlans.map((plan) => {
              const isCurrent = currentPlan === plan.id;
              const price = billingCycle === 'annual' && plan.annualDiscount
                ? getAnnualPrice(plan) / 12
                : plan.price;
              
              return (
                <Card
                  key={plan.id}
                  className={`relative ${isCurrent ? 'ring-2 ring-primary-500' : ''} ${
                    plan.id === 'practice-professional' ? 'border-2 border-primary-300' : ''
                  }`}
                >
                  {plan.id === 'practice-professional' && (
                    <div className="absolute top-0 left-0 right-0 bg-primary-500 text-white text-center text-xs font-bold py-1 rounded-t-lg">
                      Most Popular
                    </div>
                  )}
                  {isCurrent && (
                    <div className="absolute top-4 right-4 bg-primary-500 text-white text-xs font-bold px-2 py-1 rounded">
                      Current
                    </div>
                  )}
                  <div className={`mb-4 ${plan.id === 'practice-professional' ? 'mt-6' : ''}`}>
                    <h3 className="text-xl font-bold text-navy-600 mb-2">{plan.name}</h3>
                    <p className="text-sm text-gray-600 mb-4">{plan.description}</p>
                    <div className="mb-4">
                      <span className="text-3xl font-bold text-primary-600">
                        {formatPrice(price)}
                      </span>
                      <span className="text-gray-500">/provider/{plan.billingCycle}</span>
                      {billingCycle === 'annual' && plan.annualDiscount && (
                        <p className="text-sm text-green-600 mt-1">
                          Save {plan.annualDiscount}% with annual billing
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <ul className="space-y-2 mb-6">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                        <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <Button
                    variant={isCurrent ? 'outline' : plan.id === 'practice-professional' ? 'primary' : 'secondary'}
                    className="w-full"
                    onClick={() => handleSubscribe(plan.id)}
                    disabled={isCurrent}
                  >
                    {isCurrent ? 'Current Plan' : plan.id === 'enterprise-plus' ? 'Contact Sales' : 'Subscribe'}
                  </Button>
                </Card>
              );
            })}
          </div>
        </div>

        {/* FAQ Section */}
        <Card className="mt-8">
          <h2 className="text-xl font-bold text-navy-600 mb-4">Frequently Asked Questions</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-navy-600 mb-1">What happens if I exceed my AI interaction limit?</h3>
              <p className="text-sm text-gray-600">
                You'll be charged $0.008 per additional interaction. Overage charges are calculated monthly and added to your next billing cycle.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-navy-600 mb-1">Can I change plans anytime?</h3>
              <p className="text-sm text-gray-600">
                Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately, and we'll prorate the difference.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-navy-600 mb-1">Do you offer annual discounts?</h3>
              <p className="text-sm text-gray-600">
                Yes! Annual billing saves you 10-20% depending on your plan. The discount is automatically applied when you choose annual billing.
              </p>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
}
