/**
 * API Base URL Autoconfig Utility
 * 
 * Automatically determines the correct API base URL based on environment:
 * - Browser: Uses current origin (window.location.origin)
 * - Server-side: Uses request headers, Vercel URL, or env var
 * - Development: Falls back to localhost only in dev mode
 * 
 * No hardcoded URLs - fully autoconfigured!
 */

import { env } from '@/lib/env';

/**
 * Get API base URL for browser context
 * Uses current origin to avoid CORS issues
 */
export function getApiBaseUrlBrowser(): string {
  if (typeof window === 'undefined') {
    throw new Error('getApiBaseUrlBrowser() can only be called in browser context');
  }
  return window.location.origin;
}

/**
 * Get API base URL for server-side context
 * Supports autoconfig via:
 * 1. Request headers (if available)
 * 2. Vercel URL (VERCEL_URL env var)
 * 3. Environment variable (NEXT_PUBLIC_API_BASE_URL)
 * 4. Development fallback (localhost:3000) - only in dev mode
 */
export function getApiBaseUrlServer(request?: Request | { headers: Headers }): string {
  // 1. Try to get from request headers (most accurate)
  if (request) {
    const headers = request instanceof Request ? request.headers : request.headers;
    const host = headers.get('host');
    const protocol = headers.get('x-forwarded-proto') || 
                    (headers.get('x-forwarded-ssl') === 'on' ? 'https' : 'http');
    
    if (host) {
      // Construct URL from request
      return `${protocol}://${host}`;
    }
  }

  // 2. Try Vercel URL (automatic in Vercel deployments)
  const vercelUrl = process.env['VERCEL_URL'];
  if (vercelUrl) {
    return `https://${vercelUrl}`;
  }

  // 3. Try environment variable
  if (env.NEXT_PUBLIC_API_BASE_URL) {
    return env.NEXT_PUBLIC_API_BASE_URL;
  }

  // 4. No hardcoded fallbacks - autoconfig only!
  // If we get here, we couldn't autoconfig from any source
  throw new Error(
    'API base URL autoconfig failed. Please ensure:\n' +
    '1. You are running in a supported environment (Vercel, or with request headers), OR\n' +
    '2. Set NEXT_PUBLIC_API_BASE_URL environment variable, OR\n' +
    '3. Pass request object to getApiBaseUrl() for server-side calls'
  );
}

/**
 * Get API base URL - automatically detects context
 * 
 * Browser: Uses window.location.origin
 * Server: Uses autoconfig (request headers, Vercel URL, env var, or dev fallback)
 */
export function getApiBaseUrl(request?: Request | { headers: Headers }): string {
  // Browser context
  if (typeof window !== 'undefined') {
    return getApiBaseUrlBrowser();
  }

  // Server context
  return getApiBaseUrlServer(request);
}

/**
 * Get API base URL for Next.js API routes
 * Extracts origin from request headers automatically
 */
export function getApiBaseUrlFromRequest(request: Request): string {
  return getApiBaseUrlServer(request);
}
