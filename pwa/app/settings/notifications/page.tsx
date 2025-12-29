'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth-store';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function NotificationsPage() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [settings, setSettings] = useState({
    pushEnabled: true,
    emailEnabled: true,
    messages: true,
    appointments: true,
    labResults: true,
    medications: true,
    billing: false,
  });
  const [saving, setSaving] = useState(false);

  if (!isAuthenticated) { router.push('/auth/login'); return null; }

  const Toggle = ({ enabled, onChange }: { enabled: boolean; onChange: () => void }) => (
    <button onClick={onChange} className={`w-12 h-6 rounded-full transition-colors relative ${enabled ? 'bg-primary-500' : 'bg-gray-300'}`}>
      <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${enabled ? 'translate-x-6' : 'translate-x-0.5'}`} />
    </button>
  );

  const handleSave = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 1000));
    setSaving(false);
    alert('Notification settings saved!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-sky-50 pb-20 md:pb-8">
      <Header />
      <main className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-navy-600 mb-1">Notifications</h1>
        <p className="text-gray-600 mb-6">Manage how you receive updates</p>

        <Card className="mb-6">
          <h2 className="font-semibold text-navy-600 mb-4">Notification Channels</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div><h3 className="font-medium text-navy-600">Push Notifications</h3><p className="text-sm text-gray-500">Receive alerts on your device</p></div>
              <Toggle enabled={settings.pushEnabled} onChange={() => setSettings(s => ({ ...s, pushEnabled: !s.pushEnabled }))} />
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

        <Button variant="primary" className="w-full" onClick={handleSave} isLoading={saving}>Save Settings</Button>
      </main>
      <BottomNav />
    </div>
  );
}
