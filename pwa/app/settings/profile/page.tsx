'use client';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/store/auth-store';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { getCurrentUserAndPatient, updatePatientProfile, updateUserSettings } from '@/lib/supabase/queries-settings';

type FormState = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
};

const emptyForm: FormState = { firstName: '', lastName: '', email: '', phone: '', dateOfBirth: '' };

export default function ProfilePage() {
  const { updateUser } = useAuthStore();
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [patientId, setPatientId] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const { userRecord, patientId: pid } = await getCurrentUserAndPatient();
        setUserId(userRecord.id);
        setPatientId(pid || null);
        const patientProfile = Array.isArray(userRecord.patients)
          ? userRecord.patients[0]
          : userRecord.patients || null;
        setForm({
          firstName: patientProfile?.first_name || '',
          lastName: patientProfile?.last_name || '',
          email: userRecord.email || '',
          phone: userRecord.phone || '',
          dateOfBirth: patientProfile?.date_of_birth || '',
        });
      } catch (err: unknown) {
        console.error('Error loading profile', err);
        const message = err instanceof Error ? err.message : 'Unable to load profile.';
        setError(message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      await updateUserSettings(userId, { email: form.email, phone: form.phone });
      if (patientId) {
        await updatePatientProfile(patientId, {
          first_name: form.firstName,
          last_name: form.lastName,
          date_of_birth: form.dateOfBirth || null,
        });
      }
      updateUser({ firstName: form.firstName, lastName: form.lastName, email: form.email, phone: form.phone, dateOfBirth: form.dateOfBirth });
      setSuccess('Profile updated.');
    } catch (err: unknown) {
      console.error('Error saving profile', err);
      const message = err instanceof Error ? err.message : 'Unable to save profile.';
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-sky-50 pb-20 md:pb-8">
      <Header />
      <main className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-navy-600 mb-1">Profile</h1>
        <p className="text-gray-600 mb-2">Update your personal information</p>
        {loading && <p className="text-sm text-gray-500 mb-4">Loading profile…</p>}
        {error && <p className="text-sm text-red-600 mb-4">{error}</p>}
        {success && <p className="text-sm text-green-600 mb-4">{success}</p>}

        <Card>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                <input type="text" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-400" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                <input type="text" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-400" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="(671) 555-0123" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
              <input type="date" value={form.dateOfBirth} onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-400" />
            </div>
            <Button type="submit" variant="primary" className="w-full" isLoading={saving} disabled={saving || loading}>Save Changes</Button>
          </form>
        </Card>
      </main>
      <BottomNav />
    </div>
  );
}
