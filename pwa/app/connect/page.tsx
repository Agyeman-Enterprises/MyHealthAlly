/**
 * Connect to Care Team - Main Page
 * 
 * Entry point for practice attachment flow
 */

'use client';

import { useRouter } from 'next/navigation';
import { useRequireAuth } from '@/lib/auth/use-require-auth';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { Card } from '@/components/ui/Card';

export default function ConnectPage() {
  const router = useRouter();
  const { isLoading } = useRequireAuth();
  if (isLoading) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-sky-50 pb-20 md:pb-8">
      <Header title="Connect to a Care Team" showBack />
      
      <main className="max-w-2xl mx-auto px-4 py-8">
        <Card className="mb-6">
          <h1 className="text-2xl font-bold text-navy-600 mb-4">Connect to a Care Team</h1>
          <p className="text-gray-600 mb-6">
            Connect to a healthcare practice to access clinical features like messages, lab results, medications, and appointments.
          </p>

          <div className="space-y-4">
            <Card hover className="cursor-pointer" onClick={() => router.push('/connect/ohimaa')}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-navy-600">Ohimaa GU Functional Medicine</h3>
                  <p className="text-sm text-gray-500 mt-1">Primary care and functional medicine</p>
                </div>
                <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Card>

            <Card hover className="cursor-pointer" onClick={() => router.push('/connect/medrx')}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-navy-600">MedRx</h3>
                  <p className="text-sm text-gray-500 mt-1">Pharmacy and medication management</p>
                </div>
                <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Card>

            <Card hover className="cursor-pointer" onClick={() => router.push('/connect/invite')}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-navy-600">Connect via Invite</h3>
                  <p className="text-sm text-gray-500 mt-1">Use an invitation code from your care team</p>
                </div>
                <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Card>
          </div>
        </Card>

        <Card className="bg-blue-50 border-blue-200">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> You can still use non-clinical features like education, vitals tracking, and health tools without connecting to a care team.
          </p>
        </Card>
      </main>

      <BottomNav />
    </div>
  );
}

