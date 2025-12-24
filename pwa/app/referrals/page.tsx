'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth-store';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { format } from 'date-fns';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

export default function ReferralsPage() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, router]);

  const { data: referrals, isLoading } = useQuery({
    queryKey: ['referrals'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data: userRecord } = await supabase
        .from('users')
        .select('id, patients(id)')
        .eq('supabase_auth_id', user.id)
        .single();

      if (!userRecord || !userRecord.patients) return [];

      const patientId = (userRecord.patients as any).id;

      const { data, error } = await supabase
        .from('referral_requests')
        .select('*')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: isAuthenticated,
  });

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50/30 pb-20 md:pb-8">
      <Header title="Referrals" showBack />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Your Referrals</h2>
          <Link href="/referrals/request">
            <Button variant="primary" size="md">
              <svg className="w-5 h-5 mr-2 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Request Referral
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-200 border-t-primary-600 mb-4"></div>
            <p className="text-gray-500">Loading referrals...</p>
          </div>
        ) : referrals && referrals.length > 0 ? (
          <div className="space-y-4">
            {referrals.map((referral: any) => (
              <Card key={referral.id} hover className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{referral.specialty}</h3>
                    {referral.reason && (
                      <p className="text-sm text-gray-600 mt-2">{referral.reason}</p>
                    )}
                    <p className="text-sm text-gray-500 mt-2">
                      Requested: {format(new Date(referral.created_at), 'PP')}
                    </p>
                    {referral.scheduled_date && (
                      <p className="text-sm text-gray-600 mt-1">
                        Scheduled: {format(new Date(referral.scheduled_date), 'PPp')}
                      </p>
                    )}
                    {referral.scheduled_provider_name && (
                      <p className="text-sm text-gray-600 mt-1">
                        Provider: {referral.scheduled_provider_name}
                      </p>
                    )}
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    referral.status === 'completed' ? 'bg-green-100 text-green-800' :
                    referral.status === 'approved' ? 'bg-blue-100 text-blue-800' :
                    referral.status === 'scheduled' ? 'bg-purple-100 text-purple-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {referral.status}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card variant="elevated" className="text-center py-16">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No referrals</h3>
            <p className="text-gray-500 mb-6">Request a referral to see a specialist</p>
            <Link href="/referrals/request">
              <Button variant="primary" size="md">
                Request Referral
              </Button>
            </Link>
          </Card>
        )}
      </main>

      <BottomNav />
    </div>
  );
}

