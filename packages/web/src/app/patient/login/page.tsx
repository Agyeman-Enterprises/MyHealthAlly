'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PrimaryButton } from '@/components/ui/primary-button';
import { GlowCard } from '@/components/ui/glow-card';

export default function PatientLoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    setLoading(true);
    // Simulate login/face ID check
    setTimeout(() => {
      router.push('/patient/dashboard');
    }, 500);
  };

  return (
    <div className="min-h-screen bg-myh-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-semibold text-myh-text">MYHEALTHALLY</h1>
          <p className="text-myh-textSoft text-lg">Your health, in one connected place.</p>
        </div>

        <GlowCard clickable className="p-8 text-center space-y-6">
          <div className="w-20 h-20 mx-auto bg-myh-primarySoft rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-myh-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <p className="text-myh-text font-medium">Use Face ID</p>
        </GlowCard>

        <PrimaryButton 
          className="w-full" 
          onClick={handleContinue}
          disabled={loading}
        >
          {loading ? 'Loading...' : 'Continue to your health dashboard'}
        </PrimaryButton>

        <p className="text-center text-sm text-myh-textSoft">
          MyHealthAlly • Secure care connection
        </p>
      </div>
    </div>
  );
}

