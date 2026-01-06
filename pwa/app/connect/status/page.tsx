/**
 * Connection Status Page
 */

'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function ConnectStatusPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const success = searchParams.get('success') === 'true';
  const practice = searchParams.get('practice') || 'practice';

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-sky-50 pb-20 md:pb-8">
      <Header title="Connection Status" showBack={false} />
      
      <main className="max-w-2xl mx-auto px-4 py-8">
        <Card className="text-center">
          {success ? (
            <>
              <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Successfully Connected!</h1>
              <p className="text-gray-600 mb-6">
                You are now connected to {practice}. You can now access all clinical features.
              </p>
              <Button
                variant="primary"
                className="w-full"
                onClick={() => router.push('/dashboard')}
              >
                Go to Dashboard
              </Button>
            </>
          ) : (
            <>
              <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Connection Failed</h1>
              <p className="text-gray-600 mb-6">
                We couldn&apos;t connect you to the practice. Please try again or contact support.
              </p>
              <div className="space-y-3">
                <Button
                  variant="primary"
                  className="w-full"
                  onClick={() => router.push('/connect')}
                >
                  Try Again
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => router.push('/dashboard')}
                >
                  Go to Dashboard
                </Button>
              </div>
            </>
          )}
        </Card>
      </main>

      <BottomNav />
    </div>
  );
}

