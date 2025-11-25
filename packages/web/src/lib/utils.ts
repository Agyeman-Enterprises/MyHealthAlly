import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { getAccessToken, getRefreshToken, updateAccessToken, clearAuthStorage, getStoredMetaSync } from './auth-storage';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface FetchOptions extends RequestInit {
  skipAuth?: boolean;
}

let refreshPromise: Promise<boolean> | null = null;

async function refreshAccessToken(): Promise<boolean> {
  const refreshToken = await getRefreshToken();
  if (!refreshToken || typeof window === 'undefined') {
    return false;
  }

  try {
    const response = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      await clearAuthStorage();
      return false;
    }

    const data = await response.json();
    if (!data?.accessToken) {
      return false;
    }

    const currentMeta = getStoredMetaSync();
    await updateAccessToken(data.accessToken, {
      user: data.user || currentMeta?.user,
      device: data.device || currentMeta?.device,
      session: data.session || currentMeta?.session,
    });

    return true;
  } catch (error) {
    console.error('Failed to refresh token', error);
    await clearAuthStorage();
    return false;
  }
}

async function ensureAccessToken(): Promise<string | null> {
  try {
    return await getAccessToken();
  } catch {
    return null;
  }
}

async function attemptRefresh() {
  if (!refreshPromise) {
    refreshPromise = refreshAccessToken()
      .catch(() => false)
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

export async function fetchAPI(endpoint: string, options?: FetchOptions, retry = 0) {
  const { skipAuth, headers: customHeaders, ...rest } = options || {};

  const headers = new Headers(customHeaders as HeadersInit | undefined);
  const isFormData = typeof window !== 'undefined' && rest.body instanceof FormData;

  if (!isFormData && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  if (!skipAuth) {
    const token = await ensureAccessToken();
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
  }

  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...rest,
      headers,
    });

    if (response.status === 401 && !skipAuth && retry === 0) {
      const refreshed = await attemptRefresh();
      if (refreshed) {
        return fetchAPI(endpoint, options, retry + 1);
      }
    }

    if (!response.ok) {
      const errorText = await response.text().catch(() => response.statusText);
      throw new Error(`API error (${response.status}): ${errorText || response.statusText}`);
    }

    if (response.status === 204) {
      return null;
    }

    return response.json();
  } catch (error: any) {
    if (error.message?.includes('fetch') || error.message?.includes('Failed to fetch')) {
      throw new Error('Unable to connect to the server. Please ensure the backend API is running on port 3001.');
    }
    throw error;
  }
}

