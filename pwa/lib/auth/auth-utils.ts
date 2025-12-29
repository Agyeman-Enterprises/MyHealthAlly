/**
 * Auth utilities for MyHealth Ally
 * 
 * Handles token storage in cookies (readable by middleware)
 * and user data in localStorage (for client-side state)
 */

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  dateOfBirth?: string;
  preferredLanguage?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

const AUTH_TOKEN_KEY = 'auth-token';
const USER_DATA_KEY = 'mha-user-data';

/**
 * Set auth token as a cookie (readable by middleware)
 */
export function setAuthToken(token: string): void {
  // Set cookie with secure defaults
  // In production, add: Secure; SameSite=Strict
  document.cookie = `${AUTH_TOKEN_KEY}=${token}; path=/; max-age=${60 * 60 * 24 * 7}`; // 7 days
}

/**
 * Get auth token from cookie
 */
export function getAuthToken(): string | null {
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === AUTH_TOKEN_KEY && value) {
      return value;
    }
  }
  return null;
}

/**
 * Clear auth token cookie
 */
export function clearAuthToken(): void {
  document.cookie = `${AUTH_TOKEN_KEY}=; path=/; max-age=0`;
}

/**
 * Save user data to localStorage
 */
export function saveUserData(user: User): void {
  localStorage.setItem(USER_DATA_KEY, JSON.stringify(user));
}

/**
 * Get user data from localStorage
 */
export function getUserData(): User | null {
  try {
    const data = localStorage.getItem(USER_DATA_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

/**
 * Clear user data from localStorage
 */
export function clearUserData(): void {
  localStorage.removeItem(USER_DATA_KEY);
}

/**
 * Complete login - sets both cookie and localStorage
 */
export function performLogin(user: User, token: string): void {
  setAuthToken(token);
  saveUserData(user);
}

/**
 * Complete logout - clears everything
 */
export function performLogout(): void {
  clearAuthToken();
  clearUserData();
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return !!getAuthToken();
}

/**
 * Get current auth state
 */
export function getAuthState(): AuthState {
  const token = getAuthToken();
  const user = getUserData();
  return {
    user: token ? user : null,
    isAuthenticated: !!token,
  };
}

/**
 * Generate a mock token for development
 * In production, this comes from your API
 */
export function generateMockToken(userId: string): string {
  // Simple mock token - in production this is a JWT from your API
  const payload = {
    sub: userId,
    iat: Date.now(),
    exp: Date.now() + (7 * 24 * 60 * 60 * 1000), // 7 days
  };
  return btoa(JSON.stringify(payload));
}
