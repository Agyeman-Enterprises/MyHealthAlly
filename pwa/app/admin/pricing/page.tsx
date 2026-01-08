/**
 * Admin Pricing Management Page
 * 
 * Allows admins to view and manage pricing plans, subscriptions, and usage
 */

'use client';

import { useState, useEffect } from 'react';
import { useRequireAuth } from '@/lib/auth/use-require-auth';
import { supabase } from '@/lib/supabase/client';
import { Header } from '@/components/layout/Header';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { PRICING_PLANS, formatPrice, getAllPlans } from '@/lib/pricing/plans';
import { getUsageSummary } from '@/lib/services/ai-usage-tracking';
import { calculateUserOverage, calculatePracticeOverage } from '@/lib/services/overage-billing';

export default function AdminPricingPage() {
  const { isAuthenticated, isLoading } = useRequireAuth();
  const [plans, setPlans] = useState<typeof PRICING_PLANS | null>(null);
  const [subscriptions, setSubscriptions] = useState<Array<{
    id: string;
    userId: string;
    planId: string;
    status: string;
    createdAt: string;
  }>>([]);
  const [practiceSubscriptions, setPracticeSubscriptions] = useState<Array<{
    id: string;
    practiceId: string;
    planId: string;
    status: string;
    createdAt: string;
  }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  const loadData = async () => {
    try {
      // Load plans
      const { data: plansData } = await supabase
        .from('plans')
        .select('*')
        .eq('active', true)
        .order('price_monthly_cents', { ascending: true });

      // Load user subscriptions
      const { data: subsData } = await supabase
        .from('subscriptions')
        .select('id, user_id, plan_id, status, created_at')
        .order('created_at', { ascending: false })
        .limit(50);

      // Load practice subscriptions
      const { data: practiceSubsData } = await supabase
        .from('practice_subscriptions')
        .select('id, practice_id, plan_id, status, created_at')
        .order('created_at', { ascending: false })
        .limit(50);

      setSubscriptions((subsData || []).map(sub => ({
        id: sub.id,
        userId: sub.user_id,
        planId: sub.plan_id,
        status: sub.status,
        createdAt: sub.created_at,
      })));
      setPracticeSubscriptions((practiceSubsData || []).map(sub => ({
        id: sub.id,
        practiceId: sub.practice_id,
        planId: sub.plan_id,
        status: sub.status,
        createdAt: sub.created_at,
      })));
    } catch (error) {
      console.error('Error loading pricing data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-sky-50">
        <Header />
        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-gray-600">Loading pricing data...</p>
          </div>
        </main>
      </div>
    );
  }

  const allPlans = getAllPlans();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-sky-50 pb-20 md:pb-8">
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-navy-600">Pricing Management</h1>
          <p className="text-gray-600">Manage pricing plans, subscriptions, and usage</p>
        </div>

        {/* Pricing Plans */}
        <Card className="mb-6">
          <h2 className="text-xl font-bold text-navy-600 mb-4">Available Plans</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {allPlans.map((plan) => (
              <div key={plan.id} className="border rounded-lg p-4 bg-white">
                <h3 className="font-bold text-lg text-navy-600 mb-2">{plan.name}</h3>
                <p className="text-sm text-gray-600 mb-3">{plan.description}</p>
                <div className="mb-3">
                  <span className="text-2xl font-bold text-primary-600">
                    {formatPrice(plan.price)}
                  </span>
                  <span className="text-gray-500 text-sm">/{plan.billingCycle}</span>
                </div>
                {plan.maxAiInteractions && (
                  <p className="text-sm text-gray-600 mb-2">
                    {plan.maxAiInteractions.toLocaleString()} AI interactions/month
                  </p>
                )}
                {plan.maxProviders && (
                  <p className="text-sm text-gray-600 mb-2">
                    Up to {plan.maxProviders} providers
                  </p>
                )}
                {plan.maxPatients && (
                  <p className="text-sm text-gray-600 mb-2">
                    Up to {plan.maxPatients.toLocaleString()} patients
                  </p>
                )}
                {plan.annualDiscount && (
                  <p className="text-sm text-green-600 font-medium">
                    {plan.annualDiscount}% off annual billing
                  </p>
                )}
              </div>
            ))}
          </div>
        </Card>

        {/* User Subscriptions */}
        <Card className="mb-6">
          <h2 className="text-xl font-bold text-navy-600 mb-4">User Subscriptions</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">User ID</th>
                  <th className="text-left p-2">Plan</th>
                  <th className="text-left p-2">Status</th>
                  <th className="text-left p-2">Created</th>
                </tr>
              </thead>
              <tbody>
                {subscriptions.map((sub) => (
                  <tr key={sub.id} className="border-b">
                    <td className="p-2 font-mono text-xs">{sub.userId.substring(0, 8)}...</td>
                    <td className="p-2">{PRICING_PLANS[sub.planId as keyof typeof PRICING_PLANS]?.name || sub.planId}</td>
                    <td className="p-2">
                      <span className={`px-2 py-1 rounded text-xs ${
                        sub.status === 'active' ? 'bg-green-100 text-green-700' :
                        sub.status === 'canceled' ? 'bg-gray-100 text-gray-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {sub.status}
                      </span>
                    </td>
                    <td className="p-2 text-gray-600">
                      {new Date(sub.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Practice Subscriptions */}
        <Card>
          <h2 className="text-xl font-bold text-navy-600 mb-4">Practice Subscriptions</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Practice ID</th>
                  <th className="text-left p-2">Plan</th>
                  <th className="text-left p-2">Status</th>
                  <th className="text-left p-2">Created</th>
                </tr>
              </thead>
              <tbody>
                {practiceSubscriptions.map((sub) => (
                  <tr key={sub.id} className="border-b">
                    <td className="p-2 font-mono text-xs">{sub.practiceId}</td>
                    <td className="p-2">{PRICING_PLANS[sub.planId as keyof typeof PRICING_PLANS]?.name || sub.planId}</td>
                    <td className="p-2">
                      <span className={`px-2 py-1 rounded text-xs ${
                        sub.status === 'active' ? 'bg-green-100 text-green-700' :
                        sub.status === 'canceled' ? 'bg-gray-100 text-gray-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {sub.status}
                      </span>
                    </td>
                    <td className="p-2 text-gray-600">
                      {new Date(sub.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </main>
    </div>
  );
}
