'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth-store';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/solopractice-client';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { DisclaimerBanner } from '@/components/governance/DisclaimerBanner';

export default function RequestAppointmentPage() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    type: '',
    reason: '',
    urgency: 'routine' as 'routine' | 'soon' | 'urgent',
    preferredDate: '',
    preferredTime: '',
    prefersTelehealth: false,
  });

  const requestAppointmentMutation = useMutation({
    mutationFn: (data: typeof formData) =>
      apiClient.requestAppointment({
        type: data.type,
        preferred_date: data.preferredDate || undefined,
        preferred_time: data.preferredTime || undefined,
        reason: data.reason || undefined,
        urgency: data.urgency,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      router.push('/appointments?success=true');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.type.trim()) {
      alert('Please select an appointment type');
      return;
    }
    requestAppointmentMutation.mutate(formData);
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50/30 pb-20 md:pb-8">
      <Header title="Request Appointment" showBack />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <DisclaimerBanner type="standard" className="mb-6" />

        <Card variant="elevated" className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Appointment Type *
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none"
                required
              >
                <option value="">Select appointment type</option>
                <option value="Office Visit">Office Visit</option>
                <option value="Telehealth">Telehealth</option>
                <option value="Follow-up">Follow-up</option>
                <option value="Consultation">Consultation</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for Visit
              </label>
              <textarea
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                placeholder="Briefly describe why you need this appointment..."
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none"
                rows={4}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Urgency Level
              </label>
              <div className="space-y-2">
                {(['routine', 'soon', 'urgent'] as const).map((level) => (
                  <label key={level} className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      name="urgency"
                      value={level}
                      checked={formData.urgency === level}
                      onChange={(e) => setFormData({ ...formData, urgency: e.target.value as any })}
                      className="w-4 h-4 text-primary-600"
                    />
                    <span className="text-gray-700 capitalize">{level}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                id="preferredDate"
                name="preferredDate"
                label="Preferred Date"
                type="date"
                value={formData.preferredDate}
                onChange={(e) => setFormData({ ...formData, preferredDate: e.target.value })}
                min={new Date().toISOString().split('T')[0]}
              />
              <Input
                id="preferredTime"
                name="preferredTime"
                label="Preferred Time"
                type="time"
                value={formData.preferredTime}
                onChange={(e) => setFormData({ ...formData, preferredTime: e.target.value })}
              />
            </div>

            <div className="flex items-center">
              <input
                id="prefersTelehealth"
                name="prefersTelehealth"
                type="checkbox"
                checked={formData.prefersTelehealth}
                onChange={(e) => setFormData({ ...formData, prefersTelehealth: e.target.checked })}
                className="w-4 h-4 text-primary-600"
              />
              <label htmlFor="prefersTelehealth" className="ml-2 text-sm text-gray-700">
                I prefer a telehealth appointment
              </label>
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
                isLoading={requestAppointmentMutation.isPending}
                disabled={!formData.type.trim()}
              >
                Submit Request
              </Button>
            </div>
          </form>
        </Card>
      </main>

      <BottomNav />
    </div>
  );
}

