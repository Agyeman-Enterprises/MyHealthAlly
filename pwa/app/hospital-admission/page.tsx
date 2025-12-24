'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth-store';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { DisclaimerBanner } from '@/components/governance/DisclaimerBanner';

export default function HospitalAdmissionPage() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const queryClient = useQueryClient();
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

  const submitAdmissionMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
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

      const patientId = (userRecord.patients as any).id;

      // Get primary clinician to notify
      const { data: patient } = await supabase
        .from('patients')
        .select('primary_clinician_id')
        .eq('id', patientId)
        .single();

      const { data: admission, error } = await supabase
        .from('hospital_admissions')
        .insert({
          patient_id: patientId,
          hospital_name: data.hospitalName,
          hospital_address: data.hospitalAddress || null,
          hospital_phone: data.hospitalPhone || null,
          admission_date: data.admissionDate,
          admission_reason: data.admissionReason || null,
          admission_type: data.admissionType,
          discharge_date: data.dischargeDate || null,
          patient_notes: data.patientNotes || null,
          notified_to_clinician_id: patient?.primary_clinician_id || null,
          status: 'active',
        })
        .select()
        .single();

      if (error) throw error;
      return admission;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hospital-admissions'] });
      router.push('/dashboard?hospital-notified=true');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.hospitalName.trim() || !formData.admissionDate) {
      alert('Please fill in required fields');
      return;
    }
    submitAdmissionMutation.mutate(formData);
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
                onChange={(e) => setFormData({ ...formData, admissionType: e.target.value as any })}
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
                isLoading={submitAdmissionMutation.isPending}
                disabled={!formData.hospitalName.trim() || !formData.admissionDate}
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

