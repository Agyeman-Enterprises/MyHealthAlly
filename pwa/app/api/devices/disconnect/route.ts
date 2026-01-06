import { NextResponse } from 'next/server';
import { getCurrentUserAndPatient } from '@/lib/supabase/queries-settings';
import { supabase } from '@/lib/supabase/client';

/**
 * Disconnect a device
 * POST /api/devices/disconnect
 * Body: { deviceId: string }
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { deviceId } = body;

    if (!deviceId) {
      return NextResponse.json(
        { error: 'Device ID is required' },
        { status: 400 }
      );
    }

    // Verify device belongs to current user
    const { patientId } = await getCurrentUserAndPatient();
    if (!patientId) {
      return NextResponse.json(
        { error: 'Patient record not found' },
        { status: 400 }
      );
    }

    const { data: device, error: deviceError } = await supabase
      .from('connected_devices')
      .select('patient_id')
      .eq('id', deviceId)
      .single();

    if (deviceError || !device) {
      return NextResponse.json(
        { error: 'Device not found' },
        { status: 404 }
      );
    }

    if (device.patient_id !== patientId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Disconnect device (soft delete - mark as disconnected)
    const { error: updateError } = await supabase
      .from('connected_devices')
      .update({
        is_connected: false,
        disconnected_at: new Date().toISOString(),
        access_token: null,
        refresh_token: null,
        token_expires_at: null,
      })
      .eq('id', deviceId);

    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to disconnect device' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Error disconnecting device:', err);
    return NextResponse.json(
      { error: 'Failed to disconnect device' },
      { status: 500 }
    );
  }
}
