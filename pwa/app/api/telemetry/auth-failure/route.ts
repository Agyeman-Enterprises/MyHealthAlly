import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';

/**
 * Auth Failure Telemetry Endpoint
 * Logs auth failures for debugging (non-blocking)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, browser, error, timestamp } = body;

    // Store in audit_events table (non-blocking)
    try {
      await supabase.rpc('create_audit_event', {
        p_event_type: 'auth_failure',
        p_entity_type: 'auth',
        p_entity_id: null,
        p_event_data: {
          failure_type: type,
          browser,
          error,
          timestamp,
        },
        p_user_id: null,
        p_clinician_id: null,
        p_patient_id: null,
      });
    } catch (e) {
      // Silently fail - don't block user
      console.error('Failed to log auth failure:', e);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    // Always return success - don't block user
    return NextResponse.json({ received: true });
  }
}

