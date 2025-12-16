/**
 * Authentication Store
 * 
 * Manages authentication state using Zustand
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiClient } from '../api/solopractice-client';

export type UserRole = 'patient' | 'provider' | 'admin';

interface AuthState {
  isAuthenticated: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  patientId: string | null;
  practiceId: string | null;
  userId: string | null;
  role: UserRole | null;
  
  // Actions
  login: (accessToken: string, refreshToken: string, patientId: string, practiceId: string, role?: UserRole) => void;
  loginProvider: (accessToken: string, refreshToken: string, practiceId: string, userId: string, role: 'provider' | 'admin') => void;
  logout: () => void;
  initialize: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      accessToken: null,
      refreshToken: null,
      patientId: null,
      practiceId: null,
      userId: null,
      role: null,

      login: (accessToken, refreshToken, patientId, practiceId, role = 'patient') => {
        apiClient.setTokens(accessToken, refreshToken);
        set({
          isAuthenticated: true,
          accessToken,
          refreshToken,
          patientId,
          practiceId,
          role,
        });
      },

      loginProvider: (accessToken, refreshToken, practiceId, userId, role) => {
        apiClient.setTokens(accessToken, refreshToken);
        set({
          isAuthenticated: true,
          accessToken,
          refreshToken,
          practiceId,
          userId,
          role,
          patientId: null,
        });
      },

      logout: () => {
        apiClient.clearTokens();
        set({
          isAuthenticated: false,
          accessToken: null,
          refreshToken: null,
          patientId: null,
          practiceId: null,
          userId: null,
          role: null,
        });
      },

      initialize: () => {
        // Only initialize on client side
        if (typeof window === 'undefined') return;
        
        const accessToken = apiClient.getAccessToken();
        if (accessToken) {
          set({ isAuthenticated: true, accessToken });
        }
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);
