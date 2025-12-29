'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth-store';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function SecurityPage() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [biometrics, setBiometrics] = useState(false);
  const [twoFactor, setTwoFactor] = useState(false);

  if (!isAuthenticated) { router.push('/auth/login'); return null; }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-sky-50 pb-20 md:pb-8">
      <Header />
      <main className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-navy-600 mb-1">Security</h1>
        <p className="text-gray-600 mb-6">Manage your account security</p>

        <Card className="mb-6">
          <h2 className="font-semibold text-navy-600 mb-4">Password</h2>
          <p className="text-sm text-gray-600 mb-4">Last changed: 30 days ago</p>
          <Button variant="outline" onClick={() => alert('Password change flow would open')}>Change Password</Button>
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
          <p className="text-sm text-gray-600 mb-4">Set a 4-digit PIN for quick access</p>
          <Button variant="outline" onClick={() => alert('PIN setup flow would open')}>Set Up PIN</Button>
        </Card>

        <Card className="bg-red-50 border-red-200">
          <h2 className="font-semibold text-red-800 mb-2">Danger Zone</h2>
          <p className="text-sm text-red-600 mb-4">Permanently delete your account and all data</p>
          <Button variant="danger" onClick={() => alert('Account deletion requires contacting support')}>Delete Account</Button>
        </Card>
      </main>
      <BottomNav />
    </div>
  );
}
