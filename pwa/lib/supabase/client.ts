/**
 * Supabase Client for MHA
 * 
 * This is MHA's own backend using Supabase.
 * Data syncs to/from SoloPractice (which is SSOT).
 */

import { createClient } from '@supabase/supabase-js';
import { env } from '@/lib/env';

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️  Supabase credentials not configured.');
  console.warn('   Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local');
  console.warn('   Get them from: Supabase Dashboard → Settings → API');
}

// Use placeholder values if not configured (to prevent errors)
const safeUrl = supabaseUrl || 'https://placeholder.supabase.co';
const safeKey = supabaseAnonKey || 'placeholder-key';

export const supabase = createClient(safeUrl, safeKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    storageKey: 'mha-supabase-auth-token',
    // Extended session duration for remember me
    flowType: 'pkce',
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
  global: {
    headers: {
      'x-client-info': 'myhealthally-web',
    },
  },
});

/**
 * Get Supabase client with user's session
 * Use this for authenticated queries
 */
export function getSupabaseClient() {
  return supabase;
}

