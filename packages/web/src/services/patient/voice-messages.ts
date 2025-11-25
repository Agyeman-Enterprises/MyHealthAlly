import { fetchAPI } from '@/lib/utils';

export interface VoiceMessageSummary {
  id: string;
  createdAt: string;
  severity: 'ROUTINE' | 'URGENT' | 'EMERGENT';
  intentType: string;
  aiSummary?: string;
  transcriptPreview?: string;
  hasAudioAvailableToPatient: boolean;
  audioRetentionExpiresAt?: string;
  lastAudioDownloadAt?: string;
  status: string;
}

export interface VoiceMessageDetail {
  id: string;
  createdAt: string;
  severity: 'ROUTINE' | 'URGENT' | 'EMERGENT';
  intentType: string;
  originalTranscript: string;
  englishTranscript: string;
  translatedTranscript?: string;
  originalLanguage: string;
  aiSummary?: string;
  hasAudioAvailableToPatient: boolean;
  audioRetentionExpiresAt?: string;
  lastAudioDownloadAt?: string;
  triageTaskStatus: string;
  riskFlags?: string[];
}

export async function getVoiceMessages(): Promise<VoiceMessageSummary[]> {
  const response = await fetchAPI('/patients/me/voice-messages');
  return response?.items || [];
}

export async function getVoiceMessageDetail(id: string): Promise<VoiceMessageDetail> {
  return fetchAPI(`/patients/me/voice-messages/${id}`);
}

export interface AudioAccessResponse {
  signedUrl: string;
  expiresAt: string;
}

export async function requestVoiceMessageAudio(id: string): Promise<AudioAccessResponse> {
  return fetchAPI(`/patients/me/voice-messages/${id}/request-audio`, {
    method: 'POST',
  });
}

