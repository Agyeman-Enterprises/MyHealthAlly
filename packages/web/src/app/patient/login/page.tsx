'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PrimaryButton } from '@/components/ui/primary-button';
import { GlowCard } from '@/components/ui/glow-card';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { QuickUnlockPanel } from '@/components/auth/QuickUnlockPanel';
import { Logo } from '@/components/branding/Logo';

export default function PatientLoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, loading: authLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Redirect if already authenticated (in useEffect to avoid render-time navigation)
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.push('/patient/dashboard');
    }
  }, [isAuthenticated, authLoading, router]);

  // Show loading state while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 to-teal-50">
        <div className="text-center">
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render form if authenticated (redirect will happen)
  if (isAuthenticated) {
    return null;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
    } catch (err: any) {
      const errorMessage = err?.message || 'We couldn\'t sign you in. Please check your email and password.';
      console.error('[PatientLoginPage] Login error:', {
        error: err,
        message: errorMessage,
        email: email ? 'provided' : 'missing',
      });
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 to-teal-50">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <Logo width={240} height={72} />
          </div>
          <p className="text-body text-slate-600">Your health, in one connected place.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <GlowCard className="p-6 space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-small font-medium text-slate-900">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-white border-slate-200 text-slate-900"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-small font-medium text-slate-900">
                Password
              </label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-white border-slate-200 text-slate-900"
              />
            </div>
            {error && (
              <div className="text-small rounded-lg p-3 text-red-600 bg-red-50 border border-red-200">
                {error}
              </div>
            )}
          </GlowCard>

          <PrimaryButton 
            type="submit"
            className="w-full" 
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Continue to your health dashboard'}
          </PrimaryButton>
        </form>

        <QuickUnlockPanel variant="patient" />

        <p className="text-center text-caption text-slate-600">
          MyHealthAlly • Secure care connection
        </p>
      </div>
    </div>
  );
}

