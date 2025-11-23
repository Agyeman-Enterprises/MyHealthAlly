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
      <div className="min-h-screen bg-myh-bg flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-myh-textSoft">Loading...</p>
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
    <div className="min-h-screen bg-myh-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-semibold text-myh-text">MYHEALTHALLY</h1>
          <p className="text-myh-textSoft text-lg">Your health, in one connected place.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <GlowCard className="p-6 space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-myh-text">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-myh-surface border-myh-border text-myh-text placeholder:text-myh-textSoft focus-visible:ring-myh-primary"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-myh-text">
                Password
              </label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-myh-surface border-myh-border text-myh-text placeholder:text-myh-textSoft focus-visible:ring-myh-primary"
              />
            </div>
            {error && (
              <div className="text-sm text-myh-error bg-myh-error/10 border border-myh-error/20 rounded-lg p-3">
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

        <p className="text-center text-sm text-myh-textSoft">
          MyHealthAlly • Secure care connection
        </p>
      </div>
    </div>
  );
}

