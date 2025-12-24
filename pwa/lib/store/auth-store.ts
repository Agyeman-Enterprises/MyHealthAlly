/**
 * Authentication Store
 * 
 * Manages authentication state using Zustand
 * Now integrates with Supabase Auth
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiClient } from '../api/solopractice-client';
import { signIn, signOut, getCurrentUser, onAuthStateChange } from '../supabase/auth';

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
  // Supabase Auth methods
  signInWithSupabase: (email: string, password: string) => Promise<void>;
  signOutFromSupabase: () => Promise<void>;
  syncSupabaseAuth: () => Promise<void>;
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

      logout: async () => {
        apiClient.clearTokens();
        // Also sign out from Supabase if signed in
        try {
          await signOut();
        } catch (e) {
          // Ignore if not signed in to Supabase
        }
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

        // Also check Supabase auth
        getCurrentUser().then((user) => {
          if (user) {
            set({
              isAuthenticated: true,
              userId: user.id,
              role: user.role as UserRole,
            });
          }
        });

        // Listen to auth changes
        onAuthStateChange((event, session) => {
          if (event === 'SIGNED_OUT') {
            set({
              isAuthenticated: false,
              accessToken: null,
              refreshToken: null,
              userId: null,
              role: null,
            });
          } else if (event === 'SIGNED_IN' && session) {
            getCurrentUser().then((user) => {
              if (user) {
                set({
                  isAuthenticated: true,
                  userId: user.id,
                  role: user.role as UserRole,
                });
              }
            });
          }
        });
      },

      signInWithSupabase: async (email: string, password: string) => {
        const { data, error } = await signIn(email, password);
        if (error || !data.session) throw error || new Error('Sign in failed');

        const user = await getCurrentUser();
        if (!user) throw new Error('User record not found');

        set({
          isAuthenticated: true,
          userId: user.id,
          role: user.role as UserRole,
          accessToken: data.session.access_token,
          refreshToken: data.session.refresh_token,
        });
      },

      signOutFromSupabase: async () => {
        await signOut();
        set({
          isAuthenticated: false,
          accessToken: null,
          refreshToken: null,
          userId: null,
          role: null,
          patientId: null,
          practiceId: null,
        });
      },

      syncSupabaseAuth: async () => {
        const user = await getCurrentUser();
        if (user) {
          set({
            isAuthenticated: true,
            userId: user.id,
            role: user.role as UserRole,
          });
        }
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);
