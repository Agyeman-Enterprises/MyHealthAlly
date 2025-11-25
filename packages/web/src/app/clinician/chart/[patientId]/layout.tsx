'use client';

import { RouteGuard } from '@/components/auth/RouteGuard';

export default function ChartLayout({ children }: { children: React.ReactNode }) {
  return (
    <RouteGuard allowedRoles={['PROVIDER', 'MEDICAL_ASSISTANT', 'ADMIN']} redirectTo="/patient/login">
      {children}
    </RouteGuard>
  );
}

