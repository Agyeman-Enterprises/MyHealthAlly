'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email');
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);

  useEffect(() => {
    // Check if email is already verified
    const checkVerification = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.email_confirmed_at) {
        router.push('/dashboard');
      }
    };

    checkVerification();

    // Listen for email verification
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user?.email_confirmed_at) {
        router.push('/dashboard');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  const handleResend = async () => {
    if (!email) return;

    setResending(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      });

      if (error) throw error;
      setResent(true);
    } catch (err: any) {
      console.error('Resend error:', err);
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-primary-100/50 px-4 py-12">
      <div className="max-w-md w-full">
        <Card variant="elevated" className="p-8 text-center">
          <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-4">Check Your Email</h1>
          
          <p className="text-gray-600 mb-6">
            We've sent a verification link to{' '}
            <span className="font-semibold text-gray-900">{email}</span>
          </p>

          <p className="text-sm text-gray-500 mb-8">
            Click the link in the email to verify your account and complete registration.
          </p>

          {resent ? (
            <div className="rounded-lg bg-green-50 border border-green-200 p-4 mb-6">
              <p className="text-sm text-green-800">Verification email resent!</p>
            </div>
          ) : (
            <Button
              variant="outline"
              onClick={handleResend}
              isLoading={resending}
              className="w-full mb-6"
            >
              Resend Verification Email
            </Button>
          )}

          <div className="space-y-2">
            <Link
              href="/auth/login"
              className="block text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              ← Back to Sign In
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}

