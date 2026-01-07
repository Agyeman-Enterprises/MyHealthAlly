/**
 * API Route: Follow-up Reminders
 * 
 * Get and manage follow-up reminders for hospital visits
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { env } from '@/lib/env';

// Use service role key for server-side operations
const supabase = env.NEXT_PUBLIC_SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY
  ? createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)
  : null;

/**
 * GET: Get follow-up reminders for a patient
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const patientId = searchParams.get('patientId');

    if (!patientId) {
      return NextResponse.json(
        { error: 'patientId is required' },
        { status: 400 }
      );
    }

    if (!supabase) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 500 }
      );
    }

    // Get upcoming reminders (not yet sent)
    const { data: upcoming, error: upcomingError } = await supabase
      .from('follow_up_reminders')
      .select(`
        *,
        hospital_admissions (
          id,
          hospital_name,
          admission_date,
          discharge_date
        )
      `)
      .eq('patient_id', patientId)
      .eq('sent', false)
      .gte('reminder_date', new Date().toISOString().split('T')[0])
      .order('reminder_date', { ascending: true });

    if (upcomingError) throw upcomingError;

    // Get past reminders (sent)
    const { data: past, error: pastError } = await supabase
      .from('follow_up_reminders')
      .select(`
        *,
        hospital_admissions (
          id,
          hospital_name,
          admission_date,
          discharge_date
        )
      `)
      .eq('patient_id', patientId)
      .eq('sent', true)
      .order('reminder_date', { ascending: false })
      .limit(10);

    if (pastError) throw pastError;

    return NextResponse.json({
      upcoming: upcoming || [],
      past: past || [],
    });
  } catch (error) {
    console.error('Error fetching follow-up reminders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reminders' },
      { status: 500 }
    );
  }
}

/**
 * POST: Create a follow-up reminder
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { hospitalAdmissionId, patientId, reminderType, reminderDate, reminderMessage, followUpDays } = body;

    if (!hospitalAdmissionId || !patientId || !reminderDate) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (!supabase) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 500 }
      );
    }

    const { data, error } = await supabase
      .from('follow_up_reminders')
      .insert({
        hospital_admission_id: hospitalAdmissionId,
        patient_id: patientId,
        reminder_type: reminderType || 'follow_up_appointment',
        reminder_date: reminderDate,
        reminder_message: reminderMessage || `Follow-up appointment recommended ${followUpDays || 7} days after discharge`,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error creating follow-up reminder:', error);
    return NextResponse.json(
      { error: 'Failed to create reminder' },
      { status: 500 }
    );
  }
}

/**
 * PATCH: Update reminder (mark as sent, acknowledged, etc.)
 */
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { reminderId, updates } = body;

    if (!reminderId || !updates) {
      return NextResponse.json(
        { error: 'reminderId and updates are required' },
        { status: 400 }
      );
    }

    if (!supabase) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 500 }
      );
    }

    const { data, error } = await supabase
      .from('follow_up_reminders')
      .update(updates)
      .eq('id', reminderId)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating reminder:', error);
    return NextResponse.json(
      { error: 'Failed to update reminder' },
      { status: 500 }
    );
  }
}
