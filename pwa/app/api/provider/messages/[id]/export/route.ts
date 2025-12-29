/**
 * Export message timeline for legal defense
 * GET /api/provider/messages/[id]/export
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';
import { getCurrentUser } from '@/lib/supabase/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const user = await getCurrentUser();
    const allowedRoles = ['provider', 'admin', 'clinician'];
    if (!user || !allowedRoles.includes(user.role as string)) {
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
    const messagesArray = thread.messages as Array<{
      id: string;
      sender_role: string;
      type: string;
      content: string | null;
      created_at: string;
      read_at: string | null;
    }> | undefined;
    
    const timelineMessages: TimelineMessage[] | undefined = messagesArray ? messagesArray.map((msg) => ({
      id: msg.id,
      sender_role: msg.sender_role || 'unknown',
      type: msg.type,
      content: msg.content || '',
      sent_at: msg.created_at,
      read_at: msg.read_at || null,
    })) : undefined;

    const timeline: Timeline = {
      thread_id: thread.id,
      ...(thread.patients && { patient: thread.patients }),
      ...(thread.subject && { subject: thread.subject }),
      ...(thread.priority && { priority: thread.priority }),
      ...(thread.status && { status: thread.status }),
      ...(thread.sla_started_at || thread.sla_deadline || thread.sla_status ? {
        sla: {
          ...(thread.sla_started_at && { started_at: thread.sla_started_at }),
          ...(thread.sla_deadline && { deadline: thread.sla_deadline }),
          ...(thread.sla_status && { status: thread.sla_status }),
          ...(thread.sla_initial_response_at && { initial_response_at: thread.sla_initial_response_at }),
          ...(thread.sla_completed_at && { completed_at: thread.sla_completed_at }),
        }
      } : {}),
      ...(timelineMessages && { messages: timelineMessages }),
      ...(auditLogs && auditLogs.length > 0 && { audit_logs: auditLogs }),
      ...(interactionLogs && interactionLogs.length > 0 && { patient_interactions: interactionLogs }),
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
      // PDF export requires additional library (e.g., pdfkit, jsPDF)
      // Returning 501 Not Implemented is appropriate for future feature
      return NextResponse.json(
        { error: 'PDF export not yet implemented. Please use JSON or CSV format.' },
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
  } catch (error) {
    console.error('Export error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to export timeline';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

interface TimelineMessage {
  id: string;
  sent_at: string;
  sender_role: string;
  type: string;
  content: string;
  read_at: string | null;
}

interface TimelineAuditLog {
  created_at: string;
  action_type: string;
  details: Record<string, unknown>;
}

interface TimelineInteraction {
  created_at: string;
  action_taken: string;
  copy_shown: string;
}

interface Timeline {
  thread_id: string;
  patient?: { first_name?: string; last_name?: string } | null;
  subject?: string | null;
  priority?: string;
  status?: string;
  sla?: {
    started_at?: string | null;
    deadline?: string | null;
    status?: string | null;
    initial_response_at?: string | null;
    completed_at?: string | null;
  };
  messages?: TimelineMessage[];
  audit_logs?: TimelineAuditLog[];
  patient_interactions?: TimelineInteraction[];
  exported_at: string;
}

function convertToCSV(timeline: Timeline): string {
  const rows: string[] = [];
  
  // Header
  rows.push('Type,Timestamp,Description');
  
  // Messages
  timeline.messages?.forEach((msg) => {
    rows.push(
      `Message,${msg.sent_at},"${msg.sender_role}: ${msg.content?.substring(0, 100) || ''}"`
    );
  });
  
  // Audit logs
  timeline.audit_logs?.forEach((log) => {
    rows.push(`Audit,${log.created_at},"${log.action_type}: ${JSON.stringify(log.details)}"`);
  });
  
  // Patient interactions
  timeline.patient_interactions?.forEach((interaction) => {
    rows.push(
      `Interaction,${interaction.created_at},"${interaction.action_taken}: ${interaction.copy_shown}"`
    );
  });
  
  return rows.join('\n');
}

