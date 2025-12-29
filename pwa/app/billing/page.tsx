'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth-store';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

const mockInvoices = [
  { id: '1', date: '2024-12-20', description: 'Office Visit - Follow-up', amount: 150.00, insurance: 120.00, patientOwes: 30.00, status: 'due' },
  { id: '2', date: '2024-12-15', description: 'Lab Work - Metabolic Panel', amount: 85.00, insurance: 85.00, patientOwes: 0, status: 'paid' },
  { id: '3', date: '2024-11-20', description: 'Annual Physical', amount: 200.00, insurance: 180.00, patientOwes: 20.00, status: 'paid' },
];

export default function BillingPage() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [invoices] = useState(mockInvoices);

  if (!isAuthenticated) { router.push('/auth/login'); return null; }

  const totalDue = invoices.filter(i => i.status === 'due').reduce((sum, i) => sum + i.patientOwes, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-sky-50 pb-20 md:pb-8">
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-navy-600">Billing</h1>
          <p className="text-gray-600">View invoices and make payments</p>
        </div>

        {totalDue > 0 && (
          <Card className="mb-6 bg-amber-50 border-amber-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-amber-700">Amount Due</p>
                <p className="text-3xl font-bold text-amber-800">${totalDue.toFixed(2)}</p>
              </div>
              <Button variant="primary" onClick={() => alert('Payment portal would open')}>Pay Now</Button>
            </div>
          </Card>
        )}

        <Card className="mb-6">
          <h2 className="font-semibold text-navy-600 mb-4">Recent Invoices</h2>
          <div className="space-y-3">
            {invoices.map((inv) => (
              <div key={inv.id} className={`p-4 rounded-xl border ${inv.status === 'due' ? 'bg-amber-50 border-amber-200' : 'bg-gray-50 border-gray-200'}`}>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium text-navy-600">{inv.description}</h3>
                    <p className="text-sm text-gray-500">{new Date(inv.date).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-navy-700">${inv.patientOwes.toFixed(2)}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${inv.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                      {inv.status === 'paid' ? '✓ Paid' : 'Due'}
                    </span>
                  </div>
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  Total: ${inv.amount.toFixed(2)} | Insurance covered: ${inv.insurance.toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h2 className="font-semibold text-navy-600 mb-4">Payment Methods</h2>
          <div className="space-y-3">
            <button className="w-full p-4 border rounded-xl hover:border-primary-400 hover:bg-primary-50 transition-all flex items-center gap-3 text-left" onClick={() => alert('Add payment method')}>
              <span className="text-2xl">💳</span>
              <div>
                <p className="font-medium text-navy-600">Add Credit/Debit Card</p>
                <p className="text-sm text-gray-500">Securely save a card for payments</p>
              </div>
            </button>
            <button className="w-full p-4 border rounded-xl hover:border-primary-400 hover:bg-primary-50 transition-all flex items-center gap-3 text-left" onClick={() => alert('Set up autopay')}>
              <span className="text-2xl">🔄</span>
              <div>
                <p className="font-medium text-navy-600">Set Up Auto-Pay</p>
                <p className="text-sm text-gray-500">Automatically pay balances when due</p>
              </div>
            </button>
          </div>
        </Card>

        <Card className="mt-6 bg-primary-50 border-primary-200">
          <h3 className="font-semibold text-navy-600 mb-2">Questions about your bill?</h3>
          <p className="text-sm text-gray-600 mb-3">Our billing team is here to help with insurance claims, payment plans, and more.</p>
          <div className="flex gap-3">
            <a href="tel:+16715550123" className="flex-1 px-4 py-2 bg-white border border-primary-400 text-primary-600 rounded-xl text-center font-medium hover:bg-primary-50">Call Billing</a>
            <Button variant="primary" className="flex-1" onClick={() => router.push('/messages/new')}>Message Billing</Button>
          </div>
        </Card>
      </main>
      <BottomNav />
    </div>
  );
}
