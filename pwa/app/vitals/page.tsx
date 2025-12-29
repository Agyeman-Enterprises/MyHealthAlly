'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth-store';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

const vitalTypes = [
  { id: 'blood-glucose', name: 'Blood Glucose', unit: 'mg/dL', icon: '🩸', normalRange: '70-100 (fasting)' },
  { id: 'blood-pressure', name: 'Blood Pressure', unit: 'mmHg', icon: '💓', normalRange: '<120/80' },
  { id: 'heart-rate', name: 'Heart Rate', unit: 'bpm', icon: '❤️', normalRange: '60-100' },
  { id: 'weight', name: 'Weight', unit: 'lbs', icon: '⚖️', normalRange: 'Varies' },
  { id: 'temperature', name: 'Temperature', unit: '°F', icon: '🌡️', normalRange: '97.8-99.1' },
  { id: 'oxygen', name: 'Oxygen Saturation', unit: '%', icon: '💨', normalRange: '95-100' },
];

const recentReadings = [
  { type: 'Blood Glucose', value: '98', unit: 'mg/dL', date: '2024-12-26T08:00:00', status: 'normal' },
  { type: 'Blood Pressure', value: '118/76', unit: 'mmHg', date: '2024-12-25T09:30:00', status: 'normal' },
  { type: 'Weight', value: '165', unit: 'lbs', date: '2024-12-24T07:00:00', status: 'normal' },
];

export default function VitalsPage() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [showForm, setShowForm] = useState<string | null>(null);
  const [value, setValue] = useState('');
  const [value2, setValue2] = useState('');
  const [saving, setSaving] = useState(false);

  if (!isAuthenticated) { router.push('/auth/login'); return null; }

  const handleSave = async () => {
    if (!value) { alert('Please enter a value'); return; }
    
    // Emergency validation
    const vital = vitalTypes.find(v => v.id === showForm);
    if (showForm === 'blood-glucose') {
      const bg = parseInt(value);
      if (bg < 50 || bg > 350) {
        alert('⚠️ CRITICAL VALUE DETECTED!\n\nThis reading indicates a medical emergency.\n\nIf you are experiencing symptoms, call 911 immediately.\n\nValue not saved.');
        return;
      }
    }
    if (showForm === 'oxygen') {
      const spo2 = parseInt(value);
      if (spo2 < 90) {
        alert('⚠️ CRITICAL VALUE DETECTED!\n\nOxygen saturation below 90% is a medical emergency.\n\nCall 911 immediately.\n\nValue not saved.');
        return;
      }
    }

    setSaving(true);
    await new Promise(r => setTimeout(r, 1000));
    setSaving(false);
    alert('Vital recorded successfully!');
    setShowForm(null);
    setValue('');
    setValue2('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-sky-50 pb-20 md:pb-8">
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-navy-600">Vitals</h1>
            <p className="text-gray-600">Track and record your health measurements</p>
          </div>
        </div>

        {/* Record New Vital */}
        <Card className="mb-6">
          <h2 className="font-semibold text-navy-600 mb-4">Record a Reading</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {vitalTypes.map((vital) => (
              <button
                key={vital.id}
                onClick={() => { setShowForm(vital.id); setValue(''); setValue2(''); }}
                className={`p-4 rounded-xl border-2 transition-all text-center ${showForm === vital.id ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-primary-300'}`}
              >
                <span className="text-2xl block mb-1">{vital.icon}</span>
                <span className="text-sm font-medium text-navy-600">{vital.name}</span>
                <span className="text-xs text-gray-500 block">{vital.normalRange}</span>
              </button>
            ))}
          </div>

          {showForm && (
            <div className="mt-4 p-4 bg-gray-50 rounded-xl">
              <h3 className="font-medium text-navy-600 mb-3">Enter {vitalTypes.find(v => v.id === showForm)?.name}</h3>
              <div className="flex gap-3 items-end">
                {showForm === 'blood-pressure' ? (
                  <>
                    <div className="flex-1">
                      <label className="text-xs text-gray-500">Systolic</label>
                      <input type="number" value={value} onChange={(e) => setValue(e.target.value)} placeholder="120" className="w-full px-3 py-2 border rounded-lg" />
                    </div>
                    <span className="text-gray-500 pb-2">/</span>
                    <div className="flex-1">
                      <label className="text-xs text-gray-500">Diastolic</label>
                      <input type="number" value={value2} onChange={(e) => setValue2(e.target.value)} placeholder="80" className="w-full px-3 py-2 border rounded-lg" />
                    </div>
                  </>
                ) : (
                  <div className="flex-1">
                    <input type="number" value={value} onChange={(e) => setValue(e.target.value)} placeholder="Enter value" className="w-full px-3 py-2 border rounded-lg" />
                  </div>
                )}
                <span className="text-gray-500 pb-2">{vitalTypes.find(v => v.id === showForm)?.unit}</span>
                <Button variant="primary" onClick={handleSave} isLoading={saving}>Save</Button>
                <Button variant="ghost" onClick={() => setShowForm(null)}>Cancel</Button>
              </div>
            </div>
          )}
        </Card>

        {/* Recent Readings */}
        <Card>
          <h2 className="font-semibold text-navy-600 mb-4">Recent Readings</h2>
          <div className="space-y-3">
            {recentReadings.map((reading, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div>
                  <h3 className="font-medium text-navy-600">{reading.type}</h3>
                  <p className="text-xs text-gray-500">{new Date(reading.date).toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <span className="text-lg font-semibold text-navy-700">{reading.value}</span>
                  <span className="text-sm text-gray-500 ml-1">{reading.unit}</span>
                  <span className={`block text-xs ${reading.status === 'normal' ? 'text-green-600' : 'text-red-600'}`}>
                    {reading.status === 'normal' ? '✓ Normal' : '⚠️ Review'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </main>
      <BottomNav />
    </div>
  );
}
