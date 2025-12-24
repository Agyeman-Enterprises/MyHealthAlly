'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth-store';
import { providerApiClient } from '@/lib/api/provider-client';
import Link from 'next/link';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export default function ProviderLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const loginProvider = useAuthStore((state) => state.loginProvider);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const redirectTo = searchParams.get('redirect') || '/provider/dashboard';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Try Supabase Auth first
      try {
        const { signInWithSupabase } = useAuthStore.getState();
        await signInWithSupabase(email, password);
        router.push(redirectTo);
        return;
      } catch (supabaseError: any) {
        // If Supabase fails, try SoloPractice API (for backward compatibility)
        console.log('Supabase auth failed, trying SoloPractice API...', supabaseError);
      }

      // Fallback to SoloPractice API
      const response = await providerApiClient.login(email, password);
      loginProvider(
        response.access_token,
        response.refresh_token,
        response.practice_id,
        response.user_id,
        response.role
      );
      router.push(redirectTo);
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleTestProviderLogin = () => {
    if (process.env.NODE_ENV === 'development') {
      loginProvider(
        'dev-test-provider-access-token',
        'dev-test-provider-refresh-token',
        'dev-test-practice-id',
        'dev-test-provider-user-id',
        'provider'
      );
      router.push(redirectTo);
    }
  };

  const handleTestAdminLogin = () => {
    if (process.env.NODE_ENV === 'development') {
      loginProvider(
        'dev-test-admin-access-token',
        'dev-test-admin-refresh-token',
        'dev-test-practice-id',
        'dev-test-admin-user-id',
        'admin'
      );
      router.push(redirectTo);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-primary-100/50 px-4 py-12">
      <div className="max-w-md w-full animate-fade-in">
        {/* Logo & Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-primary rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent mb-2">
            Provider Portal
          </h1>
          <p className="text-gray-600">
            Sign in to your provider account
          </p>
        </div>

        <Card variant="elevated" className="p-8">
          <form onSubmit={handleLogin} className="space-y-6">
            <Input
              label="Email Address"
              type="email"
              placeholder="provider@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              icon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                </svg>
              }
            />

            <Input
              label="Password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              icon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              }
            />

            {error && (
              <div className="rounded-xl bg-red-50 border-2 border-red-200 p-4 animate-slide-in">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-red-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm font-medium text-red-800">{error}</p>
                </div>
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={loading}
              className="w-full"
            >
              Sign In
            </Button>
          </form>

          {/* DEV ONLY: Test login buttons */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-6 pt-6 border-t border-gray-200 space-y-3">
              <Button
                variant="outline"
                size="md"
                onClick={handleTestProviderLogin}
                className="w-full"
              >
                🧪 Test Provider Login (Dev Only)
              </Button>
              <Button
                variant="outline"
                size="md"
                onClick={handleTestAdminLogin}
                className="w-full"
              >
                🧪 Test Admin Login (Dev Only)
              </Button>
              <p className="text-xs text-center text-gray-500">
                Development mode only - bypasses authentication
              </p>
            </div>
          )}

          {/* Patient login link */}
          <div className="mt-6 text-center">
            <Link
              href="/auth/login"
              className="text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
            >
              ← Patient Login
            </Link>
          </div>
        </Card>

        {/* Footer */}
        <p className="mt-8 text-center text-sm text-gray-500">
          Secure provider portal for healthcare professionals
        </p>
      </div>
    </div>
  );
}
