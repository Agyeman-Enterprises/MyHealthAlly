import { fetchAPI } from '@/lib/utils';

export interface ClinicianVoiceMessageDetail {
  id: string;
  patientId: string;
  patientName?: string;
  createdAt: string;
  severity: 'ROUTINE' | 'URGENT' | 'EMERGENT';
  intentType: string;
  aiSummary?: string;
  originalTranscript: string;
  englishTranscript: string;
  originalLanguage: string;
  hasAudioAvailableToPatient: boolean;
  audioRetentionExpiresAt?: string;
  audioDownloadCount: number;
  lastAudioDownloadAt?: string;
  triageTaskStatus: string;
  riskFlags?: string[];
  isAccessibleToPatient: boolean;
}

export interface ClinicianVoiceMessageSummary {
  id: string;
  createdAt: string;
  severity: 'ROUTINE' | 'URGENT' | 'EMERGENT';
  intentType: string;
  aiSummary?: string;
  originalTranscript: string;
  englishTranscript: string;
  originalLanguage: string;
  hasAudioAvailableToPatient: boolean;
  audioRetentionExpiresAt?: string;
  audioDownloadCount: number;
  lastAudioDownloadAt?: string;
  status: string;
}

export async function getPatientVoiceMessagesForStaff(
  patientId: string,
): Promise<ClinicianVoiceMessageSummary[]> {
  const response = await fetchAPI(`/clinician/patients/${patientId}/voice-messages`);
  return response?.items || [];
}

export async function getVoiceMessageForTask(
  taskId: string,
): Promise<ClinicianVoiceMessageDetail> {
  return fetchAPI(`/clinician/voice-messages/by-task/${taskId}`);
}

export async function getVoiceMessageForStaff(
  id: string,
): Promise<ClinicianVoiceMessageDetail> {
  return fetchAPI(`/clinician/voice-messages/${id}`);
}

export interface AudioAccessResponse {
  signedUrl: string;
  expiresAt: string;
}

export async function requestVoiceMessageAudioForStaff(
  id: string,
): Promise<AudioAccessResponse> {
  return fetchAPI(`/clinician/voice-messages/${id}/request-audio`, {
    method: 'POST',
  });
}

export interface VoiceUsageSummary {
  totalVoiceMessages: number;
  availableRecordings: number;
  expiredRecordings: number;
  totalDownloads: number;
}

export async function getVoiceAudioUsage(): Promise<VoiceUsageSummary> {
  return fetchAPI('/admin/voice-messages/audio-usage');
}

