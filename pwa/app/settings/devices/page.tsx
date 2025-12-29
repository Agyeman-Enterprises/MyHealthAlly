'use client';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth-store';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

const connectedDevices = [
  { id: '1', name: 'Apple Health', type: 'App', status: 'connected', lastSync: '2 hours ago', icon: '🍎' },
  { id: '2', name: 'Omron Blood Pressure Monitor', type: 'Device', status: 'connected', lastSync: '1 day ago', icon: '💓' },
];

const availableDevices = [
  { id: 'fitbit', name: 'Fitbit', icon: '⌚' },
  { id: 'google-fit', name: 'Google Fit', icon: '🏃' },
  { id: 'garmin', name: 'Garmin', icon: '📍' },
  { id: 'withings', name: 'Withings', icon: '⚖️' },
  { id: 'dexcom', name: 'Dexcom CGM', icon: '📊' },
];

export default function DevicesPage() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (!isAuthenticated) { router.push('/auth/login'); return null; }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-sky-50 pb-20 md:pb-8">
      <Header />
      <main className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-navy-600 mb-1">Connected Devices</h1>
        <p className="text-gray-600 mb-6">Manage your health devices and apps</p>

        <Card className="mb-6">
          <h2 className="font-semibold text-navy-600 mb-4">Connected</h2>
          {connectedDevices.length > 0 ? (
            <div className="space-y-3">
              {connectedDevices.map((device) => (
                <div key={device.id} className="flex items-center justify-between p-3 bg-green-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{device.icon}</span>
                    <div>
                      <h3 className="font-medium text-navy-600">{device.name}</h3>
                      <p className="text-xs text-gray-500">Last synced: {device.lastSync}</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => alert(`Disconnect ${device.name}?`)}>Disconnect</Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No devices connected</p>
          )}
        </Card>

        <Card>
          <h2 className="font-semibold text-navy-600 mb-4">Available to Connect</h2>
          <div className="grid grid-cols-2 gap-3">
            {availableDevices.map((device) => (
              <button key={device.id} onClick={() => alert(`Connect ${device.name} - OAuth flow would start`)} className="p-4 border border-gray-200 rounded-xl hover:border-primary-400 hover:bg-primary-50 transition-all text-center">
                <span className="text-3xl block mb-2">{device.icon}</span>
                <span className="text-sm font-medium text-navy-600">{device.name}</span>
              </button>
            ))}
          </div>
        </Card>
      </main>
      <BottomNav />
    </div>
  );
}
