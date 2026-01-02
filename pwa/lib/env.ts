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
  STRIPE_PRICE_ID_ESSENTIAL: z.string().min(1).optional(),
  STRIPE_PRICE_ID_COMPLETE: z.string().min(1).optional(),
  STRIPE_PRICE_ID_FAMILY: z.string().min(1).optional(),
  STRIPE_PRICE_ID_PREMIUM: z.string().min(1).optional(),

  // App URLs
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),

  // OpenAI (for transcription)
  OPENAI_API_KEY: z.string().min(1).optional(),

  // Inbound webhooks (SoloPractice -> MHA)
  INBOUND_WEBHOOK_SECRET: z.string().min(1).optional(),

  // Translation provider (server-side only)
  TRANSLATE_API_URL: z.string().url().optional(),
  TRANSLATE_API_KEY: z.string().min(1).optional(),

  // Dev/test: allow bypassing login flow
  NEXT_PUBLIC_BYPASS_LOGIN: z.enum(['true', 'false']).optional(),

  // Google Maps API (for pharmacy autocomplete and geolocation)
  NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: z.string().min(1).optional(),
});

// Note: This file IS the validated env - we parse process.env here
// This is the ONLY place process.env should be accessed
// eslint-disable-next-line no-restricted-properties
export const env = EnvSchema.parse(process.env);
