'use client';

import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { useAuthStore } from '@/lib/store/auth-store';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  const [isReady, setIsReady] = useState(false);
  const initialize = useAuthStore((state) => state.initialize);

  useEffect(() => {
    // Initialize auth state from cookies/localStorage
    initialize();
    setIsReady(true);
  }, [initialize]);

  // Show loading spinner until auth is initialized
  if (!isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F5F3F7] via-white to-[#E8E4ED]">
        <div className="text-center">
          <div className="animate-spin w-10 h-10 border-4 border-[#B8A9C9] border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
