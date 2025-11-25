import { fetchAPI } from '@/lib/utils';

export type IntentType =
  | 'SYMPTOM_REPORT'
  | 'REQUEST_SAME_DAY_APPOINTMENT'
  | 'REQUEST_FUTURE_APPOINTMENT'
  | 'REQUEST_REFILL'
  | 'ADMIN_TASK'
  | 'GENERAL_QUESTION';

export interface IntentClassification {
  intent: IntentType;
  confidence: number;
  structuredFields: {
    symptomType?: string;
    severity?: 'mild' | 'moderate' | 'severe';
    urgency?: 'routine' | 'urgent' | 'emergent';
    medicationName?: string;
    preferredDate?: string;
    preferredTime?: string;
    taskType?: string;
    [key: string]: any;
  };
}

export async function classifyIntent(text: string): Promise<IntentClassification> {
  try {
    const response = await fetchAPI('/ai/classify-intent', {
      method: 'POST',
      body: JSON.stringify({ text }),
    });
    return response;
  } catch (error) {
    console.error('Failed to classify intent:', error);
    // Fallback: simple keyword-based classification
    return fallbackClassifyIntent(text);
  }
}

function fallbackClassifyIntent(text: string): IntentClassification {
  const lowerText = text.toLowerCase();

  // Symptom keywords
  if (
    lowerText.includes('pain') ||
    lowerText.includes('hurt') ||
    lowerText.includes('ache') ||
    lowerText.includes('symptom') ||
    lowerText.includes('feeling') ||
    lowerText.includes('nauseous') ||
    lowerText.includes('dizzy') ||
    lowerText.includes('fever') ||
    lowerText.includes('cough')
  ) {
    return {
      intent: 'SYMPTOM_REPORT',
      confidence: 0.7,
      structuredFields: {
        symptomType: extractSymptomType(text),
        severity: extractSeverity(text),
      },
    };
  }

  // Same-day appointment
  if (
    lowerText.includes('today') ||
    lowerText.includes('asap') ||
    lowerText.includes('urgent') ||
    lowerText.includes('emergency') ||
    lowerText.includes('same day')
  ) {
    return {
      intent: 'REQUEST_SAME_DAY_APPOINTMENT',
      confidence: 0.8,
      structuredFields: {
        urgency: 'urgent',
      },
    };
  }

  // Future appointment
  if (
    lowerText.includes('appointment') ||
    lowerText.includes('schedule') ||
    lowerText.includes('book') ||
    lowerText.includes('visit')
  ) {
    return {
      intent: 'REQUEST_FUTURE_APPOINTMENT',
      confidence: 0.7,
      structuredFields: {
        preferredDate: extractDate(text),
        preferredTime: extractTime(text),
      },
    };
  }

  // Refill request
  if (
    lowerText.includes('refill') ||
    lowerText.includes('prescription') ||
    lowerText.includes('medication') ||
    lowerText.includes('meds')
  ) {
    return {
      intent: 'REQUEST_REFILL',
      confidence: 0.8,
      structuredFields: {
        medicationName: extractMedicationName(text),
      },
    };
  }

  // Admin task
  if (
    lowerText.includes('billing') ||
    lowerText.includes('insurance') ||
    lowerText.includes('form') ||
    lowerText.includes('document') ||
    lowerText.includes('letter')
  ) {
    return {
      intent: 'ADMIN_TASK',
      confidence: 0.7,
      structuredFields: {
        taskType: extractTaskType(text),
      },
    };
  }

  // Default to general question
  return {
    intent: 'GENERAL_QUESTION',
    confidence: 0.6,
    structuredFields: {},
  };
}

function extractSymptomType(text: string): string {
  const symptoms = ['pain', 'headache', 'fever', 'cough', 'nausea', 'dizziness', 'fatigue'];
  const lowerText = text.toLowerCase();
  for (const symptom of symptoms) {
    if (lowerText.includes(symptom)) {
      return symptom;
    }
  }
  return 'general';
}

function extractSeverity(text: string): 'mild' | 'moderate' | 'severe' {
  const lowerText = text.toLowerCase();
  if (lowerText.includes('severe') || lowerText.includes('extreme') || lowerText.includes('unbearable')) {
    return 'severe';
  }
  if (lowerText.includes('moderate') || lowerText.includes('bad')) {
    return 'moderate';
  }
  return 'mild';
}

function extractDate(text: string): string | undefined {
  // Simple date extraction - can be enhanced
  const dateMatch = text.match(/\d{1,2}\/\d{1,2}\/\d{2,4}/);
  return dateMatch ? dateMatch[0] : undefined;
}

function extractTime(text: string): string | undefined {
  const timeMatch = text.match(/\d{1,2}:\d{2}\s*(am|pm)/i);
  return timeMatch ? timeMatch[0] : undefined;
}

function extractMedicationName(text: string): string | undefined {
  // Simple extraction - can be enhanced with medication database
  const medMatch = text.match(/(?:refill|prescription|medication)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i);
  return medMatch ? medMatch[1] : undefined;
}

function extractTaskType(text: string): string {
  if (text.toLowerCase().includes('billing')) return 'billing';
  if (text.toLowerCase().includes('insurance')) return 'insurance';
  if (text.toLowerCase().includes('form')) return 'form';
  if (text.toLowerCase().includes('document')) return 'document';
  return 'general';
}

