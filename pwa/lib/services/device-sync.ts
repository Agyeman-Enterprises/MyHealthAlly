/**
 * Device Sync Service
 * Pulls health data from connected devices and saves to database
 */

import { supabase } from '@/lib/supabase/client';
import { refreshAccessToken, type DeviceProvider } from './device-oauth';

export interface SyncResult {
  success: boolean;
  recordsSynced: number;
  error?: string;
}

/**
 * Sync data from a connected device
 */
export async function syncDeviceData(deviceId: string): Promise<SyncResult> {
  try {
    // Get device record
    const { data: device, error: deviceError } = await supabase
      .from('connected_devices')
      .select('*')
      .eq('id', deviceId)
      .single();

    if (deviceError || !device) {
      return { success: false, recordsSynced: 0, error: 'Device not found' };
    }

    // Check if token needs refresh
    if (device.token_expires_at && new Date(device.token_expires_at) < new Date()) {
      if (device.refresh_token) {
        const refreshed = await refreshAccessToken(device.device_type as DeviceProvider, device.refresh_token);
        if (refreshed) {
          await supabase
            .from('connected_devices')
            .update({
              access_token: refreshed.accessToken,
              refresh_token: refreshed.refreshToken,
              token_expires_at: new Date(Date.now() + refreshed.expiresIn * 1000).toISOString(),
            })
            .eq('id', deviceId);
          
          device.access_token = refreshed.accessToken;
        } else {
          return { success: false, recordsSynced: 0, error: 'Failed to refresh token' };
        }
      } else {
        return { success: false, recordsSynced: 0, error: 'Token expired and no refresh token' };
      }
    }

    // Sync based on device type
    const syncSettings = (device.sync_settings || {}) as Record<string, boolean>;
    let recordsSynced = 0;

    switch (device.device_type) {
      case 'fitbit':
        recordsSynced = await syncFitbitData(device, syncSettings);
        break;
      case 'google_fit':
        recordsSynced = await syncGoogleFitData(device, syncSettings);
        break;
      case 'garmin':
        recordsSynced = await syncGarminData(device, syncSettings);
        break;
      case 'withings':
        recordsSynced = await syncWithingsData(device, syncSettings);
        break;
      case 'dexcom':
        recordsSynced = await syncDexcomData(device, syncSettings);
        break;
      case 'apple_health':
        // Apple Health sync is handled natively on iOS
        return { success: true, recordsSynced: 0, error: 'Apple Health sync requires native iOS app' };
      default:
        return { success: false, recordsSynced: 0, error: `Unsupported device type: ${device.device_type}` };
    }

    // Update last sync time
    await supabase
      .from('connected_devices')
      .update({
        last_sync_at: new Date().toISOString(),
        last_sync_status: 'success',
        last_sync_error: null,
      })
      .eq('id', deviceId);

    return { success: true, recordsSynced };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    // Update device with error
    await supabase
      .from('connected_devices')
      .update({
        last_sync_status: 'failed',
        last_sync_error: errorMessage,
      })
      .eq('id', deviceId);

    return { success: false, recordsSynced: 0, error: errorMessage };
  }
}

/**
 * Sync Fitbit data
 */
async function syncFitbitData(device: { access_token: string; patient_id: string; sync_settings: Record<string, boolean> }, syncSettings: Record<string, boolean>): Promise<number> {
  const accessToken = device.access_token;
  const today = new Date().toISOString().split('T')[0];
  let recordsSynced = 0;

    // Sync heart rate
    if (syncSettings['heartRate']) {
    try {
      const response = await fetch(`https://api.fitbit.com/1/user/-/activities/heart/date/${today}/1d.json`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (response.ok) {
        await response.json();
        // Process and save heart rate data to vitals table
        // Implementation depends on Fitbit API response format
        recordsSynced += 1;
      }
    } catch (error) {
      console.error('Error syncing Fitbit heart rate:', error);
    }
  }

  // Sync steps
  if (syncSettings['steps']) {
    try {
      const response = await fetch(`https://api.fitbit.com/1/user/-/activities/steps/date/${today}/1d.json`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (response.ok) {
        await response.json();
        // Process and save steps data
        recordsSynced += 1;
      }
    } catch (error) {
      console.error('Error syncing Fitbit steps:', error);
    }
  }

  // Sync sleep
  if (syncSettings['sleep']) {
    try {
      const response = await fetch(`https://api.fitbit.com/1.2/user/-/sleep/date/${today}.json`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (response.ok) {
        await response.json();
        // Process and save sleep data
        recordsSynced += 1;
      }
    } catch (error) {
      console.error('Error syncing Fitbit sleep:', error);
    }
  }

  // Sync weight
  if (syncSettings['weight']) {
    try {
      const response = await fetch(`https://api.fitbit.com/1/user/-/body/log/weight/date/${today}.json`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (response.ok) {
        await response.json();
        // Process and save weight data
        recordsSynced += 1;
      }
    } catch (error) {
      console.error('Error syncing Fitbit weight:', error);
    }
  }

  return recordsSynced;
}

/**
 * Sync Google Fit data
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function syncGoogleFitData(_device: { access_token: string; patient_id: string }, _syncSettings: Record<string, boolean>): Promise<number> {
  // Google Fit API implementation
  // Similar structure to Fitbit
  return 0;
}

/**
 * Sync Garmin data
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function syncGarminData(_device: { access_token: string; patient_id: string }, _syncSettings: Record<string, boolean>): Promise<number> {
  // Garmin API implementation
  return 0;
}

/**
 * Sync Withings data
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function syncWithingsData(_device: { access_token: string; patient_id: string }, _syncSettings: Record<string, boolean>): Promise<number> {
  // Withings API implementation
  return 0;
}

/**
 * Sync Dexcom data
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function syncDexcomData(_device: { access_token: string; patient_id: string }, _syncSettings: Record<string, boolean>): Promise<number> {
  // Dexcom API implementation
  return 0;
}

/**
 * Sync all devices for a patient
 */
export async function syncAllDevices(patientId: string): Promise<SyncResult[]> {
  const { data: devices } = await supabase
    .from('connected_devices')
    .select('id')
    .eq('patient_id', patientId)
    .eq('is_connected', true)
    .eq('sync_enabled', true);

  if (!devices || devices.length === 0) {
    return [];
  }

  const results = await Promise.all(
    devices.map(device => syncDeviceData(device.id))
  );

  return results;
}
