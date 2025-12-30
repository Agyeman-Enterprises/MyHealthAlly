import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Session } from '@supabase/supabase-js';

/**
 * User interface - extended for all use cases
 */
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role?: 'patient' | 'provider' | 'admin' | null;
  phone?: string | null;
  dateOfBirth?: string | null;
  preferredLanguage?: string | null;
  patientId?: string | null;      // For patient users
  practiceId?: string | null;     // For provider users
}

/**
 * AuthStore interface - supports patient & provider auth
 */
export interface AuthStore {
  // State
  user: User | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
  mfaRequired: boolean;
  mfaEmail: string | null;
  role: 'patient' | 'provider' | 'admin' | null;
  accessToken: string | null;
  refreshToken: string | null;
  
  // Computed helpers (for backward compatibility)
  userId: string | null;
  patientId: string | null;
  practiceId: string | null;
  
  // Patient Actions
  login: (user: User, token?: string) => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  initialize: () => void;
  completeMfa: (session: Session, user: User) => void;
  requestMfaCode: (email: string) => Promise<void>;
  
  // Provider Actions
  loginProvider: (
    accessToken: string,
    refreshToken: string,
    practiceId: string,
    userId: string,
    role: 'provider' | 'admin'
  ) => void;
  
  // Supabase Auth
  signInWithSupabase: (email: string, password: string) => Promise<void>;
}

const AUTH_TOKEN_KEY = 'auth-token';

/**
 * Set auth token as a cookie (readable by middleware)
 */
function setAuthCookie(token: string): void {
  if (typeof document !== 'undefined') {
    document.cookie = `${AUTH_TOKEN_KEY}=${token}; path=/; max-age=${60 * 60 * 24 * 7}`; // 7 days
  }
}

/**
 * Clear auth token cookie
 */
function clearAuthCookie(): void {
  if (typeof document !== 'undefined') {
    document.cookie = `${AUTH_TOKEN_KEY}=; path=/; max-age=0`;
  }
}

/**
 * Generate a mock token for development
 */
