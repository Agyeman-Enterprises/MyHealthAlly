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

export default function InvoicesPage() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, router]);

  const { data: invoices, isLoading } = useQuery({
    queryKey: ['invoices'],
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
        .from('patient_billing')
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

  interface Invoice {
    id: string;
    status: string;
    total_amount: number;
  }

  const totalDue = invoices?.reduce((sum: number, inv: Invoice) => {
    return sum + (inv.status === 'pending' || inv.status === 'overdue' ? inv.total_amount : 0);
  }, 0) || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50/30 pb-20 md:pb-8">
      <Header title="Invoices" showBack />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Your Invoices</h2>
            {totalDue > 0 && (
              <p className="text-sm text-red-600 mt-1">Total due: ${totalDue.toFixed(2)}</p>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-200 border-t-primary-600 mb-4"></div>
            <p className="text-gray-500">Loading invoices...</p>
          </div>
        ) : invoices && invoices.length > 0 ? (
          <div className="space-y-4">
            {invoices.map((invoice: Invoice) => (
              <Card key={invoice.id} hover className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Invoice #{invoice.invoice_number || invoice.id.substring(0, 8)}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Date: {format(new Date(invoice.created_at), 'PP')}
                    </p>
                    <p className="text-lg font-bold text-gray-900 mt-2">
                      ${invoice.total_amount?.toFixed(2) || '0.00'}
                    </p>
                    {invoice.description && (
                      <p className="text-sm text-gray-600 mt-2">{invoice.description}</p>
                    )}
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
                      invoice.status === 'overdue' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {invoice.status}
                    </span>
                    <Link href={`/invoices/${invoice.id}`}>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </Link>
                    {invoice.status !== 'paid' && (
                      <Link href={`/payments/make-payment?invoice_id=${invoice.id}`}>
                        <Button variant="primary" size="sm">
                          Pay Now
                        </Button>
                      </Link>
                    )}
                  </div>
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
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No invoices</h3>
            <p className="text-gray-500">You don&apos;t have any invoices yet</p>
          </Card>
        )}
      </main>

      <BottomNav />
    </div>
  );
}

