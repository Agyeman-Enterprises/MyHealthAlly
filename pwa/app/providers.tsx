'use client';

import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from '@/lib/store/auth-store';
import { useLanguageStore } from '@/lib/i18n/language-store';
import { LanguageProvider } from '@/components/layout/LanguageProvider';
import { ThemeProvider } from '@/components/theme/ThemeProvider';

interface ProvidersProps {
  children: ReactNode;
}

// Create QueryClient function - ensures one instance per app
function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5, // 5 minutes
        refetchOnWindowFocus: false,
        retry: 1,
      },
    },
  });
}

// Browser: create singleton instance
let browserQueryClient: QueryClient | undefined = undefined;
function getQueryClient() {
  if (typeof window === 'undefined') {
    // Server: always make a new query client
    return makeQueryClient();
  } else {
    // Browser: use singleton pattern to keep the same query client
    if (!browserQueryClient) browserQueryClient = makeQueryClient();
    return browserQueryClient;
  }
}

// Public routes that don't require auth initialization
const PUBLIC_ROUTES = ['/provider/login', '/auth/login', '/auth/signup', '/auth/forgot-password', '/auth/reset-password', '/auth/verify-email', '/'];

export function Providers({ children }: ProvidersProps) {
  // Create QueryClient instance
  const queryClient = getQueryClient();
  const [isReady, setIsReady] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const initialize = useAuthStore((state) => state.initialize);
  const syncWithDatabase = useLanguageStore((state) => state.syncWithDatabase);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  // Track client-side mounting to avoid hydration mismatches
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Initialize auth state from cookies/localStorage and restore Supabase session
    const initAuth = async () => {
      try {
        await initialize(); // Now async, restores Supabase session
      } catch (err) {
        console.error('Error initializing auth:', err);
        // Continue even if initialization fails
      } finally {
        setIsReady(true);
      }
    };
    
    initAuth();
  }, [initialize]);

  useEffect(() => {
    // Sync language preference from database when authenticated
    if (isReady && isAuthenticated) {
      syncWithDatabase().catch((err) => {
        console.error('Error syncing language preference:', err);
      });
    }
  }, [isReady, isAuthenticated, syncWithDatabase]);

  // Check if current route is public (only after mount to avoid hydration mismatch)
  const isPublicRoute = mounted && pathname ? PUBLIC_ROUTES.includes(pathname) : false;

  // During SSR or before mount, always render children to avoid hydration mismatch
  // For public routes, always render immediately
  // For private routes, show loading until auth is ready
  if (!mounted || isPublicRoute) {
    return (
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <LanguageProvider>
            {children}
          </LanguageProvider>
        </ThemeProvider>
      </QueryClientProvider>
    );
  }

  // For private routes, show loading until auth is initialized
  if (!isReady) {
    return (
      <QueryClientProvider client={queryClient}>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F5F3F7] via-white to-[#E8E4ED]">
          <div className="text-center">
            <div className="animate-spin w-10 h-10 border-4 border-[#B8A9C9] border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-gray-500">Loading...</p>
          </div>
        </div>
      </QueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
