/**
 * Connect via Invite Code
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth-store';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { attachPractice } from '@/lib/attachPractice';
import { getCurrentUserAndPatient } from '@/lib/supabase/queries-settings';

export default function ConnectInvitePage() {
  const router = useRouter();
  const [inviteCode, setInviteCode] = useState('');
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConnect = async () => {
    if (!inviteCode.trim()) {
      setError('Please enter an invitation code');
      return;
    }

    setConnecting(true);
    setError(null);

    try {
      const { user, patient } = await getCurrentUserAndPatient();

      if (!user || !patient) {
        setError('User or patient data not found. Please complete your profile first.');
        setConnecting(false);
        return;
      }

      // TODO: Validate invite code and get practice ID
      // For now, this is a placeholder
      // In production, call: GET /api/practices/invite/{code} to get practice details
      
      // Placeholder: Extract practice ID from invite code or validate it
      const practiceId = inviteCode.trim(); // This should be validated against a database
      
      await attachPractice({
        user: {
          id: user.id,
          email: user.email || '',
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone,
        },
        patient: patient as any, // Type assertion needed due to query shape
        practiceId,
        practiceName: 'Invited Practice',
        consentAccepted: true,
        source: 'INVITE',
      });

      router.push('/connect/status?success=true&practice=Invited Practice');
    } catch (err) {
      console.error('Connection error:', err);
      setError(err instanceof Error ? err.message : 'Failed to connect');
    } finally {
      setConnecting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-sky-50 pb-20 md:pb-8">
      <Header title="Connect via Invite" showBack />
      
      <main className="max-w-2xl mx-auto px-4 py-8">
        <Card className="mb-6">
          <h1 className="text-2xl font-bold text-navy-600 mb-4">Connect via Invitation</h1>
          <p className="text-gray-600 mb-6">
            Enter the invitation code provided by your care team to connect to their practice.
          </p>

          {error && (
            <Card className="mb-4 bg-red-50 border-red-200">
              <p className="text-red-800 text-sm">{error}</p>
            </Card>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Invitation Code
              </label>
              <Input
                type="text"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                placeholder="Enter invitation code"
                disabled={connecting}
              />
            </div>

            <Button
              variant="primary"
              className="w-full"
              onClick={handleConnect}
              isLoading={connecting}
              disabled={connecting || !inviteCode.trim()}
            >
              {connecting ? 'Connecting...' : 'Connect'}
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

