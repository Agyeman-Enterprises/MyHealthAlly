/**
 * Export message timeline for legal defense
 * GET /api/provider/messages/[id]/export
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';
import { getCurrentUser } from '@/lib/supabase/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const user = await getCurrentUser();
    if (!user || (user.role !== 'provider' && user.role !== 'admin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const threadId = params.id;
    const format = request.nextUrl.searchParams.get('format') || 'json';

    // Get message thread with all messages
    const { data: thread, error: threadError } = await supabase
      .from('message_threads')
      .select('*, messages(*), patients(first_name, last_name)')
      .eq('id', threadId)
      .single();

    if (threadError || !thread) {
      return NextResponse.json({ error: 'Thread not found' }, { status: 404 });
    }

    // Get audit logs for this thread
    const { data: auditLogs } = await supabase
      .from('audit_logs')
      .select('*')
      .eq('resource_type', 'message')
      .or(`resource_id.eq.${threadId},details->>thread_id.eq.${threadId}`)
      .order('created_at', { ascending: true });

    // Get patient interaction logs
    const { data: interactionLogs } = await supabase
      .from('patient_interaction_logs')
      .select('*')
      .eq('patient_id', thread.patient_id)
      .or(`metadata->>thread_id.eq.${threadId},interaction_type.eq.message`)
      .order('created_at', { ascending: true });

    // Build timeline
    const timeline = {
      thread_id: thread.id,
      patient: thread.patients,
      subject: thread.subject,
      priority: thread.priority,
      status: thread.status,
      sla: {
        started_at: thread.sla_started_at,
        deadline: thread.sla_deadline,
        status: thread.sla_status,
        initial_response_at: thread.sla_initial_response_at,
        completed_at: thread.sla_completed_at,
      },
      messages: thread.messages?.map((msg: any) => ({
        id: msg.id,
        sender_role: msg.sender_role,
        type: msg.type,
        content: msg.content,
        sent_at: msg.sent_at,
        read_at: msg.read_at,
      })),
      audit_logs: auditLogs || [],
      patient_interactions: interactionLogs || [],
      exported_at: new Date().toISOString(),
    };

    // Format response based on requested format
    if (format === 'csv') {
      // Convert to CSV
      const csv = convertToCSV(timeline);
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="message-timeline-${threadId}.csv"`,
        },
      });
    } else if (format === 'pdf') {
      // For PDF, we'd need a PDF library - for now return JSON
      // TODO: Implement PDF generation
      return NextResponse.json(
        { error: 'PDF export not yet implemented' },
        { status: 501 }
      );
    } else {
      // JSON format
      return NextResponse.json(timeline, {
        headers: {
          'Content-Disposition': `attachment; filename="message-timeline-${threadId}.json"`,
        },
      });
    }
  } catch (error: any) {
    console.error('Export error:', error);
    return NextResponse.json(
      { error: 'Failed to export timeline' },
      { status: 500 }
    );
  }
}

function convertToCSV(timeline: any): string {
  const rows: string[] = [];
  
  // Header
  rows.push('Type,Timestamp,Description');
  
  // Messages
  timeline.messages?.forEach((msg: any) => {
    rows.push(
      `Message,${msg.sent_at},"${msg.sender_role}: ${msg.content?.substring(0, 100)}"`
    );
  });
  
  // Audit logs
  timeline.audit_logs?.forEach((log: any) => {
    rows.push(`Audit,${log.created_at},"${log.action_type}: ${JSON.stringify(log.details)}"`);
  });
  
  // Patient interactions
  timeline.patient_interactions?.forEach((interaction: any) => {
    rows.push(
      `Interaction,${interaction.created_at},"${interaction.action_taken}: ${interaction.copy_shown}"`
    );
  });
  
  return rows.join('\n');
}

