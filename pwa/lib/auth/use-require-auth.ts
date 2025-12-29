'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth-store';

/**
 * Hook to require authentication on a page
 * 
 * Usage in any protected page:
 * const { user, isLoading } = useRequireAuth();
 * if (isLoading) return <LoadingSpinner />;
 */
export function useRequireAuth() {
  const router = useRouter();
  const { user, isAuthenticated, isInitialized } = useAuthStore();

  useEffect(() => {
    // Wait for auth to initialize
    if (!isInitialized) return;

    // If not authenticated, redirect to login
    if (!isAuthenticated) {
      const currentPath = window.location.pathname;
      router.replace(`/auth/login?redirect=${encodeURIComponent(currentPath)}`);
    }
  }, [isInitialized, isAuthenticated, router]);

  return {
    user,
    isAuthenticated,
    isLoading: !isInitialized,
  };
}
