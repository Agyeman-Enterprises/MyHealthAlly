import { createClient } from '@supabase/supabase-js';
import { env } from '@/lib/env';

const serviceUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!serviceUrl || !serviceRoleKey) {
  // eslint-disable-next-line no-console
  console.warn('Supabase service client not fully configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.');
}

export const supabaseService = serviceUrl && serviceRoleKey
  ? createClient(serviceUrl, serviceRoleKey, { auth: { autoRefreshToken: false, persistSession: false } })
  : null;
