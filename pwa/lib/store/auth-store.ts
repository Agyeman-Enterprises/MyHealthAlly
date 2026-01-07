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
  login: (user: User, token?: string, rememberMe?: boolean) => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  initialize: () => Promise<void>;
  completeMfa: (session: Session, user: User, rememberMe?: boolean) => void;
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
  signInWithSupabase: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
}

const AUTH_TOKEN_KEY = 'auth-token';

/**
 * Set auth token as a cookie (readable by middleware)
 * Extended duration for remember me functionality
 */
function setAuthCookie(token: string, rememberMe: boolean = false): void {
  if (typeof document !== 'undefined') {
    const maxAge = rememberMe ? 60 * 60 * 24 * 30 : 60 * 60 * 24 * 7; // 30 days or 7 days
    // Use Secure flag in production (HTTPS), SameSite for CSRF protection
    const secureFlag = typeof window !== 'undefined' && window.location.protocol === 'https:' ? '; Secure' : '';
    document.cookie = `${AUTH_TOKEN_KEY}=${token}; path=/; max-age=${maxAge}; SameSite=Lax${secureFlag}`;
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
      login: (user: User, token?: string, rememberMe: boolean = false) => {
        const authToken = token || generateMockToken(user.id);
        setAuthCookie(authToken, rememberMe);
        
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

      // Supabase sign in with retry logic for network errors
      signInWithSupabase: async (email: string, password: string, rememberMe: boolean = false) => {
        // Dynamic import to avoid SSR issues
        const { supabase } = await import('@/lib/supabase/client');
        const { retryWithBackoff } = await import('@/lib/utils/network-retry');
        
        try {
          // Retry on network failures
          const result = await retryWithBackoff(
            async () => {
              const authResult = await supabase.auth.signInWithPassword({
                email,
                password,
              });
              
              // Throw if there's an error (so retry logic can catch it)
              if (authResult.error) {
                // Don't retry on authentication errors (invalid credentials, etc.)
                if (
                  authResult.error.message.includes('Invalid login credentials') ||
                  authResult.error.message.includes('Email not confirmed') ||
                  authResult.error.message.includes('User not found')
                ) {
                  throw authResult.error; // Throw immediately, don't retry
                }
                // Network errors will be retried
                throw authResult.error;
              }
              
              return authResult;
            },
            {
              maxRetries: 3,
              initialDelay: 1000,
              retryableErrors: ['fetch', 'network', 'ECONNRESET', 'ETIMEDOUT'],
            }
          );

          // Check for errors after retry
          if (result.error) {
            const error = result.error as { message: string };
            // Improve error messages
            if (error.message.includes('Invalid login credentials')) {
              throw new Error('Invalid email or password. Please check your credentials and try again.');
            } else if (error.message.includes('Email not confirmed')) {
              throw new Error('Please verify your email address before signing in. Check your inbox for a verification link.');
            } else if (error.message.includes('Too many requests')) {
              throw new Error('Too many login attempts. Please wait a few minutes and try again.');
            } else if (error.message.includes('fetch') || error.message.includes('network')) {
              throw new Error('Network error: Unable to connect to the server. Please check your internet connection and try again.');
            }
            throw error;
          }
          
          const { data } = result;
          if (!data?.user) throw new Error('No user returned from authentication');

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

          // Set auth cookie with extended duration if remember me
          const cookieMaxAge = rememberMe ? 60 * 60 * 24 * 30 : 60 * 60 * 24 * 7; // 30 days or 7 days
          const authToken = data.session?.access_token || generateMockToken(user.id);
          if (typeof document !== 'undefined') {
            document.cookie = `${AUTH_TOKEN_KEY}=${authToken}; path=/; max-age=${cookieMaxAge}; SameSite=Lax; Secure`;
          }

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
        } catch (err) {
          // Re-throw with better error handling
          if (err instanceof Error) {
            throw err;
          }
          throw new Error('Authentication failed. Please try again.');
        }
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

      completeMfa: (session: Session, user: User, rememberMe: boolean = false) => {
        setAuthCookie(session?.access_token || generateMockToken(user.id), rememberMe);
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

      // Initialize from storage and restore Supabase session
      initialize: async () => {
        // Zustand persist handles state restoration automatically
        set({ isInitialized: false }); // Set to false first to prevent premature redirects
        
        try {
          // Try to restore Supabase session
          const { supabase } = await import('@/lib/supabase/client');
          const { data: { session }, error } = await supabase.auth.getSession();
          
          if (!error && session) {
            // Session exists, restore user state
            const { data: { user: authUser } } = await supabase.auth.getUser();
            
            if (authUser) {
              // Load user record
              const { data: userRecord } = await supabase
                .from('users')
                .select('id, patients(id), role')
                .eq('supabase_auth_id', authUser.id)
                .single();
              
              if (userRecord) {
                const patientsArray = userRecord.patients 
                  ? (Array.isArray(userRecord.patients) ? userRecord.patients : [userRecord.patients])
                  : [];
                const patientId = patientsArray[0]?.id || null;
                
                const meta = (authUser.user_metadata || {}) as Record<string, unknown>;
                const user: User = {
                  id: authUser.id,
                  email: authUser.email || '',
                  firstName: typeof meta['first_name'] === 'string' ? (meta['first_name'] as string) : '',
                  lastName: typeof meta['last_name'] === 'string' ? (meta['last_name'] as string) : '',
                  patientId: patientId,
                  role: userRecord.role || 'patient',
                };
                
                const metaRole = typeof meta['role'] === 'string' ? (meta['role'] as string) : undefined;
                const resolvedRole: 'patient' | 'provider' | 'admin' | null =
                  metaRole === 'provider' || metaRole === 'admin' ? metaRole : (userRecord.role || 'patient');
                
                setAuthCookie(session.access_token || generateMockToken(user.id));
                
                set({
                  user,
                  isAuthenticated: true,
                  isInitialized: true,
                  role: resolvedRole,
                  accessToken: session.access_token || null,
                  refreshToken: session.refresh_token || null,
                });
                return;
              }
            }
          }
        } catch (err) {
          console.error('Error restoring session:', err);
          // Continue with initialization even if session restore fails
        }
        
        // Mark as initialized (even if no session found)
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
