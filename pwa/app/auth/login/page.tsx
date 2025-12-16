'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth-store';
import { apiClient } from '@/lib/api/solopractice-client';
import Link from 'next/link';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  const [token, setToken] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleActivate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await apiClient.activateAccount(token);
      login(
        response.access_token,
        response.refresh_token,
        response.patient_id,
        response.practice_id
      );
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Activation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleTestLogin = () => {
    if (process.env.NODE_ENV === 'development') {
      login(
        'dev-test-access-token',
        'dev-test-refresh-token',
        'dev-test-patient-id',
        'dev-test-practice-id',
        'patient'
      );
      router.push('/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-primary-100/50 px-4 py-12">
      <div className="max-w-md w-full animate-fade-in">
        {/* Logo & Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-primary rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent mb-2">
            MyHealth Ally
          </h1>
          <p className="text-gray-600">
            Activate your account to get started
          </p>
        </div>

        <Card variant="elevated" className="p-8">
          <form onSubmit={handleActivate} className="space-y-6">
            <Input
              label="Activation Token"
              type="text"
              placeholder="Enter your activation token"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              required
              icon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
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
              Activate Account
            </Button>
          </form>

          {/* DEV ONLY: Test login */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <Button
                variant="outline"
                size="md"
                onClick={handleTestLogin}
                className="w-full"
              >
                🧪 Test Login (Dev Only)
              </Button>
              <p className="mt-2 text-xs text-center text-gray-500">
                Development mode only - bypasses authentication
              </p>
            </div>
          )}

          {/* Provider login link */}
          <div className="mt-6 text-center">
            <Link
              href="/provider/login"
              className="text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
            >
              Provider Login →
            </Link>
          </div>
        </Card>

        {/* Footer */}
        <p className="mt-8 text-center text-sm text-gray-500">
          Secure patient engagement platform
        </p>
      </div>
    </div>
  );
}
