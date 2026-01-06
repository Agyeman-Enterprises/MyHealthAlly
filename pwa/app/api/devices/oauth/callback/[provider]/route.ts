import { NextResponse } from 'next/server';
import { exchangeCodeForToken, type DeviceProvider } from '@/lib/services/device-oauth';
import { supabase } from '@/lib/supabase/client';

/**
 * OAuth callback handler
 * GET /api/devices/oauth/callback/[provider]?code=...&state=...
 */
export async function GET(
  req: Request,
  { params }: { params: { provider: string } }
) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    if (error) {
      return NextResponse.redirect(
        new URL(`/settings/devices?error=${encodeURIComponent(error)}`, req.url)
      );
    }

    if (!code || !state) {
      return NextResponse.redirect(
        new URL('/settings/devices?error=missing_code_or_state', req.url)
      );
    }

    const provider = params.provider as DeviceProvider;

    // Verify state token
    const { data: stateRecord, error: stateError } = await supabase
      .from('oauth_states')
      .select('patient_id')
      .eq('state', state)
      .eq('provider', provider)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (stateError || !stateRecord) {
      return NextResponse.redirect(
        new URL('/settings/devices?error=invalid_state', req.url)
      );
    }

    // Exchange code for tokens
    const tokens = await exchangeCodeForToken(provider, code);
    if (!tokens) {
      return NextResponse.redirect(
        new URL('/settings/devices?error=token_exchange_failed', req.url)
      );
    }

    // Get device metadata from provider API
    const deviceMetadata = await getDeviceMetadata(provider, tokens.accessToken);

    // Save device connection
    const { error: deviceError } = await supabase
      .from('connected_devices')
      .insert({
        patient_id: stateRecord.patient_id,
        device_type: provider,
        device_name: deviceMetadata.name || `${provider} Device`,
        device_model: deviceMetadata.model,
        is_connected: true,
        access_token: tokens.accessToken,
        refresh_token: tokens.refreshToken,
        token_expires_at: new Date(Date.now() + tokens.expiresIn * 1000).toISOString(),
        sync_enabled: true,
        device_metadata: deviceMetadata,
      });

    if (deviceError) {
      console.error('Error saving device:', deviceError);
      return NextResponse.redirect(
        new URL('/settings/devices?error=save_failed', req.url)
      );
    }

    // Delete used state token
    await supabase
      .from('oauth_states')
      .delete()
      .eq('state', state);

    // Trigger initial sync
    // This could be done in background or on next page load

    return NextResponse.redirect(
      new URL('/settings/devices?success=connected', req.url)
    );
  } catch (err) {
    console.error('Error in OAuth callback:', err);
    return NextResponse.redirect(
      new URL('/settings/devices?error=callback_failed', req.url)
    );
  }
}

/**
 * Get device metadata from provider API
 */
async function getDeviceMetadata(provider: DeviceProvider, accessToken: string): Promise<{ name?: string; model?: string; [key: string]: unknown }> {
  try {
    switch (provider) {
      case 'fitbit': {
        const response = await fetch('https://api.fitbit.com/1/user/-/profile.json', {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (response.ok) {
          const data = await response.json();
          return { name: `Fitbit ${data.user?.fullName || 'Device'}` };
        }
        break;
      }
      case 'google_fit': {
        // Google Fit doesn't have a simple profile endpoint
        return { name: 'Google Fit' };
      }
      case 'garmin': {
        return { name: 'Garmin Connect' };
      }
      case 'withings': {
        return { name: 'Withings' };
      }
      case 'dexcom': {
        return { name: 'Dexcom CGM' };
      }
    }
  } catch (error) {
    console.error(`Error fetching device metadata for ${provider}:`, error);
  }
  return {};
}
