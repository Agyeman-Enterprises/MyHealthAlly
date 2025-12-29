/**
 * Environment Variable Validation
 * Uses Zod to validate all environment variables.
 * NEVER use process.env directly - always import from here.
 */

import { z } from 'zod';

const EnvSchema = z.object({
  // Node Environment
  NODE_ENV: z.enum(['development', 'test', 'production']).optional(),

  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1).optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),

  // API
  NEXT_PUBLIC_API_BASE_URL: z.string().url().optional(),

  // Stripe
  STRIPE_SECRET_KEY: z.string().min(1).optional(),
  STRIPE_WEBHOOK_SECRET: z.string().min(1).optional(),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().min(1).optional(),

  // OpenAI (for transcription)
  OPENAI_API_KEY: z.string().min(1).optional(),
});

// Note: This file IS the validated env - we parse process.env here
// This is the ONLY place process.env should be accessed
// eslint-disable-next-line no-restricted-properties
export const env = EnvSchema.parse(process.env);