function generateMockToken(userId: string): string {
  const payload = {
    sub: userId,
    iat: Date.now(),
    exp: Date.now() + (7 * 24 * 60 * 60 * 1000), // 7 days
  };
  return btoa(JSON.stringify(payload));
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      isAuthenticated: false,
      isInitialized: false,
      mfaRequired: false,
      mfaEmail: null,
      role: null,
      accessToken: null,
      refreshToken: null,
      
      // Computed getters (as properties that return current state)
      get userId() {
        return get().user?.id || null;
      },
      get patientId() {
        return get().user?.patientId || null;
      },
      get practiceId() {
        return get().user?.practiceId || null;
      },

      // Patient login
      login: (user: User, token?: string) => {
        const authToken = token || generateMockToken(user.id);
        setAuthCookie(authToken);
        
        set({ 
          user, 
          isAuthenticated: true, 
          isInitialized: true,
          mfaRequired: false,
          mfaEmail: null,
          role: 'patient',
          accessToken: authToken,
        });
      },

      // Provider login
      loginProvider: (
        accessToken: string,
        refreshToken: string,
        practiceId: string,
        userId: string,
        role: 'provider' | 'admin'
      ) => {
        setAuthCookie(accessToken);
        
        const user: User = {
          id: userId,
          email: '',
          firstName: role === 'admin' ? 'Admin' : 'Provider',
          lastName: 'User',
          practiceId,
        };
        
        set({
          user,
          isAuthenticated: true,
          isInitialized: true,
          role,
          accessToken,
          refreshToken,
        });
      },

      // Supabase sign in
      signInWithSupabase: async (email: string, password: string) => {
        // Dynamic import to avoid SSR issues
        const { supabase } = await import('@/lib/supabase/client');
        
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;
        if (!data.user) throw new Error('No user returned');

        // Load patient ID from users table
        let patientId: string | undefined;
        let twoFactorEnabled = false;
        try {
          const { data: userRecord, error: userError } = await supabase
            .from('users')
            .select('id, patients(id), two_factor_enabled')
            .eq('supabase_auth_id', data.user.id)
            .single();
          
          if (userError) {
            console.error('Error loading user record during sign in:', userError);
            // Don't fail login if user record query fails - might be a new user
          } else if (userRecord?.patients) {
            const patientsArray = Array.isArray(userRecord.patients) ? userRecord.patients : [userRecord.patients];
            patientId = patientsArray[0]?.id;
            twoFactorEnabled = userRecord.two_factor_enabled || false;
            
            if (patientId) {
              console.log('✅ Patient ID loaded during login:', patientId);
            } else {
              console.warn('⚠️ User record found but no patient record linked. User may need to complete intake.');
            }
          } else {
            console.warn('⚠️ No patient record found during login. User may need to complete intake.');
          }
        } catch (err) {
          console.error('Error loading patient ID during sign in:', err);
        }

        const meta = (data.user.user_metadata || {}) as Record<string, unknown>;
        const user: User = {
          id: data.user.id,
          email: data.user.email || '',
          firstName: typeof meta['first_name'] === 'string' ? (meta['first_name'] as string) : '',
          lastName: typeof meta['last_name'] === 'string' ? (meta['last_name'] as string) : '',
          patientId: patientId ?? null,
        };

        // If 2FA is enabled, sign out the password session and trigger OTP flow
        if (twoFactorEnabled) {
          await supabase.auth.signOut();
          await supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: false } });
          set({
            user: null,
            isAuthenticated: false,
            isInitialized: true,
            mfaRequired: true,
            mfaEmail: email,
            role: null,
            accessToken: null,
            refreshToken: null,
          });
          if (typeof window !== 'undefined') {
            window.location.href = `/auth/mfa?email=${encodeURIComponent(email)}`;
          }
          return;
        }

        setAuthCookie(data.session?.access_token || generateMockToken(user.id));

        const metaRole = typeof meta['role'] === 'string' ? (meta['role'] as string) : undefined;
        const resolvedRole: 'patient' | 'provider' | 'admin' | null =
          metaRole === 'provider' || metaRole === 'admin' ? metaRole : 'patient';

        set({
          user,
          isAuthenticated: true,
          isInitialized: true,
          mfaRequired: false,
          mfaEmail: null,
          role: resolvedRole,
          accessToken: data.session?.access_token || null,
          refreshToken: data.session?.refresh_token || null,
        });
      },

      // Logout
      logout: () => {
        clearAuthCookie();
        
        // Best effort Supabase signout
        import('@/lib/supabase/client').then(({ supabase }) => {
          supabase.auth.signOut().catch(() => {});
        }).catch(() => {});
        
        set({ 
          user: null, 
          isAuthenticated: false,
          mfaRequired: false,
          mfaEmail: null,
          role: null,
          accessToken: null,
          refreshToken: null,
        });
        
        // Redirect to login
        if (typeof window !== 'undefined') {
          window.location.href = '/auth/login';
        }
      },

      // Update user
      updateUser: (updates: Partial<User>) => {
        set((state) => {
          if (!state.user) return state;
          return { user: { ...state.user, ...updates } };
        });
      },

      completeMfa: (session: Session, user: User) => {
        setAuthCookie(session?.access_token || generateMockToken(user.id));
        set({
          user,
          isAuthenticated: true,
          isInitialized: true,
          mfaRequired: false,
          mfaEmail: null,
          role: user.role || 'patient',
          accessToken: session?.access_token || null,
          refreshToken: session?.refresh_token || null,
        });
      },

      requestMfaCode: async (email: string) => {
        const { supabase } = await import('@/lib/supabase/client');
        await supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: false } });
      },

      // Initialize from storage
      initialize: () => {
        // Zustand persist handles this automatically
        set({ isInitialized: true });
      },
    }),
    {
      name: 'mha-auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        role: state.role,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      }),
    }
  )
);

// Type export for external use
export type { AuthStore as AuthStoreType };
