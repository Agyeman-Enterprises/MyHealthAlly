'use client';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth-store';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function RefillPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [pharmacy, setPharmacy] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isAuthenticated) { router.push('/auth/login'); return null; }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 1500));
    setSubmitting(false);
    alert('Refill request submitted! Your care team will process it within 1-2 business days.');
    router.push('/medications');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-sky-50 pb-20 md:pb-8">
      <Header />
      <main className="max-w-2xl mx-auto px-4 py-8">
        <Card>
          <h1 className="text-xl font-bold text-navy-600 mb-4">Request Medication Refill</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Pharmacy</label>
              <select value={pharmacy} onChange={(e) => setPharmacy(e.target.value)} className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-400">
                <option value="">Select pharmacy</option>
                <option value="cvs">CVS Pharmacy - Tamuning</option>
                <option value="walgreens">Walgreens - Dededo</option>
                <option value="costco">Costco Pharmacy</option>
                <option value="other">Other (specify in notes)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Additional Notes</label>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} placeholder="Any special instructions or requests..." className="w-full px-4 py-3 border rounded-xl resize-none focus:ring-2 focus:ring-primary-400" />
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
              <Button type="submit" variant="primary" className="flex-1" isLoading={submitting}>Submit Request</Button>
            </div>
          </form>
        </Card>
      </main>
      <BottomNav />
    </div>
  );
}
