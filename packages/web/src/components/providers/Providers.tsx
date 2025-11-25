'use client';

import { AuthProvider } from '@/contexts/AuthContext';
import { BuilderProvider } from '@/components/builder/BuilderProvider';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <BuilderProvider>
      <AuthProvider>{children}</AuthProvider>
    </BuilderProvider>
  );
}

