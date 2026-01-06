'use client';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useRequireAuth } from '@/lib/auth/use-require-auth';
import { supabase } from '@/lib/supabase/client';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { getCurrentUserAndPatient } from '@/lib/supabase/queries-settings';

type DeviceType = 'fitbit' | 'google_fit' | 'garmin' | 'withings' | 'dexcom' | 'apple_health';

interface ConnectedDevice {
  id: string;
  device_type: DeviceType;
  device_name: string | null;
  last_sync_at: string | null;
  last_sync_status: string | null;
  sync_enabled: boolean;
}

const availableDevices: Array<{ id: DeviceType; name: string; icon: string }> = [
  { id: 'fitbit', name: 'Fitbit', icon: '⌚' },
  { id: 'google_fit', name: 'Google Fit', icon: '🏃' },
  { id: 'garmin', name: 'Garmin', icon: '📍' },
  { id: 'withings', name: 'Withings', icon: '⚖️' },
  { id: 'dexcom', name: 'Dexcom CGM', icon: '📊' },
  { id: 'apple_health', name: 'Apple Health', icon: '🍎' },
];

const deviceIcons: Record<DeviceType, string> = {
  fitbit: '⌚',
  google_fit: '🏃',
  garmin: '📍',
  withings: '⚖️',
  dexcom: '📊',
  apple_health: '🍎',
};

export default function DevicesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isLoading: authLoading } = useRequireAuth();
  const [connectedDevices, setConnectedDevices] = useState<ConnectedDevice[]>([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    // Check for success/error from OAuth callback
    const successParam = searchParams.get('success');
    const errorParam = searchParams.get('error');
    if (successParam === 'connected') {
      setSuccess('Device connected successfully!');
      // Remove query param
      router.replace('/settings/devices');
    }
    if (errorParam) {
      setError(`Connection failed: ${errorParam}`);
      router.replace('/settings/devices');
    }
  }, [searchParams, router]);

  useEffect(() => {
    if (authLoading) return;

    const loadDevices = async () => {
      try {
        const { patientId } = await getCurrentUserAndPatient();
        if (!patientId) {
          setLoading(false);
          return;
        }

        const { data, error: devicesError } = await supabase
          .from('connected_devices')
          .select('id, device_type, device_name, last_sync_at, last_sync_status, sync_enabled')
          .eq('patient_id', patientId)
          .eq('is_connected', true)
          .order('connected_at', { ascending: false });

        if (devicesError) {
          console.error('Error loading devices:', devicesError);
        } else {
          setConnectedDevices(data || []);
        }
      } catch (err) {
        console.error('Error loading devices:', err);
      } finally {
        setLoading(false);
      }
    };

      loadDevices();
    }, [authLoading, router]);

  const handleConnect = async (provider: DeviceType) => {
    if (provider === 'apple_health') {
      alert('Apple Health integration requires the native iOS app. Please use the MyHealth Ally iOS app to connect Apple Health.');
      return;
    }

    setConnecting(provider);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/devices/oauth/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to initiate connection');
      }

      const { oauthUrl } = await response.json();
      if (oauthUrl) {
        // Redirect to OAuth provider
        window.location.href = oauthUrl;
      } else {
        throw new Error('OAuth URL not generated');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to connect device';
      setError(message);
      setConnecting(null);
    }
  };

  const handleDisconnect = async (deviceId: string, deviceName: string) => {
    if (!confirm(`Disconnect ${deviceName}?`)) {
      return;
    }

    try {
      const response = await fetch('/api/devices/disconnect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deviceId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to disconnect');
      }

      // Reload devices
      setConnectedDevices(devices => devices.filter(d => d.id !== deviceId));
      setSuccess(`${deviceName} disconnected successfully`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to disconnect device';
      setError(message);
    }
  };

  const handleSync = async (deviceId: string) => {
    try {
      const response = await fetch('/api/devices/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deviceId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Sync failed');
      }

      const result = await response.json();
      setSuccess(`Synced ${result.recordsSynced} records`);
      
      // Reload devices to update last sync time
      const { patientId } = await getCurrentUserAndPatient();
      if (patientId) {
        const { data } = await supabase
          .from('connected_devices')
          .select('id, device_type, device_name, last_sync_at, last_sync_status, sync_enabled')
          .eq('patient_id', patientId)
          .eq('is_connected', true)
          .order('connected_at', { ascending: false });
        
        if (data) {
          setConnectedDevices(data);
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to sync device';
      setError(message);
    }
  };

  const formatLastSync = (lastSyncAt: string | null): string => {
    if (!lastSyncAt) return 'Never';
    const date = new Date(lastSyncAt);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  if (authLoading) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-sky-50 pb-20 md:pb-8">
      <Header />
      <main className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-navy-600 mb-1">Connected Devices</h1>
        <p className="text-gray-600 mb-6">Manage your health devices and apps</p>

        {error && (
          <Card className="mb-6 p-4 bg-red-50 border-red-200">
            <p className="text-red-800 text-sm">{error}</p>
          </Card>
        )}

        {success && (
          <Card className="mb-6 p-4 bg-green-50 border-green-200">
            <p className="text-green-800 text-sm">{success}</p>
          </Card>
        )}

        <Card className="mb-6">
          <h2 className="font-semibold text-navy-600 mb-4">Connected</h2>
          {loading ? (
            <p className="text-gray-500 text-center py-4">Loading devices...</p>
          ) : connectedDevices.length > 0 ? (
            <div className="space-y-3">
              {connectedDevices.map((device) => (
                <div key={device.id} className="flex items-center justify-between p-3 bg-green-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{deviceIcons[device.device_type] || '📱'}</span>
                    <div>
                      <h3 className="font-medium text-navy-600">{device.device_name || device.device_type}</h3>
                      <p className="text-xs text-gray-500">
                        Last synced: {formatLastSync(device.last_sync_at)}
                        {device.last_sync_status === 'failed' && (
                          <span className="text-red-600 ml-2">(Sync failed)</span>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleSync(device.id)}
                      disabled={!device.sync_enabled}
                    >
                      Sync
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleDisconnect(device.id, device.device_name || device.device_type)}
                    >
                      Disconnect
                    </Button>
                  </div>
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
            {availableDevices.map((device) => {
              const isConnected = connectedDevices.some(d => d.device_type === device.id);
              const isConnecting = connecting === device.id;
              
              return (
                <button
                  key={device.id}
                  onClick={() => !isConnected && !isConnecting && handleConnect(device.id)}
                  disabled={isConnected || isConnecting}
                  className={`p-4 border-2 rounded-xl transition-all text-center ${
                    isConnected
                      ? 'border-green-300 bg-green-50 opacity-60 cursor-not-allowed'
                      : isConnecting
                      ? 'border-primary-400 bg-primary-50 cursor-wait'
                      : 'border-gray-200 hover:border-primary-400 hover:bg-primary-50'
                  }`}
                >
                  <span className="text-3xl block mb-2">{device.icon}</span>
                  <span className="text-sm font-medium text-navy-600 block">{device.name}</span>
                  {isConnected && (
                    <span className="text-xs text-green-700 mt-1 block">Connected</span>
                  )}
                  {isConnecting && (
                    <span className="text-xs text-primary-700 mt-1 block">Connecting...</span>
                  )}
                </button>
              );
            })}
          </div>
        </Card>
      </main>
      <BottomNav />
    </div>
  );
}
