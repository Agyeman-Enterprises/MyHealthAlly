'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth-store';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { getCurrentUserAndPatient, updatePatientProfile, updateUserSettings } from '@/lib/supabase/queries-settings';

type SettingsState = {
  pushEnabled: boolean;
  smsEnabled: boolean;
  emailEnabled: boolean;
  messages: boolean;
  appointments: boolean;
  labResults: boolean;
  medications: boolean;
  billing: boolean;
  appointmentReminders: boolean;
  medicationReminders: boolean;
};

const defaultState: SettingsState = {
  pushEnabled: true,
  smsEnabled: false,
  emailEnabled: true,
  messages: true,
  appointments: true,
  labResults: true,
  medications: true,
  billing: false,
  appointmentReminders: true,
  medicationReminders: true,
};

export default function NotificationsPage() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [settings, setSettings] = useState<SettingsState>(defaultState);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [patientId, setPatientId] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) { router.push('/auth/login'); return; }

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const { userRecord, patientId: pid } = await getCurrentUserAndPatient();
        setUserId(userRecord.id);
        setPatientId(pid || null);

        const notif = userRecord.notification_settings || {};
        const channels = notif.channels || notif; // backward compatibility with flat shape
        const categories = notif.categories || notif;
        const patientProfile = Array.isArray(userRecord.patients)
          ? userRecord.patients[0]
          : userRecord.patients || null;

        setSettings({
          pushEnabled: channels.push ?? true,
          smsEnabled: channels.sms ?? false,
          emailEnabled: channels.email ?? true,
          messages: categories.messages ?? true,
          appointments: categories.appointments ?? true,
          labResults: categories.labResults ?? true,
          medications: categories.medications ?? true,
          billing: categories.billing ?? false,
          appointmentReminders: patientProfile?.appointment_reminders ?? true,
          medicationReminders: patientProfile?.medication_reminders ?? true,
        });
      } catch (err: unknown) {
        console.error('Error loading notification settings', err);
        const message = err instanceof Error ? err.message : 'Unable to load notification settings.';
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [isAuthenticated, router]);

  const Toggle = ({ enabled, onChange }: { enabled: boolean; onChange: () => void }) => (
    <button onClick={onChange} className={`w-12 h-6 rounded-full transition-colors relative ${enabled ? 'bg-primary-500' : 'bg-gray-300'}`}>
      <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${enabled ? 'translate-x-6' : 'translate-x-0.5'}`} />
    </button>
  );

  const handleSave = async () => {
    if (!userId) return;
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const notificationSettings = {
        channels: {
          push: settings.pushEnabled,
          sms: settings.smsEnabled,
          email: settings.emailEnabled,
        },
        categories: {
          messages: settings.messages,
          appointments: settings.appointments,
          labResults: settings.labResults,
          medications: settings.medications,
          billing: settings.billing,
        },
      };

      await updateUserSettings(userId, { notificationSettings });

      if (patientId) {
        await updatePatientProfile(patientId, {
          appointment_reminders: settings.appointmentReminders,
          medication_reminders: settings.medicationReminders,
        });
      }

      setSuccess('Notification settings saved.');
    } catch (err: unknown) {
      console.error('Error saving notification settings', err);
      const message = err instanceof Error ? err.message : 'Unable to save notification settings.';
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-sky-50 pb-20 md:pb-8">
      <Header />
      <main className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-navy-600 mb-1">Notifications</h1>
        <p className="text-gray-600 mb-2">Manage how you receive updates</p>
        {loading && <p className="text-sm text-gray-500 mb-4">Loading preferences…</p>}
        {error && <p className="text-sm text-red-600 mb-4">{error}</p>}
        {success && <p className="text-sm text-green-600 mb-4">{success}</p>}

        <Card className="mb-6">
          <h2 className="font-semibold text-navy-600 mb-4">Notification Channels</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div><h3 className="font-medium text-navy-600">Push Notifications</h3><p className="text-sm text-gray-500">Receive alerts on your device</p></div>
              <Toggle enabled={settings.pushEnabled} onChange={() => setSettings(s => ({ ...s, pushEnabled: !s.pushEnabled }))} />
            </div>
            <div className="flex items-center justify-between">
              <div><h3 className="font-medium text-navy-600">SMS Notifications</h3><p className="text-sm text-gray-500">Get text alerts to your phone</p></div>
              <Toggle enabled={settings.smsEnabled} onChange={() => setSettings(s => ({ ...s, smsEnabled: !s.smsEnabled }))} />
            </div>
            <div className="flex items-center justify-between">
              <div><h3 className="font-medium text-navy-600">Email Notifications</h3><p className="text-sm text-gray-500">Receive updates via email</p></div>
              <Toggle enabled={settings.emailEnabled} onChange={() => setSettings(s => ({ ...s, emailEnabled: !s.emailEnabled }))} />
            </div>
          </div>
        </Card>

        <Card className="mb-6">
          <h2 className="font-semibold text-navy-600 mb-4">Notification Types</h2>
          <div className="space-y-4">
            {[
              { key: 'messages', label: 'New Messages', desc: 'When care team sends a message' },
              { key: 'appointments', label: 'Appointments', desc: 'Reminders and confirmations' },
              { key: 'labResults', label: 'Lab Results', desc: 'When new results are available' },
              { key: 'medications', label: 'Medications', desc: 'Refill reminders' },
              { key: 'billing', label: 'Billing', desc: 'Invoice and payment alerts' },
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between">
                <div><h3 className="font-medium text-navy-600">{item.label}</h3><p className="text-sm text-gray-500">{item.desc}</p></div>
                <Toggle enabled={settings[item.key as keyof typeof settings] as boolean} onChange={() => setSettings(s => ({ ...s, [item.key]: !s[item.key as keyof typeof settings] }))} />
              </div>
            ))}
          </div>
        </Card>

        <Card className="mb-6">
          <h2 className="font-semibold text-navy-600 mb-4">Reminders</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div><h3 className="font-medium text-navy-600">Appointment reminders</h3><p className="text-sm text-gray-500">Receive reminders before visits</p></div>
              <Toggle enabled={settings.appointmentReminders} onChange={() => setSettings(s => ({ ...s, appointmentReminders: !s.appointmentReminders }))} />
            </div>
            <div className="flex items-center justify-between">
              <div><h3 className="font-medium text-navy-600">Medication reminders</h3><p className="text-sm text-gray-500">Stay on schedule with meds</p></div>
              <Toggle enabled={settings.medicationReminders} onChange={() => setSettings(s => ({ ...s, medicationReminders: !s.medicationReminders }))} />
            </div>
          </div>
        </Card>

        <Button variant="primary" className="w-full" onClick={handleSave} isLoading={saving} disabled={loading || saving}>Save Settings</Button>
      </main>
      <BottomNav />
    </div>
  );
}
