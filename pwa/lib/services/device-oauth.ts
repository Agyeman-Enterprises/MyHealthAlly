/**
 * Device OAuth Service
 * Handles OAuth flows for health device integrations
 */

import { env } from '@/lib/env';

export type DeviceProvider = 'fitbit' | 'google_fit' | 'garmin' | 'withings' | 'apple_health' | 'dexcom';

export interface OAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scope: string;
  authUrl: string;
  tokenUrl: string;
}

/**
 * Get OAuth configuration for a device provider
 */
export function getOAuthConfig(provider: DeviceProvider): OAuthConfig | null {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const redirectUri = `${baseUrl}/api/devices/oauth/callback/${provider}`;

  switch (provider) {
    case 'fitbit':
      return {
        clientId: env.FITBIT_CLIENT_ID || '',
        clientSecret: env.FITBIT_CLIENT_SECRET || '',
        redirectUri,
        scope: 'activity heartrate sleep weight',
        authUrl: 'https://www.fitbit.com/oauth2/authorize',
        tokenUrl: 'https://api.fitbit.com/oauth2/token',
      };
    
    case 'google_fit':
      return {
        clientId: env.GOOGLE_FIT_CLIENT_ID || '',
        clientSecret: env.GOOGLE_FIT_CLIENT_SECRET || '',
        redirectUri,
        scope: 'https://www.googleapis.com/auth/fitness.activity.read https://www.googleapis.com/auth/fitness.heart_rate.read https://www.googleapis.com/auth/fitness.sleep.read https://www.googleapis.com/auth/fitness.weight.read',
        authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
        tokenUrl: 'https://oauth2.googleapis.com/token',
      };
    
    case 'garmin':
      return {
        clientId: env.GARMIN_CLIENT_ID || '',
        clientSecret: env.GARMIN_CLIENT_SECRET || '',
        redirectUri,
        scope: 'activity health',
        authUrl: 'https://connect.garmin.com/oauthConfirm',
        tokenUrl: 'https://connectapi.garmin.com/oauth-service/oauth/exchange/user/2.0',
      };
    
    case 'withings':
      return {
        clientId: env.WITHINGS_CLIENT_ID || '',
        clientSecret: env.WITHINGS_CLIENT_SECRET || '',
        redirectUri,
        scope: 'user.metrics user.activity user.sleepevents',
        authUrl: 'https://account.withings.com/oauth2_user/authorize2',
        tokenUrl: 'https://wbsapi.withings.net/v2/oauth2',
      };
    
    case 'dexcom':
      return {
        clientId: env.DEXCOM_CLIENT_ID || '',
        clientSecret: env.DEXCOM_CLIENT_SECRET || '',
        redirectUri,
        scope: 'offline_access',
        authUrl: 'https://sandbox-api.dexcom.com/v2/oauth2/login',
        tokenUrl: 'https://sandbox-api.dexcom.com/v2/oauth2/token',
      };
    
    case 'apple_health':
      // Apple Health uses HealthKit (native iOS) - handled differently
      return null;
    
    default:
      return null;
  }
}

/**
 * Generate OAuth authorization URL
 */
export function getOAuthUrl(provider: DeviceProvider, state: string): string | null {
  const config = getOAuthConfig(provider);
  if (!config) return null;

  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    response_type: 'code',
    scope: config.scope,
    state,
  });

  return `${config.authUrl}?${params.toString()}`;
}

/**
 * Exchange authorization code for access token
 */
export async function exchangeCodeForToken(
  provider: DeviceProvider,
  code: string
): Promise<{ accessToken: string; refreshToken: string; expiresIn: number } | null> {
  const config = getOAuthConfig(provider);
  if (!config) return null;

  try {
    const body = new URLSearchParams({
      client_id: config.clientId,
      client_secret: config.clientSecret,
      code,
      grant_type: 'authorization_code',
      redirect_uri: config.redirectUri,
    });

    const response = await fetch(config.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error(`OAuth token exchange failed for ${provider}:`, error);
      return null;
    }

    const data = await response.json();
    
    // Different providers return tokens in different formats
    if (provider === 'fitbit' || provider === 'google_fit') {
      return {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresIn: data.expires_in || 3600,
      };
    } else if (provider === 'garmin') {
      return {
        accessToken: data.access_token,
        refreshToken: data.refresh_token || '',
        expiresIn: data.expires_in || 3600,
      };
    } else if (provider === 'withings') {
      return {
        accessToken: data.body.access_token,
        refreshToken: data.body.refresh_token,
        expiresIn: data.body.expires_in || 3600,
      };
    } else if (provider === 'dexcom') {
      return {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresIn: data.expires_in || 3600,
      };
    }

    return null;
  } catch (error) {
    console.error(`Error exchanging code for token (${provider}):`, error);
    return null;
  }
}

/**
 * Refresh access token using refresh token
 */
export async function refreshAccessToken(
  provider: DeviceProvider,
  refreshToken: string
): Promise<{ accessToken: string; refreshToken: string; expiresIn: number } | null> {
  const config = getOAuthConfig(provider);
  if (!config) return null;

  try {
    const body = new URLSearchParams({
      client_id: config.clientId,
      client_secret: config.clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    });

    const response = await fetch(config.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    });

    if (!response.ok) {
      console.error(`Token refresh failed for ${provider}:`, await response.text());
      return null;
    }

    const data = await response.json();
    
    if (provider === 'fitbit' || provider === 'google_fit') {
      return {
        accessToken: data.access_token,
        refreshToken: data.refresh_token || refreshToken,
        expiresIn: data.expires_in || 3600,
      };
    } else if (provider === 'garmin') {
      return {
        accessToken: data.access_token,
        refreshToken: data.refresh_token || refreshToken,
        expiresIn: data.expires_in || 3600,
      };
    } else if (provider === 'withings') {
      return {
        accessToken: data.body.access_token,
        refreshToken: data.body.refresh_token || refreshToken,
        expiresIn: data.body.expires_in || 3600,
      };
    } else if (provider === 'dexcom') {
      return {
        accessToken: data.access_token,
        refreshToken: data.refresh_token || refreshToken,
        expiresIn: data.expires_in || 3600,
      };
    }

    return null;
  } catch (error) {
    console.error(`Error refreshing token (${provider}):`, error);
    return null;
  }
}
