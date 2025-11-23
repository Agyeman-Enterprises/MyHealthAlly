'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { fetchAPI } from '@/lib/utils';

interface User {
  id: string;
  email: string;
  role: string;
  patientId?: string;
}

interface AuthContextType {
  user: User | null;
  patient: any | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isPatient: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [patient, setPatient] = useState<any | null>(null);
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
    // Only run on client side
    if (typeof window === 'undefined') {
      setLoading(false);
      return;
    }

    // Check for existing session
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (token && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        
        // If patient, fetch patient record
        if (parsedUser.role === 'PATIENT') {
          loadPatient();
        }
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, [loadPatient]);

  const login = async (email: string, password: string) => {
    try {
      const response = await fetchAPI('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      if (typeof window !== 'undefined') {
        localStorage.setItem('token', response.accessToken);
        localStorage.setItem('user', JSON.stringify(response.user));
      }
      setUser(response.user);

      // Route based on role
      if (response.user.role === 'PATIENT') {
        await loadPatient();
        router.push('/patient/dashboard');
      } else if (response.user.role === 'PROVIDER' || response.user.role === 'MEDICAL_ASSISTANT' || response.user.role === 'ADMIN') {
        router.push('/clinician/dashboard');
      } else {
        // Fallback for unknown roles
        router.push('/patient/login');
      }
    } catch (error: any) {
      throw new Error(error.message || 'Login failed');
    }
  };

  const logout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    setUser(null);
    setPatient(null);
    router.push('/patient/login');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        patient,
        loading,
        login,
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

