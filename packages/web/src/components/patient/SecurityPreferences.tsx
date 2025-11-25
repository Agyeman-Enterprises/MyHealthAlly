'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { DeviceSummary } from '@myhealthally/shared';
import { useAuth } from '@/contexts/AuthContext';
import {
  getUserDevices,
  updateDevicePin,
  updateDeviceBiometric,
} from '@/services/auth/security';
import {
  saveBiometricSecret,
  removeBiometricSecret,
  getBiometricSecret,
  getEncryptedRefreshBlob,
} from '@/lib/auth-storage';

interface DeviceState extends DeviceSummary {
  sessions?: { id: string; lastActiveAt: string; expiresAt: string }[];
}

export function SecurityPreferences() {
  const { device: activeDevice } = useAuth();
  const [devices, setDevices] = useState<DeviceState[]>([]);
  const [pin, setPin] = useState('');
  const [pinConfirm, setPinConfirm] = useState('');
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');

  const currentDevice = devices.find((d) => d.id === activeDevice?.id);

  const loadDevices = async () => {
    try {
      const data = await getUserDevices();
      setDevices(data);
    } catch (err) {
      console.error('Failed to load devices', err);
    }
  };

  useEffect(() => {
    loadDevices();
  }, []);

  const handlePinSave = async () => {
    if (!currentDevice?.id) return;
    if (pin.length < 4 || pin !== pinConfirm) {
      setError('PINs must match and be 4-6 digits.');
      return;
    }
    setUpdating(true);
    setError('');
    try {
      await updateDevicePin({
        deviceRecordId: currentDevice.id,
        pin,
        encryptedKeyBlob: getEncryptedRefreshBlob() || undefined,
      });
      setPin('');
      setPinConfirm('');
      await loadDevices();
    } catch (err: any) {
      setError(err?.message || 'Failed to update PIN.');
    } finally {
      setUpdating(false);
    }
  };

  const handlePinDisable = async () => {
    if (!currentDevice?.id) return;
    setUpdating(true);
    try {
      await updateDevicePin({
        deviceRecordId: currentDevice.id,
        remove: true,
      });
      await loadDevices();
    } catch (err: any) {
      setError(err?.message || 'Failed to disable PIN.');
    } finally {
      setUpdating(false);
    }
  };

  const handleBiometricToggle = async (enabled: boolean) => {
    if (!currentDevice?.id) return;
    setUpdating(true);
    setError('');
    try {
      if (enabled) {
        const secret = crypto.randomUUID();
        await updateDeviceBiometric({
          deviceRecordId: currentDevice.id,
          biometricToken: secret,
          encryptedKeyBlob: getEncryptedRefreshBlob() || undefined,
        });
        await saveBiometricSecret(currentDevice.id, secret);
      } else {
        await updateDeviceBiometric({
          deviceRecordId: currentDevice.id,
          remove: true,
        });
        removeBiometricSecret(currentDevice.id);
      }
      await loadDevices();
    } catch (err: any) {
      setError(err?.message || 'Unable to update biometric preference.');
    } finally {
      setUpdating(false);
    }
  };

  const handleTestBiometric = async () => {
    if (!currentDevice?.id) return;
    const secret = await getBiometricSecret(currentDevice.id);
    if (secret) {
      alert('Biometric secret stored for this device.');
    } else {
      alert('Biometric secret missing. Please re-enable biometrics.');
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Device Security</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {currentDevice ? (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium" style={{ color: 'var(--color-textPrimary)' }}>
                    Biometric unlock
                  </p>
                  <p className="text-xs" style={{ color: 'var(--color-textSecondary)' }}>
                    Face ID / Touch ID on this device
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBiometricToggle(!currentDevice.biometricEnabled)}
                  disabled={updating}
                >
                  {currentDevice.biometricEnabled ? 'Disable' : 'Enable'}
                </Button>
              </div>
              {currentDevice.biometricEnabled && (
                <Button variant="outline" size="sm" onClick={handleTestBiometric}>
                  Verify biometric secret
                </Button>
              )}

              <div className="border-t pt-4">
                <p className="text-sm font-medium" style={{ color: 'var(--color-textPrimary)' }}>
                  Device PIN
                </p>
                <p className="text-xs mb-3" style={{ color: 'var(--color-textSecondary)' }}>
                  4-6 digit PIN required each time you unlock
                </p>
                {currentDevice.pinEnabled ? (
                  <Button variant="outline" onClick={handlePinDisable} disabled={updating}>
                    Disable PIN
                  </Button>
                ) : (
                  <div className="space-y-2 max-w-sm">
                    <Input
                      type="password"
                      inputMode="numeric"
                      maxLength={6}
                      placeholder="New PIN"
                      value={pin}
                      onChange={(e) => setPin(e.target.value)}
                    />
                    <Input
                      type="password"
                      inputMode="numeric"
                      maxLength={6}
                      placeholder="Confirm PIN"
                      value={pinConfirm}
                      onChange={(e) => setPinConfirm(e.target.value)}
                    />
                    <Button onClick={handlePinSave} disabled={updating || pin.length < 4 || pin !== pinConfirm}>
                      Save PIN
                    </Button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <p className="text-sm" style={{ color: 'var(--color-textSecondary)' }}>
              This device has not been registered yet. Log in once to register.
            </p>
          )}
          {error && (
            <p className="text-sm" style={{ color: 'var(--color-danger)' }}>
              {error}
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Saved Devices</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {devices.length === 0 && (
            <p className="text-sm" style={{ color: 'var(--color-textSecondary)' }}>
              No devices on file yet.
            </p>
          )}
          {devices.map((deviceItem) => (
            <div
              key={deviceItem.id}
              className="rounded-lg border border-[var(--color-border)] p-3"
              style={{
                backgroundColor:
                  deviceItem.id === activeDevice?.id ? 'var(--color-background)' : 'transparent',
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium" style={{ color: 'var(--color-textPrimary)' }}>
                    {deviceItem.deviceName || deviceItem.platform}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--color-textSecondary)' }}>
                    {deviceItem.platform} • ID ending {deviceItem.deviceId.slice(-4)}
                  </p>
                </div>
                <div className="text-xs" style={{ color: 'var(--color-textSecondary)' }}>
                  {deviceItem.pinEnabled ? 'PIN' : 'No PIN'} •{' '}
                  {deviceItem.biometricEnabled ? 'Biometric' : 'No biometric'}
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

