import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * User interface - extended for all use cases
 */
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  dateOfBirth?: string;
  preferredLanguage?: string;
  patientId?: string;      // For patient users
  practiceId?: string;     // For provider users
}

/**
 * AuthStore interface - supports patient & provider auth
 */
export interface AuthStore {
  // State
  user: User | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
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

        const user: User = {
          id: data.user.id,
          email: data.user.email || '',
          firstName: data.user.user_metadata?.first_name || '',
          lastName: data.user.user_metadata?.last_name || '',
        };

        setAuthCookie(data.session?.access_token || generateMockToken(user.id));

        set({
          user,
          isAuthenticated: true,
          isInitialized: true,
          role: data.user.user_metadata?.role || 'patient',
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
