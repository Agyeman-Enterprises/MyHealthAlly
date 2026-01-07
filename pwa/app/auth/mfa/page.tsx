'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth-store';
import { supabase } from '@/lib/supabase/client';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import type { User } from '@/lib/store/auth-store';

function MfaPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const emailFromQuery = searchParams.get('email') || '';
  const { completeMfa, requestMfaCode } = useAuthStore.getState();
  const [email, setEmail] = useState(emailFromQuery);
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (!email) setEmail(emailFromQuery);
  }, [emailFromQuery, email]);

  const handleVerify = async () => {
    if (!email || code.length < 6) {
      setError('Enter the 6-digit code.');
      return;
    }
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const { data, error: verifyError } = await supabase.auth.verifyOtp({
        email,
        token: code,
        type: 'email',
      });
      if (verifyError || !data.session || !data.user) throw verifyError || new Error('Invalid code');

      // Load patient id and metadata
      let patientId: string | undefined;
      const meta = (data.user.user_metadata || {}) as Record<string, unknown>;
      const roleValue = typeof meta['role'] === 'string' ? (meta['role'] as string) : 'patient';
      const role: 'patient' | 'provider' | 'admin' | null =
        roleValue === 'provider' || roleValue === 'admin' ? (roleValue as 'provider' | 'admin') : 'patient';
      try {
        const { data: userRecord } = await supabase
          .from('users')
          .select('patients(id)')
          .eq('supabase_auth_id', data.user.id)
          .single();
        if (userRecord?.patients) {
          const arr = Array.isArray(userRecord.patients) ? userRecord.patients : [userRecord.patients];
          patientId = arr[0]?.id;
        }
      } catch {
        // best effort
      }

      const user: User = {
        id: data.user.id,
        email: data.user.email || '',
        firstName: typeof meta['first_name'] === 'string' ? (meta['first_name'] as string) : '',
        lastName: typeof meta['last_name'] === 'string' ? (meta['last_name'] as string) : '',
        patientId: patientId ?? null,
        role,
      };

      completeMfa(data.session, user);
      setSuccess('Verified');
      router.push('/dashboard');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Verification failed.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) return;
    setResending(true);
    setError(null);
    setSuccess(null);
    try {
      await requestMfaCode(email);
      setSuccess('Code sent.');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unable to send code.';
      setError(message);
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-sky-50 pb-20 md:pb-8">
      <Header />
      <main className="max-w-md mx-auto px-4 py-10">
        <Card>
          <h1 className="text-2xl font-bold text-navy-600 mb-2">Two-Factor Verification</h1>
          <p className="text-gray-600 mb-4">Enter the 6-digit code sent to {email || 'your email'}.</p>
          {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
          {success && <p className="text-sm text-green-600 mb-3">{success}</p>}
          <div className="space-y-3">
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ''))}
              className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-400"
              placeholder="Enter 6-digit code"
            />
            <Button variant="primary" className="w-full" onClick={handleVerify} isLoading={loading} disabled={loading}>
              Verify
            </Button>
            <Button variant="outline" className="w-full" onClick={handleResend} isLoading={resending} disabled={resending || !email}>
              Resend code
            </Button>
          </div>
        </Card>
      </main>
      <BottomNav />
    </div>
  );
}

export default function MfaPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full" />
      </div>
    }>
      <MfaPageContent />
    </Suspense>
  );
}
