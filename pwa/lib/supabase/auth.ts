/**
 * Supabase Authentication Utilities
 * Handles user authentication, session management, and role-based access
 */

import { supabase } from './client';
import type { User, UserRole } from './types';

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  status: string;
}

/**
 * Sign up a new user
 */
export async function signUp(email: string, password: string, role: UserRole = 'patient') {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        role,
      },
    },
  });

  if (error) throw error;
  return data;
}

/**
 * Sign in with email and password
 */
export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
}

/**
 * Sign out current user
 */
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

/**
 * Get current authenticated user
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  const { data: { user: authUser }, error } = await supabase.auth.getUser();
  
  if (error || !authUser) return null;

  // Get user record from our users table
  const { data: userRecord, error: userError } = await supabase
    .from('users')
    .select('id, email, role, status')
    .eq('supabase_auth_id', authUser.id)
    .single();

  if (userError || !userRecord) return null;

  return {
    id: userRecord.id,
    email: userRecord.email,
    role: userRecord.role,
    status: userRecord.status,
  };
}

/**
 * Get current session
 */
export async function getSession() {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) throw error;
  return session;
}

/**
 * Listen to auth state changes
 */
export function onAuthStateChange(callback: (event: string, session: any) => void) {
  return supabase.auth.onAuthStateChange(callback);
}

/**
 * Update user password
 */
export async function updatePassword(newPassword: string) {
  const { data, error } = await supabase.auth.updateUser({
    password: newPassword,
  });
  if (error) throw error;
  return data;
}

/**
 * Send password reset email
 */
export async function resetPassword(email: string) {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/reset-password`,
  });
  if (error) throw error;
  return data;
}

