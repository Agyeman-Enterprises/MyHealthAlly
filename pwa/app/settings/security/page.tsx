'use client';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/store/auth-store';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { getCurrentUserAndPatient, updateUserSettings } from '@/lib/supabase/queries-settings';
import { supabase } from '@/lib/supabase/client';

function hashPin(pin: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(pin);
  return crypto.subtle.digest('SHA-256', data).then((buf) => {
    const bytes = new Uint8Array(buf);
    return Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join('');
  });
}

export default function SecurityPage() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [biometrics, setBiometrics] = useState(false);
  const [twoFactor, setTwoFactor] = useState(false);
  const [pin, setPin] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const { userRecord } = await getCurrentUserAndPatient();
        setUserId(userRecord.id);
        const biometricEnabled = (userRecord as { biometric_enabled?: boolean }).biometric_enabled ?? false;
        const twoFactorEnabled = (userRecord as { two_factor_enabled?: boolean }).two_factor_enabled ?? false;
        setBiometrics(biometricEnabled);
        setTwoFactor(twoFactorEnabled);
      } catch (err: unknown) {
        console.error('Error loading security settings', err);
        const message = err instanceof Error ? err.message : 'Unable to load security settings.';
        setError(message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [isAuthenticated]);

  const handleSave = async () => {
    if (!userId) return;
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const pinHash = pin ? await hashPin(pin) : null;
      await updateUserSettings(userId, {
        biometricEnabled: biometrics,
        twoFactorEnabled: twoFactor,
        pinHash,
      });
      setSuccess('Security settings saved.');
      if (pin) setPin('');
    } catch (err: unknown) {
      console.error('Error saving security settings', err);
      const message = err instanceof Error ? err.message : 'Unable to save security settings.';
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    const newPassword = prompt('Enter new password (min 8 chars):');
    if (!newPassword || newPassword.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const { error: pwError } = await supabase.auth.updateUser({ password: newPassword });
      if (pwError) throw pwError;
      setSuccess('Password updated.');
    } catch (err: unknown) {
      console.error('Error updating password', err);
      const message = err instanceof Error ? err.message : 'Unable to update password.';
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-sky-50 pb-20 md:pb-8">
      <Header />
      <main className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-navy-600 mb-1">Security</h1>
        <p className="text-gray-600 mb-2">Manage your account security</p>
        {loading && <p className="text-sm text-gray-500 mb-4">Loading…</p>}
        {error && <p className="text-sm text-red-600 mb-4">{error}</p>}
        {success && <p className="text-sm text-green-600 mb-4">{success}</p>}

        <Card className="mb-6">
          <h2 className="font-semibold text-navy-600 mb-4">Password</h2>
          <p className="text-sm text-gray-600 mb-4">Change your account password.</p>
          <Button variant="outline" onClick={handlePasswordChange} disabled={saving}>Change Password</Button>
        </Card>

        <Card className="mb-6">
          <h2 className="font-semibold text-navy-600 mb-4">Security Options</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div><h3 className="font-medium text-navy-600">Biometric Login</h3><p className="text-sm text-gray-500">Use fingerprint or face recognition</p></div>
              <button onClick={() => setBiometrics(!biometrics)} className={`w-12 h-6 rounded-full transition-colors relative ${biometrics ? 'bg-primary-500' : 'bg-gray-300'}`}>
                <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${biometrics ? 'translate-x-6' : 'translate-x-0.5'}`} />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div><h3 className="font-medium text-navy-600">Two-Factor Authentication</h3><p className="text-sm text-gray-500">Add extra security to your account</p></div>
              <button onClick={() => setTwoFactor(!twoFactor)} className={`w-12 h-6 rounded-full transition-colors relative ${twoFactor ? 'bg-primary-500' : 'bg-gray-300'}`}>
                <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${twoFactor ? 'translate-x-6' : 'translate-x-0.5'}`} />
              </button>
            </div>
          </div>
        </Card>

        <Card className="mb-6">
          <h2 className="font-semibold text-navy-600 mb-4">PIN Code</h2>
          <p className="text-sm text-gray-600 mb-2">Set a 4-6 digit PIN for quick access.</p>
          <div className="flex items-center gap-3">
            <input
              type="password"
              maxLength={6}
              inputMode="numeric"
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/[^0-9]/g, ''))}
              className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-400"
              placeholder="Enter PIN"
            />
            <Button variant="outline" onClick={handleSave} isLoading={saving} disabled={saving || loading || !pin}>Save PIN</Button>
          </div>
          <p className="text-xs text-gray-500 mt-2">PIN is stored hashed (SHA-256) on your account.</p>
        </Card>

        <Card className="bg-red-50 border-red-200">
          <h2 className="font-semibold text-red-800 mb-2">Danger Zone</h2>
          <p className="text-sm text-red-600 mb-3">To delete your account, contact support. This action is not automatic.</p>
          <Button variant="danger" disabled>Deletion requires support</Button>
        </Card>
      </main>
      <BottomNav />
    </div>
  );
}
