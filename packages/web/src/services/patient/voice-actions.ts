import { fetchAPI } from '@/lib/utils';
import type { IntentClassification } from '@/services/ai/intent-classifier';

export interface VoiceActionResult {
  success: boolean;
  message: string;
  actionTaken: string;
  triageTaskId?: string;
  refillId?: string;
  taskId?: string;
}

export async function processVoiceMessage(
  text: string,
  audioBlob?: Blob,
): Promise<VoiceActionResult> {
  try {
    const formData = new FormData();
    formData.append('transcript', text);
    formData.append('timestamp', new Date().toISOString());

    if (audioBlob) {
      formData.append('audio', audioBlob, 'voice-recording.webm');
    }

    const response = await fetchAPI('/patients/me/voice-logs', {
      method: 'POST',
      body: formData,
      headers: {},
    });

    return {
      success: response.success ?? true,
      message:
        response.patientMessage ||
        response.aiSummary ||
        'Your message has been received. The care team is reviewing it now.',
      actionTaken: 'voice_message_recorded',
      triageTaskId: response.triageTaskId,
    };
  } catch (error: any) {
    console.error('Voice message processing failed:', error);
    return {
      success: false,
      message:
        error?.message ||
        'We ran into an issue recording your message. Please try again or contact your care team.',
      actionTaken: 'error',
    };
  }
}

async function handleFutureAppointment(
  text: string,
  classification: IntentClassification
): Promise<VoiceActionResult> {
  try {
    // Create triage task
    const triageTask = await fetchAPI('/triage/tasks', {
      method: 'POST',
      body: JSON.stringify({
        intentType: 'REQUEST_FUTURE_APPOINTMENT',
        severity: 'ROUTINE',
        sourceMessage: text,
        sourceType: 'voice',
        preferredDate: classification.structuredFields.preferredDate,
        preferredTime: classification.structuredFields.preferredTime,
      }),
    });

    return {
      success: true,
      message: 'I\'ve sent your appointment request to your care team. They will contact you to confirm a time.',
      actionTaken: 'future_appointment_requested',
      triageTaskId: triageTask.id,
    };
  } catch (error: any) {
    console.error('Failed to handle future appointment:', error);
    return {
      success: false,
      message: 'I had trouble processing your appointment request. Please try again.',
      actionTaken: 'error',
    };
  }
}

async function handleRefillRequest(
  text: string,
  classification: IntentClassification
): Promise<VoiceActionResult> {
  try {
    // Create refill request
    const refill = await fetchAPI('/patients/me/refills/create', {
      method: 'POST',
      body: JSON.stringify({
        medicationName: classification.structuredFields.medicationName,
        notes: text,
      }),
    });

    // Create triage task
    const triageTask = await fetchAPI('/triage/tasks', {
      method: 'POST',
      body: JSON.stringify({
        intentType: 'REQUEST_REFILL',
        severity: 'ROUTINE',
        sourceMessage: text,
        sourceType: 'voice',
        refillId: refill.id,
      }),
    });

    return {
      success: true,
      message: 'I\'ve sent your refill request to your care team. They will process it shortly.',
      actionTaken: 'refill_requested',
      refillId: refill.id,
      triageTaskId: triageTask.id,
    };
  } catch (error: any) {
    console.error('Failed to handle refill request:', error);
    return {
      success: false,
      message: 'I had trouble processing your refill request. Please try again or contact your pharmacy.',
      actionTaken: 'error',
    };
  }
}

async function handleAdminTask(
  text: string,
  classification: IntentClassification
): Promise<VoiceActionResult> {
  try {
    // Create admin task
    const task = await fetchAPI('/tasks/admin', {
      method: 'POST',
      body: JSON.stringify({
        taskType: classification.structuredFields.taskType || 'general',
        description: text,
        source: 'voice',
      }),
    });

    // Create triage task
    const triageTask = await fetchAPI('/triage/tasks', {
      method: 'POST',
      body: JSON.stringify({
        intentType: 'ADMIN_TASK',
        severity: 'ROUTINE',
        sourceMessage: text,
        sourceType: 'voice',
        adminTaskId: task.id,
      }),
    });

    return {
      success: true,
      message: 'I\'ve created a task for your request. Our team will handle it shortly.',
      actionTaken: 'admin_task_created',
      taskId: task.id,
      triageTaskId: triageTask.id,
    };
  } catch (error: any) {
    console.error('Failed to handle admin task:', error);
    return {
      success: false,
      message: 'I had trouble processing your request. Please try again or contact the office.',
      actionTaken: 'error',
    };
  }
}

async function handleGeneralQuestion(text: string): Promise<VoiceActionResult> {
  try {
    // Send to AI chat endpoint
    const response = await fetchAPI('/ai/chat', {
      method: 'POST',
      body: JSON.stringify({
        message: text,
        context: 'patient_message',
      }),
    });

    return {
      success: true,
      message: response.response || 'I\'m here to help. How can I assist you?',
      actionTaken: 'ai_chat_response',
    };
  } catch (error: any) {
    console.error('Failed to handle general question:', error);
    return {
      success: false,
      message: 'I had trouble processing your question. Please try rephrasing or contact your care team.',
      actionTaken: 'error',
    };
  }
}

