'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth-store';
import { env } from '@/lib/env';
import Image from 'next/image';
import { supabase } from '@/lib/supabase/client';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, isAuthenticated, isInitialized } = useAuthStore();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [activationToken, setActivationToken] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [logoError, setLogoError] = useState(false);
  const [isActivationMode, setIsActivationMode] = useState(false);

  // Get redirect URL from query params, default to dashboard
  const redirectTo = searchParams.get('redirect') || '/dashboard';

  // If already authenticated, redirect
  useEffect(() => {
    if (isInitialized && isAuthenticated) {
      router.replace(redirectTo);
    }
  }, [isInitialized, isAuthenticated, router, redirectTo]);

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

  // Optional bypass for demos/tests
  useEffect(() => {
    if (!isInitialized || isAuthenticated) return;
    if (env.NEXT_PUBLIC_BYPASS_LOGIN !== 'true') return;
    const demoUser = {
      id: 'demo-user',
      email: 'demo@example.com',
      firstName: 'Demo',
      lastName: 'User',
    };
    login(demoUser);
    router.replace(redirectTo);
  }, [isInitialized, isAuthenticated, login, redirectTo, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter your email and password');
      return;
    }

    if (isActivationMode && !activationToken) {
      setError('Please enter your activation token');
      return;
    }

    setIsLoading(true);

    try {
      // Save email and remember me preference
      if (rememberMe && typeof window !== 'undefined') {
        localStorage.setItem('mha-saved-email', email);
        localStorage.setItem('mha-remember-me', 'true');
      } else if (typeof window !== 'undefined') {
        localStorage.removeItem('mha-saved-email');
        localStorage.removeItem('mha-remember-me');
      }

      // Handle activation mode
      if (isActivationMode) {
        // Use Supabase auth for account activation
        const { data: { user }, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              activation_token: activationToken,
            },
          },
        });

        if (signUpError) {
          throw signUpError;
        }

        if (!user) {
          throw new Error('Account activation failed');
        }

        // Sign in the user after activation
        const { data: { session }, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) {
          throw signInError;
        }

        if (!session) {
          throw new Error('Session not created');
        }
      }

      // Regular login or post-activation login
      const { signInWithSupabase } = useAuthStore.getState();
      await signInWithSupabase(email, password, rememberMe);
      
      router.replace(redirectTo);
    } catch (err) {
      console.error('Login error:', err);
      
      // Handle network errors
      if (err instanceof TypeError && err.message.includes('fetch')) {
        setError('Network error: Unable to connect to the server. Please check your internet connection and try again.');
      } else if (err instanceof Error) {
        // Handle Supabase auth errors
        if (err.message.includes('Invalid login credentials') || err.message.includes('Email not confirmed')) {
          setError('Invalid email or password. Please check your credentials and try again.');
        } else if (err.message.includes('Too many requests')) {
          setError('Too many login attempts. Please wait a few minutes and try again.');
        } else if (err.message.includes('User not found')) {
          setError('No account found with this email. Please check your email or sign up.');
        } else {
          setError(err.message || 'Login failed. Please try again.');
        }
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestLogin = () => {
    const testUser = {
      id: 'test-patient-123',
      email: 'test.patient@example.com',
      firstName: 'Test',
      lastName: 'Patient',
    };

    login(testUser);
    router.replace(redirectTo);
  };

  // Show loading while checking auth state
  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F5F3F7] via-white to-[#E8E4ED]">
        <div className="animate-spin w-10 h-10 border-4 border-[#B8A9C9] border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F3F7] via-white to-[#E8E4ED] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          {!logoError ? (
            <Image
              src="/images/MHA_logo.jpg"
              alt="MyHealth Ally"
              width={80}
              height={80}
              className="w-20 h-20 rounded-2xl mx-auto mb-4 shadow-lg object-cover"
              onError={() => setLogoError(true)}
            />
          ) : (
            <div className="w-20 h-20 bg-gradient-to-br from-[#B8A9C9] to-[#9B8AB8] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
          )}
          <h1 className="text-3xl font-bold text-[#3D4F6F]">MyHealth Ally</h1>
          <p className="text-gray-600 mt-1">
            {isActivationMode ? 'Activate your account to get started' : 'Sign in to your account'}
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="mb-6 flex items-center justify-center gap-2 border-b border-gray-200 pb-4">
            <button
              type="button"
              onClick={() => setIsActivationMode(false)}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                !isActivationMode
                  ? 'bg-[#9B8AB8] text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setIsActivationMode(true)}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                isActivationMode
                  ? 'bg-[#9B8AB8] text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Activate Account
            </button>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                <div className="flex items-start gap-2">
                  <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="font-medium">Login Failed</p>
                    <p className="text-xs mt-1">{error}</p>
                  </div>
                </div>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9B8AB8] focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete={isActivationMode ? 'new-password' : 'current-password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9B8AB8] focus:border-transparent"
              />
            </div>

            {isActivationMode && (
              <div>
                <label htmlFor="token" className="block text-sm font-medium text-gray-700 mb-1">
                  Activation Token
                </label>
                <input
                  id="token"
                  type="text"
                  autoComplete="off"
                  value={activationToken}
                  onChange={(e) => setActivationToken(e.target.value)}
                  placeholder="Enter your activation token"
                  required={isActivationMode}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9B8AB8] focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Check your welcome email for your activation token
                </p>
              </div>
            )}

            {!isActivationMode && (
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 text-[#9B8AB8] border-gray-300 rounded focus:ring-[#9B8AB8]"
                  />
                  <span className="text-sm text-gray-700">Remember me</span>
                </label>
                <a
                  href="/auth/forgot-password"
                  className="text-sm text-[#9B8AB8] hover:text-[#7E6BA1] hover:underline"
                >
                  Forgot password?
                </a>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-[#9B8AB8] hover:bg-[#7E6BA1] text-white font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  {isActivationMode ? 'Activating...' : 'Signing in...'}
                </span>
              ) : (
                isActivationMode ? 'Activate Account' : 'Sign In'
              )}
            </button>
          </form>

          {/* Test login - REMOVE BEFORE PRODUCTION */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handleTestLogin}
              className="w-full py-3 px-4 border-2 border-[#B8A9C9] text-[#7E6BA1] rounded-xl font-medium hover:bg-[#F5F3F7] transition-colors flex items-center justify-center gap-2"
            >
              🧪 Test Patient Login (Dev Only)
            </button>
            <p className="text-xs text-gray-500 text-center mt-2">
              Development mode only - bypasses authentication
            </p>
          </div>
        </div>

        <p className="text-center text-gray-500 text-sm mt-8">
          Secure patient engagement platform
        </p>
      </div>
    </div>
  );
}
