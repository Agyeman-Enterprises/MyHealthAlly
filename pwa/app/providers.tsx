'use client';

import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { useAuthStore } from '@/lib/store/auth-store';
import { useLanguageStore } from '@/lib/i18n/language-store';
import { LanguageProvider } from '@/components/layout/LanguageProvider';
import { ThemeProvider } from '@/components/theme/ThemeProvider';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  const [isReady, setIsReady] = useState(false);
  const initialize = useAuthStore((state) => state.initialize);
  const syncWithDatabase = useLanguageStore((state) => state.syncWithDatabase);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    // Initialize auth state from cookies/localStorage
    initialize();
    setIsReady(true);
  }, [initialize]);

  useEffect(() => {
    // Sync language preference from database when authenticated
    if (isReady && isAuthenticated) {
      syncWithDatabase().catch((err) => {
        console.error('Error syncing language preference:', err);
      });
    }
  }, [isReady, isAuthenticated, syncWithDatabase]);

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

  return (
    <ThemeProvider>
      <LanguageProvider>
        {children}
      </LanguageProvider>
    </ThemeProvider>
  );
}
