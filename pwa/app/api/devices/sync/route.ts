import { NextResponse } from 'next/server';
import { getCurrentUserAndPatient } from '@/lib/supabase/queries-settings';
import { syncDeviceData, syncAllDevices } from '@/lib/services/device-sync';

/**
 * Sync device data
 * POST /api/devices/sync
 * Body: { deviceId?: string } (if deviceId provided, sync that device; otherwise sync all)
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { deviceId } = body;

    const { patientId } = await getCurrentUserAndPatient();
    if (!patientId) {
      return NextResponse.json(
        { error: 'Patient record not found' },
        { status: 400 }
      );
    }

    if (deviceId) {
      // Sync specific device
      const result = await syncDeviceData(deviceId);
      return NextResponse.json(result);
    } else {
      // Sync all devices
      const results = await syncAllDevices(patientId);
      const totalSynced = results.reduce((sum, r) => sum + r.recordsSynced, 0);
      const allSuccess = results.every(r => r.success);
      
      return NextResponse.json({
        success: allSuccess,
        recordsSynced: totalSynced,
        devices: results.length,
      });
    }
  } catch (err) {
    console.error('Error syncing devices:', err);
    return NextResponse.json(
      { error: 'Failed to sync devices' },
      { status: 500 }
    );
  }
}
