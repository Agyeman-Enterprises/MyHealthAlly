/**
 * Delete patient data (GDPR/CCPA compliance)
 * DELETE /api/patient/data
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';
import { getCurrentUser } from '@/lib/supabase/auth';

export async function DELETE(request: NextRequest) {
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

    // Verify deletion request (should have confirmation)
    const { confirm } = await request.json();
    if (confirm !== 'DELETE') {
      return NextResponse.json(
        { error: 'Deletion must be confirmed with confirm: "DELETE"' },
        { status: 400 }
      );
    }

    // Log deletion request
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      patient_id: patientId,
      action_type: 'data_deleted',
      resource_type: 'patient',
      resource_id: patientId,
      details: { deletion_requested_at: new Date().toISOString() },
    });

    // Delete patient data (cascade will handle related records)
    // Note: In production, you may want to soft-delete or anonymize instead
    const { error: deleteError } = await supabase
      .from('patients')
      .delete()
      .eq('id', patientId);

    if (deleteError) {
      console.error('Delete error:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete data' },
        { status: 500 }
      );
    }

    // Also delete user account
    const { error: userDeleteError } = await supabase
      .from('users')
      .delete()
      .eq('id', user.id);

    if (userDeleteError) {
      console.error('User delete error:', userDeleteError);
    }

    return NextResponse.json({
      message: 'Data deleted successfully',
      deleted_at: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Delete error:', error);
    return NextResponse.json(
      { error: 'Failed to delete data' },
      { status: 500 }
    );
  }
}

