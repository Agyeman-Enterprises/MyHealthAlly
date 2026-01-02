/**
 * Message Helper Functions
 * Utilities for working with Solopractice message API
 */

import { apiClient, type SendMessageRequest, type MessageResponse } from './solopractice-client';
import { useAuthStore } from '@/lib/store/auth-store';

/**
 * Sync auth tokens from auth store to API client
 */
export function syncAuthTokensToApiClient() {
  const authStore = useAuthStore.getState();
  if (authStore.accessToken && authStore.refreshToken) {
    apiClient.setTokens(authStore.accessToken, authStore.refreshToken);
  }
}

/**
 * Get or create a default message thread for the patient
 * Returns thread ID or null if error
 */
export async function getOrCreateDefaultThread(): Promise<string | null> {
  try {
    syncAuthTokensToApiClient();
    
    // Get all threads
    const threads = await apiClient.getThreads();
    
    // If threads exist, return the first one (or most recent)
    if (threads && threads.length > 0) {
      // Sort by last_message_at or created_at, most recent first
      const sorted = threads.sort((a, b) => {
        const aTime = a.last_message_at ? new Date(a.last_message_at).getTime() : new Date(a.created_at).getTime();
        const bTime = b.last_message_at ? new Date(b.last_message_at).getTime() : new Date(b.created_at).getTime();
        return bTime - aTime;
      });
      return sorted[0].id;
    }
    
    // No threads exist - Solopractice will create one on first message
    // Return null to indicate we need to create a new thread
    return null;
  } catch (error) {
    console.error('Error getting threads:', error);
    return null;
  }
}

/**
 * Send a message to Solopractice
 * Handles thread creation if needed
 */
export async function sendMessageToSolopractice(
  body: string,
  subject?: string,
  threadId?: string,
  detectedLanguage?: string,
  recipient?: string
): Promise<MessageResponse> {
  syncAuthTokensToApiClient();
  
  // Get or create thread
  let targetThreadId = threadId;
  if (!targetThreadId) {
    targetThreadId = await getOrCreateDefaultThread();
  }
  
  // If still no thread, Solopractice will create one on first message
  // Use a placeholder - the API should handle thread creation
  if (!targetThreadId) {
    // Create a new thread by sending to a special endpoint or use a default
    // For now, we'll let the API create it - but we need a thread ID
    // This is a limitation - we may need to call a create-thread endpoint first
    throw new Error('No thread available. Please try again.');
  }
  
  // Map recipient to category for routing
  // MD recipients are in format 'md-{clinicianId}'
  const categoryMap: Record<string, string> = {
    'care-team': 'general',
    'nurse': 'clinical',
    'billing': 'billing',
    'scheduling': 'scheduling',
  };
  
  // Check if recipient is an MD (starts with 'md-')
  const isMDRecipient = recipient?.startsWith('md-');
  const category = isMDRecipient 
    ? 'clinical' 
    : (recipient ? categoryMap[recipient] || 'general' : undefined);
  
  const request: SendMessageRequest = {
    body,
    detected_language: detectedLanguage,
    recipient: recipient,
    subject: subject,
    category: recipient ? categoryMap[recipient] || 'general' : undefined,
  };
  
  const response = await apiClient.sendMessage(targetThreadId, request);
  return response;
}

/**
 * Handle message response status
 * Returns user-friendly message and action
 */
export function handleMessageStatus(response: MessageResponse): {
  success: boolean;
  message: string;
  action?: 'redirect_emergency' | 'show_deferred';
  nextOpenAt?: string;
} {
  if (response.status === 'sent') {
    return {
      success: true,
      message: 'Message sent successfully! You will receive a response within 24-48 hours.',
    };
  }
  
  if (response.status === 'after_hours_deferred') {
    return {
      success: true,
      message: `Your message has been received and will be delivered when the practice opens. ${response.next_open_at ? `Practice opens at ${new Date(response.next_open_at).toLocaleString()}.` : ''}`,
      action: 'show_deferred',
      nextOpenAt: response.next_open_at,
    };
  }
  
  if (response.status === 'blocked') {
    if (response.action === 'redirect_emergency') {
      return {
        success: false,
        message: 'This message contains emergency symptoms. Please call 911 immediately or go to the nearest emergency room.',
        action: 'redirect_emergency',
      };
    }
    
    return {
      success: false,
      message: response.reason || response.message || 'Message was blocked. Please call the office for urgent matters.',
    };
  }
  
  return {
    success: false,
    message: 'An error occurred while sending your message. Please try again.',
  };
}

