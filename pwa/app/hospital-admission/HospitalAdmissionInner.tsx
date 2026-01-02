'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth-store';
import { supabase } from '@/lib/supabase/client';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { DisclaimerBanner } from '@/components/governance/DisclaimerBanner';

export default function HospitalAdmissionInner() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [formData, setFormData] = useState({
    hospitalName: '',
    hospitalAddress: '',
    hospitalPhone: '',
    admissionDate: '',
    admissionReason: '',
    admissionType: 'emergency' as 'emergency' | 'planned' | 'observation',
    dischargeDate: '',
    patientNotes: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.hospitalName.trim() || !formData.admissionDate) {
      alert('Please fill in required fields');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Get patient ID
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: userRecord } = await supabase
        .from('users')
        .select('id, patients(id)')
        .eq('supabase_auth_id', user.id)
        .single();

      if (!userRecord || !userRecord.patients) {
        throw new Error('Patient record not found');
      }

      const patientsArray = Array.isArray(userRecord.patients) ? userRecord.patients : [userRecord.patients];
      const patientId = patientsArray[0]?.id;
      if (!patientId) {
        throw new Error('Patient ID not found');
      }

      // Save locally first
      const { data: admission, error: dbError } = await supabase
        .from('hospital_admissions')
        .insert({
          patient_id: patientId,
          hospital_name: formData.hospitalName,
          hospital_address: formData.hospitalAddress || null,
          hospital_phone: formData.hospitalPhone || null,
          admission_date: formData.admissionDate,
          admission_reason: formData.admissionReason || null,
          admission_type: formData.admissionType,
          discharge_date: formData.dischargeDate || null,
          patient_notes: formData.patientNotes || null,
          status: 'active',
        })
        .select()
        .single();

      if (dbError) throw dbError;

      // Send to care team via API (guarded by assertAttachedPatient)
      const res = await fetch('/api/hospital-admission/notify', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          admissionId: admission.id,
          hospitalName: formData.hospitalName,
          hospitalAddress: formData.hospitalAddress,
          hospitalPhone: formData.hospitalPhone,
          admissionDate: formData.admissionDate,
          admissionReason: formData.admissionReason,
          admissionType: formData.admissionType,
          dischargeDate: formData.dischargeDate,
          patientNotes: formData.patientNotes,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Failed to notify care team' }));
        throw new Error(errorData.error || 'Unable to notify care team');
      }

      router.push('/dashboard?hospital-notified=true');
    } catch (err) {
      console.error('Error submitting hospital admission:', err);
      setError(err instanceof Error ? err.message : 'Failed to submit hospital admission');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50/30 pb-20 md:pb-8">
      <Header title="Hospital Admission Notification" showBack />
    
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <DisclaimerBanner type="emergency" className="mb-6" />

        <Card variant="elevated" className="p-6 mb-6">
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
            <p className="text-sm text-blue-800">
              <strong>Important:</strong> This form is to notify your care team about a hospital stay. 
              For medical emergencies, call 911 immediately.
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              id="hospitalName"
              name="hospitalName"
              label="Hospital Name *"
              type="text"
              placeholder="Hospital or facility name"
              value={formData.hospitalName}
              onChange={(e) => setFormData({ ...formData, hospitalName: e.target.value })}
              required
            />

            <Input
              id="hospitalAddress"
              name="hospitalAddress"
              label="Hospital Address"
              type="text"
              placeholder="Street address, city, state"
              value={formData.hospitalAddress}
              onChange={(e) => setFormData({ ...formData, hospitalAddress: e.target.value })}
            />

            <Input
              id="hospitalPhone"
              name="hospitalPhone"
              label="Hospital Phone"
              type="tel"
              placeholder="(555) 123-4567"
              value={formData.hospitalPhone}
              onChange={(e) => setFormData({ ...formData, hospitalPhone: e.target.value })}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                id="admissionDate"
                name="admissionDate"
                label="Admission Date *"
                type="date"
                value={formData.admissionDate}
                onChange={(e) => setFormData({ ...formData, admissionDate: e.target.value })}
                required
                max={new Date().toISOString().split('T')[0]}
              />
              <Input
                id="dischargeDate"
                name="dischargeDate"
                label="Discharge Date (if discharged)"
                type="date"
                value={formData.dischargeDate}
                onChange={(e) => setFormData({ ...formData, dischargeDate: e.target.value })}
                max={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Admission Type
              </label>
              <select
                value={formData.admissionType}
                onChange={(e) => setFormData({ ...formData, admissionType: e.target.value as 'emergency' | 'planned' | 'observation' })}
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none"
              >
                <option value="emergency">Emergency</option>
                <option value="planned">Planned</option>
                <option value="observation">Observation</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for Admission
              </label>
              <textarea
                value={formData.admissionReason}
                onChange={(e) => setFormData({ ...formData, admissionReason: e.target.value })}
                placeholder="Briefly describe why you were admitted..."
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none"
                rows={4}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Notes (Optional)
              </label>
              <textarea
                value={formData.patientNotes}
                onChange={(e) => setFormData({ ...formData, patientNotes: e.target.value })}
                placeholder="Any additional information you'd like to share..."
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none"
                rows={3}
              />
            </div>

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                isLoading={loading}
                disabled={!formData.hospitalName.trim() || !formData.admissionDate || loading}
              >
                Notify Care Team
              </Button>
            </div>
          </form>
        </Card>
      </main>

      <BottomNav />
    </div>
  );
}

