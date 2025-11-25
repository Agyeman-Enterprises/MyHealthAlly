'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { fetchAPI } from '@/lib/utils';
import type { AuthResponse, DeviceSummary, SessionSummary } from '@myhealthally/shared';
import { getDeviceMetadata } from '@/lib/device';
import {
  persistAuthResponse,
  getStoredMetaSync,
  clearAuthStorage,
  getRefreshToken,
} from '@/lib/auth-storage';

interface User {
  id: string;
  email: string;
  role: string;
  patientId?: string;
  providerId?: string;
  clinicId?: string;
}

interface AuthContextType {
  user: User | null;
  patient: any | null;
  device: DeviceSummary | null;
  session: SessionSummary | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  applyAuthResponse: (response: AuthResponse, redirect?: boolean) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isPatient: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [patient, setPatient] = useState<any | null>(null);
  const [device, setDevice] = useState<DeviceSummary | null>(null);
  const [session, setSession] = useState<SessionSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const loadPatient = useCallback(async () => {
    try {
      const patientData = await fetchAPI('/patients/me');
      setPatient(patientData);
    } catch (error) {
      console.error('Error loading patient:', error);
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') {
      setLoading(false);
      return;
    }

    const meta = getStoredMetaSync();
    if (meta?.user) {
      setUser(meta.user);
      setDevice(meta.device ?? null);
      setSession(meta.session ?? null);
      if (meta.user.role === 'PATIENT') {
        loadPatient();
      }
    }

    setLoading(false);
  }, [loadPatient]);

  const applyAuthResponse = useCallback(
    async (response: AuthResponse, redirect = true) => {
      await persistAuthResponse(response);
      setUser(response.user);
      setDevice(response.device || null);
      setSession(response.session || null);

      if (response.user.role === 'PATIENT') {
        await loadPatient();
        if (redirect) router.push('/patient/dashboard');
      } else if (
        response.user.role === 'PROVIDER' ||
        response.user.role === 'MEDICAL_ASSISTANT' ||
        response.user.role === 'ADMIN'
      ) {
        setPatient(null);
        if (redirect) router.push('/clinician/dashboard');
      } else if (redirect) {
        router.push('/patient/login');
      }
    },
    [loadPatient, router],
  );

  const login = async (email: string, password: string) => {
    try {
      const deviceMetadata = getDeviceMetadata();
      const response = await fetchAPI('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password, device: deviceMetadata }),
      });

      await applyAuthResponse(response);
    } catch (error: any) {
      throw new Error(error.message || 'Login failed');
    }
  };

  const logout = useCallback(async () => {
    try {
      const refreshToken = await getRefreshToken();
      if (refreshToken) {
        await fetchAPI('/auth/logout', {
          method: 'POST',
          body: JSON.stringify({ refreshToken }),
        });
      }
    } catch (error) {
      console.warn('Failed to revoke session', error);
    } finally {
      await clearAuthStorage();
      setUser(null);
      setPatient(null);
      setDevice(null);
      setSession(null);
      router.push('/patient/login');
    }
  }, [router]);

  return (
    <AuthContext.Provider
      value={{
        user,
        patient,
        device,
        session,
        loading,
        login,
        applyAuthResponse,
        logout,
        isAuthenticated: !!user,
        isPatient: user?.role === 'PATIENT',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
