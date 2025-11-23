'use client';

import { useEffect } from 'react';
import { registerBuilderComponents } from './registry';

export function BuilderProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Register Builder components once on mount
    if (typeof window !== 'undefined') {
      registerBuilderComponents();
    }
  }, []);

  return <>{children}</>;
}

