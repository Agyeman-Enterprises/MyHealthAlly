/**
 * Export patient data (GDPR/CCPA compliance)
 * GET /api/patient/export
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';
import { getCurrentUser } from '@/lib/supabase/auth';

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get patient record
    const { data: patientRecord } = await supabase
      .from('users')
      .select('*, patients(*)')
      .eq('id', user.id)
      .single();

    if (!patientRecord || !patientRecord.patients?.[0]) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    }

    const patientId = patientRecord.patients[0].id;

    // Get all patient data
    const [
      { data: vitals },
      { data: medications },
      { data: labOrders },
      { data: carePlans },
      { data: messageThreads },
      { data: tasks },
      { data: auditLogs },
    ] = await Promise.all([
      supabase.from('vitals').select('*').eq('patient_id', patientId),
      supabase.from('medications').select('*').eq('patient_id', patientId),
      supabase.from('lab_orders').select('*').eq('patient_id', patientId),
      supabase.from('care_plans').select('*').eq('patient_id', patientId),
      supabase.from('message_threads').select('*, messages(*)').eq('patient_id', patientId),
      supabase.from('tasks').select('*').eq('patient_id', patientId),
      supabase.from('audit_logs').select('*').eq('patient_id', patientId),
    ]);

    // Build export data
    const exportData = {
      user: {
        email: patientRecord.email,
        phone: patientRecord.phone,
        created_at: patientRecord.created_at,
      },
      patient: patientRecord.patients[0],
      vitals: vitals || [],
      medications: medications || [],
      lab_orders: labOrders || [],
      care_plans: carePlans || [],
      messages: messageThreads || [],
      tasks: tasks || [],
      audit_logs: auditLogs || [],
      exported_at: new Date().toISOString(),
    };

    // Log export request
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      patient_id: patientId,
      action_type: 'export_requested',
      resource_type: 'patient',
      resource_id: patientId,
      details: { export_type: 'full' },
    });

    const format = request.nextUrl.searchParams.get('format') || 'json';

    if (format === 'json') {
      return NextResponse.json(exportData, {
        headers: {
          'Content-Disposition': `attachment; filename="patient-data-export-${patientId}.json"`,
        },
      });
    } else {
      // CSV export would require flattening nested data
      return NextResponse.json(
        { error: 'CSV export not yet implemented for full patient data' },
        { status: 501 }
      );
    }
  } catch (error) {
    console.error('Export error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to export data';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

