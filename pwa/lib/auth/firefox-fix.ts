/**
 * Firefox Auth Fix
 * Resolves cookie/token issues, session restore, and password manager compatibility
 */

import { supabase } from '@/lib/supabase/client';

// ============================================
// COOKIE/TOKEN STRATEGY
// ============================================

/**
 * Firefox-safe token storage
 * Uses localStorage with fallback to sessionStorage
 * Avoids cross-site cookie issues
 */
export class FirefoxAuthStorage {
  private static readonly TOKEN_KEY = 'mha_access_token';
  private static readonly REFRESH_KEY = 'mha_refresh_token';
  private static readonly SESSION_KEY = 'mha_session';

  static setTokens(accessToken: string, refreshToken: string): void {
    try {
      // Try localStorage first (persistent)
      if (this.isLocalStorageAvailable()) {
        localStorage.setItem(this.TOKEN_KEY, accessToken);
        localStorage.setItem(this.REFRESH_KEY, refreshToken);
        return;
      }
      
      // Fallback to sessionStorage (session-only)
      if (this.isSessionStorageAvailable()) {
        sessionStorage.setItem(this.TOKEN_KEY, accessToken);
        sessionStorage.setItem(this.REFRESH_KEY, refreshToken);
      }
    } catch (error) {
      console.error('Failed to store tokens:', error);
      // Last resort: in-memory (will be lost on refresh)
      (window as any).__mha_tokens = { accessToken, refreshToken };
    }
  }

  static getTokens(): { accessToken: string | null; refreshToken: string | null } {
    try {
      // Try localStorage
      if (this.isLocalStorageAvailable()) {
        const accessToken = localStorage.getItem(this.TOKEN_KEY);
        const refreshToken = localStorage.getItem(this.REFRESH_KEY);
        if (accessToken && refreshToken) {
          return { accessToken, refreshToken };
        }
      }
      
      // Try sessionStorage
      if (this.isSessionStorageAvailable()) {
        const accessToken = sessionStorage.getItem(this.TOKEN_KEY);
        const refreshToken = sessionStorage.getItem(this.REFRESH_KEY);
        if (accessToken && refreshToken) {
          return { accessToken, refreshToken };
        }
      }
      
      // Try in-memory fallback
      const inMemory = (window as any).__mha_tokens;
      if (inMemory) {
        return { accessToken: inMemory.accessToken, refreshToken: inMemory.refreshToken };
      }
    } catch (error) {
      console.error('Failed to retrieve tokens:', error);
    }
    
    return { accessToken: null, refreshToken: null };
  }

  static clearTokens(): void {
    try {
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.REFRESH_KEY);
      sessionStorage.removeItem(this.TOKEN_KEY);
      sessionStorage.removeItem(this.REFRESH_KEY);
      delete (window as any).__mha_tokens;
    } catch (error) {
      console.error('Failed to clear tokens:', error);
    }
  }

  private static isLocalStorageAvailable(): boolean {
    try {
      const test = '__localStorage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }

  private static isSessionStorageAvailable(): boolean {
    try {
      const test = '__sessionStorage_test__';
      sessionStorage.setItem(test, test);
      sessionStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }
}

// ============================================
// SESSION RESTORE
// ============================================

/**
 * Restore session on page load
 * Handles Firefox-specific issues
 */
export async function restoreSession(): Promise<boolean> {
  try {
    // Get stored tokens
    const { accessToken, refreshToken } = FirefoxAuthStorage.getTokens();
    
    if (!accessToken || !refreshToken) {
      return false;
    }

    // Verify session with Supabase
    const { data: { session }, error } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    if (error || !session) {
      // Try refresh
      const { data: refreshed, error: refreshError } = await supabase.auth.refreshSession();
      
      if (refreshError || !refreshed.session) {
        FirefoxAuthStorage.clearTokens();
        return false;
      }

      // Update stored tokens
      FirefoxAuthStorage.setTokens(
        refreshed.session.access_token,
        refreshed.session.refresh_token
      );
      return true;
    }

    // Update stored tokens (in case they changed)
    FirefoxAuthStorage.setTokens(session.access_token, session.refresh_token);
    return true;
  } catch (error) {
    console.error('Session restore failed:', error);
    FirefoxAuthStorage.clearTokens();
    return false;
  }
}

// ============================================
// REFRESH TOKEN ROTATION
// ============================================

/**
 * Rotate refresh token on use
 * Prevents token reuse attacks
 */
export async function rotateRefreshToken(): Promise<boolean> {
  try {
    const { data: { session }, error } = await supabase.auth.refreshSession();
    
    if (error || !session) {
      return false;
    }

    // Update stored tokens with new ones
    FirefoxAuthStorage.setTokens(
      session.access_token,
      session.refresh_token
    );

    return true;
  } catch (error) {
    console.error('Token rotation failed:', error);
    return false;
  }
}

// ============================================
// PASSWORD MANAGER COMPATIBILITY
// ============================================

/**
 * Ensure form fields are compatible with password managers
 * Firefox requires specific attributes
 */
export function setupPasswordManagerCompatibility(formId: string): void {
  const form = document.getElementById(formId) as HTMLFormElement;
  if (!form) return;

  // Email field
  const emailInput = form.querySelector('input[type="email"]') as HTMLInputElement;
  if (emailInput) {
    emailInput.setAttribute('autocomplete', 'username');
    emailInput.setAttribute('name', 'email');
    emailInput.setAttribute('id', 'email');
  }

  // Password field
  const passwordInput = form.querySelector('input[type="password"]') as HTMLInputElement;
  if (passwordInput) {
    passwordInput.setAttribute('autocomplete', 'current-password');
    passwordInput.setAttribute('name', 'password');
    passwordInput.setAttribute('id', 'password');
  }

  // Form attributes
  form.setAttribute('method', 'post');
  form.setAttribute('action', '/auth/login'); // Dummy action for password managers
}

// ============================================
// AUTH TELEMETRY
// ============================================

export interface AuthFailureEvent {
  type: 'login_failed' | 'session_expired' | 'token_refresh_failed' | 'cookie_blocked';
  browser: string;
  error: string;
  timestamp: string;
}

export function logAuthFailure(event: AuthFailureEvent): void {
  // Log to console in dev
  if (process.env.NODE_ENV === 'development') {
    console.error('Auth Failure:', event);
  }

  // In production, send to telemetry endpoint
  if (process.env.NODE_ENV === 'production') {
    fetch('/api/telemetry/auth-failure', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event),
    }).catch(() => {
      // Silently fail - don't block user
    });
  }
}

