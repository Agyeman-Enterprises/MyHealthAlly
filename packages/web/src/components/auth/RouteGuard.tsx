'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

type RouteGuardProps = {
  children: React.ReactNode;
  allowedRoles: string[];
  redirectTo?: string;
};

export function RouteGuard({ children, allowedRoles, redirectTo }: RouteGuardProps) {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;

    if (!isAuthenticated || !user) {
      router.push(redirectTo || '/patient/login');
      return;
    }

    if (!allowedRoles.includes(user.role)) {
      // Redirect based on role
      if (user.role === 'PATIENT') {
        router.push('/patient/dashboard');
      } else if (user.role === 'PROVIDER' || user.role === 'MEDICAL_ASSISTANT' || user.role === 'ADMIN') {
        router.push('/clinician/dashboard');
      } else {
        router.push('/patient/login');
      }
    }
  }, [user, loading, isAuthenticated, allowedRoles, router, redirectTo, pathname]);

  if (loading) {
    return (
      <div className="min-h-screen bg-clinician-bg flex items-center justify-center">
        <div className="text-center">
          <p className="text-clinician-textMuted">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user || !allowedRoles.includes(user.role)) {
    return null;
  }

  return <>{children}</>;
}

