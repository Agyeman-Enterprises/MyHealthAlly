'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth-store';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { format } from 'date-fns';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

export default function InvoiceDetailPage() {
  const router = useRouter();
  const params = useParams();
  const invoiceId = params.id as string;
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, router]);

  const { data: invoice, isLoading } = useQuery({
    queryKey: ['invoice', invoiceId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data: userRecord } = await supabase
        .from('users')
        .select('id, patients(id)')
        .eq('supabase_auth_id', user.id)
        .single();

      if (!userRecord || !userRecord.patients) return null;

      const patientId = (userRecord.patients as any).id;

      const { data, error } = await supabase
        .from('patient_billing')
        .select('*')
        .eq('id', invoiceId)
        .eq('patient_id', patientId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: isAuthenticated && !!invoiceId,
  });

  const handleDownloadPDF = async () => {
    // In production, this would call an API endpoint to generate PDF
    // For now, we'll create a simple download
    alert('PDF download will be available after SoloPractice API integration');
  };

  if (!isAuthenticated) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50/30 pb-20 md:pb-8">
        <Header title="Invoice" showBack />
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading invoice...</div>
        </div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50/30 pb-20 md:pb-8">
        <Header title="Invoice" showBack />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card variant="elevated" className="p-6">
            <p className="text-red-600">Invoice not found</p>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50/30 pb-20 md:pb-8">
      <Header title="Invoice Details" showBack />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card variant="elevated" className="p-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Invoice #{invoice.invoice_number || invoice.id.substring(0, 8)}
              </h1>
              <p className="text-sm text-gray-500 mt-2">
                Date: {format(new Date(invoice.created_at), 'PP')}
              </p>
            </div>
            <span className={`px-4 py-2 rounded-full text-sm font-medium ${
              invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
              invoice.status === 'overdue' ? 'bg-red-100 text-red-800' :
              'bg-yellow-100 text-yellow-800'
            }`}>
              {invoice.status}
            </span>
          </div>

          <div className="border-t border-gray-200 pt-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Amount Due</h2>
              <p className="text-3xl font-bold text-gray-900">
                ${invoice.total_amount?.toFixed(2) || '0.00'}
              </p>
            </div>
          </div>

          {invoice.description && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
              <p className="text-gray-700">{invoice.description}</p>
            </div>
          )}

          {invoice.due_date && (
            <div className="mb-6">
              <p className="text-sm text-gray-600">
                <strong>Due Date:</strong> {format(new Date(invoice.due_date), 'PP')}
              </p>
            </div>
          )}

          <div className="flex justify-end space-x-4 pt-6 border-t">
            <Button
              variant="outline"
              onClick={handleDownloadPDF}
            >
              Download PDF
            </Button>
            {invoice.status !== 'paid' && (
              <Link href={`/payments/make-payment?invoice_id=${invoice.id}`}>
                <Button variant="primary">
                  Pay Now
                </Button>
              </Link>
            )}
          </div>
        </Card>
      </main>

      <BottomNav />
    </div>
  );
}

