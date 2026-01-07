'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth-store';
import { providerApiClient } from '@/lib/api/provider-client';
import Link from 'next/link';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

function ProviderLoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, role } = useAuthStore();
  const loginProvider = useAuthStore((state) => state.loginProvider);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const redirectTo = searchParams.get('redirect') || '/provider/dashboard';

  // Load saved email and remember me preference
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedEmail = localStorage.getItem('mha-saved-email');
      const savedRememberMe = localStorage.getItem('mha-remember-me') === 'true';
      if (savedEmail && savedRememberMe) {
        setEmail(savedEmail);
        setRememberMe(true);
      }
    }
  }, []);

  // If already authenticated, redirect away from login page
  useEffect(() => {
    if (isAuthenticated && (role === 'provider' || role === 'admin')) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, role, router, redirectTo]);

  // Don't render login form if already authenticated
  if (isAuthenticated && (role === 'provider' || role === 'admin')) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-200 border-t-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecting...</p>
        </div>
      </div>
    );
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Save email and remember me preference
      if (rememberMe && typeof window !== 'undefined') {
        localStorage.setItem('mha-saved-email', email);
        localStorage.setItem('mha-remember-me', 'true');
      } else if (typeof window !== 'undefined') {
        localStorage.removeItem('mha-saved-email');
        localStorage.removeItem('mha-remember-me');
      }

      // Try Supabase Auth first
      try {
        const { signInWithSupabase } = useAuthStore.getState();
        await signInWithSupabase(email, password, rememberMe);
        router.push(redirectTo);
        return;
      } catch (supabaseError) {
        // If Supabase fails, try SoloPractice API (for backward compatibility)
        const errorMessage = supabaseError instanceof Error ? supabaseError.message : 'Unknown error';
        console.log('Supabase auth failed, trying SoloPractice API...', errorMessage);
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
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleTestProviderLogin = async () => {
    console.log('Test Provider Login clicked');
    try {
      const testToken = 'dev-test-provider-access-token';
      
      // Set auth cookie for middleware
      document.cookie = `auth-token=${testToken}; path=/; max-age=86400; SameSite=Lax`;
      
      // Update auth state
      loginProvider(
        testToken,
        'dev-test-provider-refresh-token',
        'dev-test-practice-id',
        'dev-test-provider-user-id',
        'provider'
      );
      console.log('Auth state updated');
      
      // Wait a moment for Zustand persist to save to localStorage
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Verify auth state was saved
      const authState = useAuthStore.getState();
      console.log('Auth state after update:', {
        isAuthenticated: authState.isAuthenticated,
        role: authState.role,
        userId: authState.userId
      });
      
      console.log('Redirecting to:', redirectTo);
      
      // Force redirect
      window.location.href = window.location.origin + redirectTo;
    } catch (error) {
      console.error('Test login error:', error);
      setError('Failed to login. Please try again.');
    }
  };

  const handleTestAdminLogin = async () => {
    console.log('Test Admin Login clicked');
    try {
      const testToken = 'dev-test-admin-access-token';
      
      // Set auth cookie for middleware
      document.cookie = `auth-token=${testToken}; path=/; max-age=86400; SameSite=Lax`;
      
      // Update auth state
      loginProvider(
        testToken,
        'dev-test-admin-refresh-token',
        'dev-test-practice-id',
        'dev-test-admin-user-id',
        'admin'
      );
      console.log('Auth state updated');
      
      // Wait a moment for Zustand persist to save to localStorage
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Verify auth state was saved
      const authState = useAuthStore.getState();
      console.log('Auth state after update:', {
        isAuthenticated: authState.isAuthenticated,
        role: authState.role,
        userId: authState.userId
      });
      
      console.log('Redirecting to:', redirectTo);
      
      // Force redirect
      window.location.href = window.location.origin + redirectTo;
    } catch (error) {
      console.error('Test login error:', error);
      setError('Failed to login. Please try again.');
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
              id="provider-email"
              name="email"
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

            <div>
              <label htmlFor="provider-password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 z-10">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  id="provider-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="w-full px-4 py-3 pl-12 pr-12 border-2 border-gray-200 rounded-xl transition-all duration-200 outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-100"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none z-10"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                Remember me
              </label>
            </div>

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

          {/* DEV ONLY: Test login buttons - Always visible in development */}
          {(process.env.NODE_ENV === 'development' || !process.env.NODE_ENV) && (
            <div className="mt-6 pt-6 border-t border-gray-200 space-y-3">
              <p className="text-sm font-medium text-gray-700 mb-2">Quick Test Login:</p>
              <Button
                variant="outline"
                size="md"
                onClick={handleTestProviderLogin}
                className="w-full bg-blue-50 hover:bg-blue-100 border-blue-300 text-blue-700"
              >
                🔵 Test Provider Login
              </Button>
              <Button
                variant="outline"
                size="md"
                onClick={handleTestAdminLogin}
                className="w-full bg-purple-50 hover:bg-purple-100 border-purple-300 text-purple-700"
              >
                🟣 Test Admin Login
              </Button>
              <p className="text-xs text-center text-gray-500 mt-2">
                Development mode - bypasses authentication
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

function LoadingState() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
    </div>
  );
}

export default function ProviderLoginPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <ProviderLoginContent />
    </Suspense>
  );
}
