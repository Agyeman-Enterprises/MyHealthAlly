'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth-store';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { RequirePractice } from '@/components/RequirePractice';

const mockReferrals = [
  { id: '1', specialty: 'Endocrinology', provider: 'Dr. Maria Santos', reason: 'Diabetes management consultation', date: '2024-12-20', status: 'pending', expires: '2025-03-20' },
  { id: '2', specialty: 'Ophthalmology', provider: 'Pacific Eye Center', reason: 'Diabetic retinopathy screening', date: '2024-11-15', status: 'completed', expires: '2025-02-15' },
];

const specialties = [
  'Cardiology', 'Endocrinology', 'Dermatology', 'Gastroenterology', 'Neurology', 'Ophthalmology', 'Orthopedics', 'Physical Therapy', 'Psychiatry', 'Other'
];

export default function ReferralsPage() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [referrals] = useState(mockReferrals);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [form, setForm] = useState({ specialty: '', reason: '' });
  const [submitting, setSubmitting] = useState(false);

  if (!isAuthenticated) { router.push('/auth/login'); return null; }

  const handleSubmit = async () => {
    if (!form.specialty || !form.reason) { alert('Please fill in all fields'); return; }
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 1500));
    setSubmitting(false);
    alert('Referral request submitted! Your care team will review and process it.');
    setShowRequestForm(false);
    setForm({ specialty: '', reason: '' });
  };

  function ReferralsPageInner() {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-sky-50 pb-20 md:pb-8">
        <Header />
        <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-navy-600">Referrals</h1>
            <p className="text-gray-600">Manage specialist referrals</p>
          </div>
          {!showRequestForm && (
            <Button variant="primary" onClick={() => setShowRequestForm(true)}>+ Request Referral</Button>
          )}
        </div>

        {showRequestForm && (
          <Card className="mb-6">
            <h2 className="font-semibold text-navy-600 mb-4">Request New Referral</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Specialty *</label>
                <select value={form.specialty} onChange={(e) => setForm({ ...form, specialty: e.target.value })} className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-400">
                  <option value="">Select specialty</option>
                  {specialties.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reason for Referral *</label>
                <textarea value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} rows={3} placeholder="Describe why you need this referral..." className="w-full px-4 py-3 border rounded-xl resize-none focus:ring-2 focus:ring-primary-400" />
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setShowRequestForm(false)}>Cancel</Button>
                <Button variant="primary" onClick={handleSubmit} isLoading={submitting}>Submit Request</Button>
              </div>
            </div>
          </Card>
        )}

        {referrals.length > 0 && (
          <div className="space-y-3">
            {referrals.map((ref) => (
              <Card key={ref.id}>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-navy-600">{ref.specialty}</h3>
                    <p className="text-gray-600">{ref.provider}</p>
                    <p className="text-sm text-gray-500">{ref.reason}</p>
                    <p className="text-xs text-gray-400 mt-1">Issued: {new Date(ref.date).toLocaleDateString()} • Expires: {new Date(ref.expires).toLocaleDateString()}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${ref.status === 'completed' ? 'bg-green-100 text-green-700' : ref.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600'}`}>
                    {ref.status === 'completed' ? '✓ Completed' : ref.status === 'pending' ? '● Pending' : 'Expired'}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        )}

        {referrals.length === 0 && !showRequestForm && (
          <Card className="text-center py-12">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🏥</span>
            </div>
            <h3 className="text-lg font-semibold text-navy-600 mb-2">No referrals</h3>
            <p className="text-gray-600 mb-6">Request a referral to see a specialist</p>
            <Button variant="primary" onClick={() => setShowRequestForm(true)}>Request Referral</Button>
          </Card>
        )}

        <Card className="mt-6 bg-primary-50 border-primary-200">
          <h3 className="font-semibold text-navy-600 mb-2">📋 About Referrals</h3>
          <p className="text-sm text-gray-600">Referrals are typically valid for 90 days. Please schedule your appointment with the specialist before the expiration date. Contact our office if you need a referral renewed.</p>
        </Card>
        </main>
        <BottomNav />
      </div>
    );
  }

  return (
    <RequirePractice featureName="Referrals">
      <ReferralsPageInner />
    </RequirePractice>
  );
}
