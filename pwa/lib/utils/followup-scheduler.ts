/**
 * Follow-up Scheduling Utilities
 * Parses doctor's notes to extract follow-up instructions and schedules appointments
 */

import { apiClient } from '@/lib/api/solopractice-client';
import { syncAuthTokensToApiClient } from '@/lib/api/message-helpers';

export interface FollowUpInstruction {
  needsFollowUp: boolean;
  appointmentType?: string;
  urgency?: 'routine' | 'soon' | 'urgent';
  reason?: string;
  suggestedDate?: string; // ISO date string
  suggestedTime?: string; // HH:MM format
  isTelehealth?: boolean;
}

/**
 * Parse doctor's note to extract follow-up instructions
 * Looks for patterns like:
 * - "Schedule follow-up in 2 weeks"
 * - "Follow up in 1 month"
 * - "See patient again in 3 months"
 * - "Schedule appointment for lab review"
 * - "Urgent follow-up needed"
 */
export function parseFollowUpInstructions(doctorNote: string): FollowUpInstruction {
  if (!doctorNote || doctorNote.trim().length === 0) {
    return { needsFollowUp: false };
  }

  const note = doctorNote.toLowerCase();
  
  // Check for explicit follow-up keywords
  const followUpKeywords = [
    'follow up',
    'follow-up',
    'followup',
    'schedule',
    'appointment',
    'see patient again',
    'return visit',
    'recheck',
    're-check',
    'follow-up visit',
  ];

  const hasFollowUpKeyword = followUpKeywords.some(keyword => note.includes(keyword));
  
  if (!hasFollowUpKeyword) {
    return { needsFollowUp: false };
  }

  // Determine urgency
  let urgency: 'routine' | 'soon' | 'urgent' = 'routine';
  if (note.includes('urgent') || note.includes('asap') || note.includes('immediately')) {
    urgency = 'urgent';
  } else if (note.includes('soon') || note.includes('within week') || note.includes('within 1 week')) {
    urgency = 'soon';
  }

  // Determine appointment type
  let appointmentType = 'follow_up';
  if (note.includes('lab') || note.includes('results')) {
    appointmentType = 'lab_review';
  } else if (note.includes('medication') || note.includes('med')) {
    appointmentType = 'medication';
  } else if (note.includes('physical') || note.includes('annual')) {
    appointmentType = 'annual';
  } else if (note.includes('sick') || note.includes('illness')) {
    appointmentType = 'sick';
  }

  // Extract time frame
  let suggestedDate: string | undefined;
  const timeFramePatterns = [
    { pattern: /(\d+)\s*(week|weeks)/i, multiplier: 7 },
    { pattern: /(\d+)\s*(month|months)/i, multiplier: 30 },
    { pattern: /(\d+)\s*(day|days)/i, multiplier: 1 },
  ];

  for (const { pattern, multiplier } of timeFramePatterns) {
    const match = note.match(pattern);
    if (match) {
      const days = parseInt(match[1], 10) * multiplier;
      const date = new Date();
      date.setDate(date.getDate() + days);
      suggestedDate = date.toISOString().split('T')[0];
      break;
    }
  }

  // Check for telehealth preference
  const isTelehealth = note.includes('telehealth') || note.includes('telemedicine') || note.includes('virtual');

  // Extract reason (use first sentence or first 200 chars)
  const sentences = doctorNote.split(/[.!?]/).filter(s => s.trim().length > 0);
  const reason = sentences[0]?.trim().substring(0, 200) || doctorNote.substring(0, 200);

  return {
    needsFollowUp: true,
    appointmentType,
    urgency,
    reason,
    suggestedDate,
    isTelehealth,
  };
}

/**
 * Schedule a follow-up appointment based on instructions
 */
export async function scheduleFollowUpAppointment(
  patientId: string,
  instructions: FollowUpInstruction,
  relatedTo?: { type: 'lab' | 'radiology' | 'referral'; id: string; description: string }
): Promise<{ success: boolean; appointmentId?: string; error?: string }> {
  if (!instructions.needsFollowUp) {
    return { success: false, error: 'No follow-up needed' };
  }

  try {
    syncAuthTokensToApiClient();

    const reason = relatedTo
      ? `Follow-up for ${relatedTo.type}: ${relatedTo.description}. ${instructions.reason || ''}`
      : instructions.reason || 'Follow-up appointment';

    const appointmentRequest = {
      type: instructions.appointmentType || 'follow_up',
      preferred_date: instructions.suggestedDate,
      preferred_time: instructions.suggestedTime,
      reason: reason.substring(0, 500), // Limit reason length
      urgency: instructions.urgency || 'routine',
    };

    const response = await apiClient.requestAppointment(appointmentRequest);

    return {
      success: true,
      appointmentId: response.id,
    };
  } catch (error) {
    console.error('Error scheduling follow-up appointment:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to schedule appointment',
    };
  }
}

