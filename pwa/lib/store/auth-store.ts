/**
 * Authentication Store
 * 
 * Manages authentication state using Zustand
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiClient } from '../api/solopractice-client';

interface AuthState {
  isAuthenticated: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  patientId: string | null;
  practiceId: string | null;
  userId: string | null;
  
  // Actions
  login: (accessToken: string, refreshToken: string, patientId: string, practiceId: string) => void;
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

      login: (accessToken, refreshToken, patientId, practiceId) => {
        apiClient.setTokens(accessToken, refreshToken);
        set({
          isAuthenticated: true,
          accessToken,
          refreshToken,
          patientId,
          practiceId,
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
        });
      },

      initialize: () => {
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
