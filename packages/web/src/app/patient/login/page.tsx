'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PrimaryButton } from '@/components/ui/primary-button';
import { GlowCard } from '@/components/ui/glow-card';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';

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
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: 'var(--color-background)' }}>
        <div className="text-center">
          <p style={{ color: 'var(--color-textSecondary)' }}>Loading...</p>
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
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: 'var(--color-background)' }}>
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-h1 font-semibold" style={{ color: 'var(--color-textPrimary)' }}>MYHEALTHALLY</h1>
          <p className="text-body" style={{ color: 'var(--color-textSecondary)' }}>Your health, in one connected place.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <GlowCard className="p-6 space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-small font-medium" style={{ color: 'var(--color-textPrimary)' }}>
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  backgroundColor: 'var(--color-surface)',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-textPrimary)',
                }}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-small font-medium" style={{ color: 'var(--color-textPrimary)' }}>
                Password
              </label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{
                  backgroundColor: 'var(--color-surface)',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-textPrimary)',
                }}
              />
            </div>
            {error && (
              <div 
                className="text-small rounded-lg p-3"
                style={{
                  color: 'var(--color-danger)',
                  backgroundColor: 'rgba(225, 85, 85, 0.1)',
                  border: '1px solid rgba(225, 85, 85, 0.2)',
                  borderRadius: 'var(--radius)',
                }}
              >
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

        <p className="text-center text-caption" style={{ color: 'var(--color-textSecondary)' }}>
          MyHealthAlly • Secure care connection
        </p>
      </div>
    </div>
  );
}

