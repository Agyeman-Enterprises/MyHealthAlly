import { NextResponse } from 'next/server';
import { getOAuthUrl, type DeviceProvider } from '@/lib/services/device-oauth';
import { getCurrentUserAndPatient } from '@/lib/supabase/queries-settings';
import { supabase } from '@/lib/supabase/client';
import { randomBytes } from 'crypto';

/**
 * Initiate OAuth flow for device connection
 * POST /api/devices/oauth/initiate
 * Body: { provider: 'fitbit' | 'google_fit' | ... }
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { provider } = body;

    if (!provider || !['fitbit', 'google_fit', 'garmin', 'withings', 'dexcom'].includes(provider)) {
      return NextResponse.json(
        { error: 'Invalid provider' },
        { status: 400 }
      );
    }

    // Get current user and patient
    const { patientId } = await getCurrentUserAndPatient();
    if (!patientId) {
      return NextResponse.json(
        { error: 'Patient record not found. Please complete your profile first.' },
        { status: 400 }
      );
    }

    // Generate state token for OAuth security
    const state = randomBytes(32).toString('hex');
    
    // Store state in database (expires in 10 minutes)
    const { error: stateError } = await supabase
      .from('oauth_states')
      .insert({
        state,
        provider: provider as DeviceProvider,
        patient_id: patientId,
        expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
      });

    if (stateError) {
      console.error('Error storing OAuth state:', stateError);
      return NextResponse.json(
        { error: 'Failed to initiate OAuth flow' },
        { status: 500 }
      );
    }

    // Get OAuth URL
    const oauthUrl = getOAuthUrl(provider as DeviceProvider, state);
    if (!oauthUrl) {
      return NextResponse.json(
        { error: 'OAuth configuration not found for this provider' },
        { status: 500 }
      );
    }

    return NextResponse.json({ oauthUrl, state });
  } catch (err) {
    console.error('Error initiating OAuth:', err);
    return NextResponse.json(
      { error: 'Failed to initiate OAuth flow' },
      { status: 500 }
    );
  }
}
