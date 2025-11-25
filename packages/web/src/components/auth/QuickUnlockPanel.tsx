'use client';

import { useEffect, useState } from 'react';
import { Fingerprint, Shield, Unlock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { getStoredMetaSync, getBiometricSecret } from '@/lib/auth-storage';
import { unlockWithDevice } from '@/services/auth/security';

type QuickUnlockVariant = 'patient' | 'clinician';

export function QuickUnlockPanel({ variant = 'patient' }: { variant?: QuickUnlockVariant }) {
  const { applyAuthResponse } = useAuth();
  const [device, setDevice] = useState<any | null>(null);
  const [showPinEntry, setShowPinEntry] = useState(false);
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const meta = getStoredMetaSync();
    if (meta?.device) {
      setDevice(meta.device);
    }
  }, []);

  if (!device || (!device.pinEnabled && !device.biometricEnabled)) {
    return null;
  }

  const handlePinUnlock = async () => {
    if (!device?.id || pin.length < 4) return;
    setLoading(true);
    setError('');
    try {
      const response = await unlockWithDevice({
        deviceRecordId: device.id,
        method: 'PIN',
        pin,
      });
      await applyAuthResponse(response);
    } catch (err: any) {
      setError(err?.message || 'Invalid PIN. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBiometricUnlock = async () => {
    if (!device?.id) return;
    setLoading(true);
    setError('');
    try {
      const secret = await getBiometricSecret(device.id);
      if (!secret) {
        setError('Biometric secret missing on this device.');
        setLoading(false);
        return;
      }
      const response = await unlockWithDevice({
        deviceRecordId: device.id,
        method: 'BIOMETRIC',
        biometricToken: secret,
      });
      await applyAuthResponse(response);
    } catch (err: any) {
      setError(err?.message || 'Unable to verify biometrics.');
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-white/70 p-4 shadow-sm space-y-4">
      <div>
        <p className="text-xs uppercase tracking-wide" style={{ color: 'var(--color-textSecondary)' }}>
          Quick unlock
        </p>
        <div className="flex items-center gap-2 mt-1">
          <Shield className="w-4 h-4" style={{ color: 'var(--color-primary)' }} />
          <h3 className="text-base font-semibold" style={{ color: 'var(--color-textPrimary)' }}>
            {variant === 'patient' ? 'Resume care securely' : 'Resume charting quickly'}
          </h3>
        </div>
        <p className="text-sm mt-1" style={{ color: 'var(--color-textSecondary)' }}>
          {device.deviceName || 'This device'} • {device.platform}
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        {device.pinEnabled && (
          <Button
            variant="outline"
            className="flex-1 min-w-[180px]"
            onClick={() => {
              setShowPinEntry(true);
              setError('');
            }}
          >
            <Unlock className="w-4 h-4 mr-2" />
            Use device PIN
          </Button>
        )}
        {device.biometricEnabled && (
          <Button
            variant="secondary"
            className="flex-1 min-w-[180px]"
            onClick={handleBiometricUnlock}
            disabled={loading}
          >
            <Fingerprint className="w-4 h-4 mr-2" />
            {loading ? 'Checking...' : 'Face ID / Touch ID'}
          </Button>
        )}
      </div>

      {showPinEntry && device.pinEnabled && (
        <div className="space-y-2 border-t border-myh-borderSoft pt-3">
          <p className="text-sm font-semibold text-myh-textPrimary">Enter your PIN</p>
          <Input
            type="password"
            inputMode="numeric"
            maxLength={6}
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            className="max-w-xs"
            placeholder="••••"
          />
          <div className="flex gap-2">
            <Button
              variant="primary"
              onClick={handlePinUnlock}
              disabled={loading || pin.length < 4}
            >
              {loading ? 'Unlocking...' : 'Unlock'}
            </Button>
            <Button variant="ghost" onClick={() => setShowPinEntry(false)}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {error && (
        <p className="text-sm" style={{ color: 'var(--color-danger)' }}>
          {error}
        </p>
      )}
    </div>
  );
}

