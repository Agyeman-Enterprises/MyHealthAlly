/**
 * Connect to Ohimaa Practice
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth-store';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { attachPractice } from '@/lib/attachPractice';
import { getCurrentUserAndPatient } from '@/lib/supabase/queries-settings';

const OHIMAA_PRACTICE_ID = 'ohimaa-practice-id'; // TODO: Replace with actual practice ID

export default function ConnectOhimaaPage() {
  const router = useRouter();
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConnect = async () => {
    setConnecting(true);
    setError(null);

    try {
      const { user, patient } = await getCurrentUserAndPatient();

      if (!user || !patient) {
        setError('User or patient data not found. Please complete your profile first.');
        setConnecting(false);
        return;
      }

      await attachPractice({
        user: {
          id: user.id,
          email: user.email || '',
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone,
        },
        patient: patient as any, // Type assertion needed due to query shape
        practiceId: OHIMAA_PRACTICE_ID,
        practiceName: 'Ohimaa GU Functional Medicine',
        consentAccepted: true,
        source: 'OHIMAA',
      });

      router.push('/connect/status?success=true&practice=Ohimaa');
    } catch (err) {
      console.error('Connection error:', err);
      setError(err instanceof Error ? err.message : 'Failed to connect');
    } finally {
      setConnecting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-sky-50 pb-20 md:pb-8">
      <Header title="Connect to Ohimaa" showBack />
      
      <main className="max-w-2xl mx-auto px-4 py-8">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        <Card className="mb-6">
          <h1 className="text-2xl font-bold text-navy-600 mb-4">Ohimaa GU Functional Medicine</h1>
          <p className="text-gray-600 mb-6">
            Connect to Ohimaa GU Functional Medicine to access your care team, lab results, medications, and appointments.
          </p>

          <div className="space-y-4">
            <Button
              variant="primary"
              className="w-full"
              onClick={handleConnect}
              isLoading={connecting}
              disabled={connecting}
            >
              {connecting ? 'Connecting...' : 'Connect to Ohimaa'}
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => router.back()}
              disabled={connecting}
            >
              Cancel
            </Button>
          </div>
        </Card>
      </main>

      <BottomNav />
    </div>
  );
}

