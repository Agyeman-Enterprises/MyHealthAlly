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

export default function PaymentsPage() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, router]);

  const { data: payments, isLoading } = useQuery({
    queryKey: ['payments'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data: userRecord } = await supabase
        .from('users')
        .select('id, patients(id)')
        .eq('supabase_auth_id', user.id)
        .single();

      if (!userRecord || !userRecord.patients) return [];

      const patientsArray = Array.isArray(userRecord.patients) ? userRecord.patients : [userRecord.patients];
      const patientId = patientsArray[0]?.id;
      if (!patientId) return [];

      const { data, error } = await supabase
        .from('patient_payments')
        .select('*')
        .eq('patient_id', patientId)
        .order('paid_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: isAuthenticated,
  });

  if (!isAuthenticated) {
    return null;
  }

  interface Payment {
    id: string;
    status: string;
    amount: number;
    currency?: string | null;
    paid_at?: string | null;
    metadata?: { description?: string } | null;
    source?: string | null;
  }
  const totalPaid = payments?.reduce((sum: number, p: Payment) => {
    return sum + (p.status === 'completed' ? p.amount : 0);
  }, 0) || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50/30 pb-20 md:pb-8">
      <Header title="Payments" showBack />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Payment History</h2>
            <p className="text-sm text-gray-500 mt-1">Total paid: ${totalPaid.toFixed(2)}</p>
          </div>
          <Link href="/payments/make-payment">
            <Button variant="primary" size="md">
              <svg className="w-5 h-5 mr-2 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Make Payment
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-200 border-t-primary-600 mb-4"></div>
            <p className="text-gray-500">Loading payments...</p>
          </div>
        ) : payments && payments.length > 0 ? (
          <div className="space-y-4">
            {payments.map((payment: Payment) => (
              <Card key={payment.id} hover className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      ${payment.amount.toFixed(2)} {payment.currency?.toUpperCase()}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {payment.paid_at ? format(new Date(payment.paid_at), 'PPpp') : 'Pending'}
                    </p>
                    {payment.metadata?.description && (
                      <p className="text-sm text-gray-600 mt-2">{payment.metadata.description}</p>
                    )}
                    {payment.source === 'mha' && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800 mt-2">
                        MHA Payment
                      </span>
                    )}
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    payment.status === 'completed' ? 'bg-green-100 text-green-800' :
                    payment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {payment.status}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card variant="elevated" className="text-center py-16">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No payments yet</h3>
            <p className="text-gray-500 mb-6">Make a payment to get started</p>
            <Link href="/payments/make-payment">
              <Button variant="primary" size="md">
                Make Payment
              </Button>
            </Link>
          </Card>
        )}
      </main>

      <BottomNav />
    </div>
  );
}

