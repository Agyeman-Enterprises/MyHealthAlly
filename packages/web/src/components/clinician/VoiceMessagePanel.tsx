'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  ClinicianVoiceMessageDetail,
  requestVoiceMessageAudioForStaff,
} from '@/services/clinician/voice-messages';
import { AlertTriangle, Headphones, Loader2 } from 'lucide-react';

interface VoiceMessagePanelProps {
  detail: ClinicianVoiceMessageDetail | null;
  loading: boolean;
  error?: string | null;
}

export function VoiceMessagePanel({ detail, loading, error }: VoiceMessagePanelProps) {
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioExpiresAt, setAudioExpiresAt] = useState<string | null>(null);
  const [requestingAudio, setRequestingAudio] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 flex items-center gap-3 text-myh-textSoft">
          <Loader2 className="w-4 h-4 animate-spin" />
          Loading voice recording…
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-4 flex items-center gap-2 text-myh-danger">
          <AlertTriangle className="w-4 h-4" />
          {error}
        </CardContent>
      </Card>
    );
  }

  if (!detail) {
    return null;
  }

  const handleRequestAudio = async () => {
    setRequestingAudio(true);
    setAudioError(null);
    try {
      const response = await requestVoiceMessageAudioForStaff(detail.id);
      setAudioUrl(response.signedUrl);
      setAudioExpiresAt(response.expiresAt);
    } catch (err: any) {
      setAudioError(err?.message || 'Unable to retrieve audio recording.');
    } finally {
      setRequestingAudio(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Voice recording</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2 items-center">
          <Badge variant="outline" className="uppercase">
            {detail.severity}
          </Badge>
          <span className="text-sm text-myh-textSoft">
            {new Date(detail.createdAt).toLocaleString()}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TranscriptBlock
            title="Original transcript"
            subtitle={`Patient language: ${detail.originalLanguage?.toUpperCase()}`}
            text={detail.originalTranscript}
          />
          <TranscriptBlock title="Canonical (English)" text={detail.englishTranscript} />
        </div>

        {detail.aiSummary && (
          <div>
            <p className="text-xs uppercase text-myh-textSoft mb-1">AI summary</p>
            <p className="text-sm text-myh-textPrimary leading-relaxed">{detail.aiSummary}</p>
          </div>
        )}

        {detail.riskFlags?.length ? (
          <div className="rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-800 flex gap-2 items-center">
            <AlertTriangle className="w-4 h-4" />
            Flags: {detail.riskFlags.join(', ')}
          </div>
        ) : null}

        <div className="rounded-lg border border-myh-borderSoft p-3 text-sm space-y-1">
          <p>
            <span className="text-myh-textSoft">Patient transcript access: </span>
            <strong>{detail.isAccessibleToPatient ? 'Yes' : 'No'}</strong>
          </p>
          <p>
            <span className="text-myh-textSoft">Audio retained until: </span>
            <strong>
              {detail.audioRetentionExpiresAt
                ? new Date(detail.audioRetentionExpiresAt).toLocaleDateString()
                : 'Expired'}
            </strong>
          </p>
          <p>
            <span className="text-myh-textSoft">Download count: </span>
            <strong>{detail.audioDownloadCount}</strong>
          </p>
          <p>
            <span className="text-myh-textSoft">Last download: </span>
            <strong>
              {detail.lastAudioDownloadAt
                ? new Date(detail.lastAudioDownloadAt).toLocaleString()
                : 'Never'}
            </strong>
          </p>
        </div>

        {detail.hasAudioAvailableToPatient ? (
          <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full flex items-center justify-center gap-2"
              onClick={handleRequestAudio}
              disabled={requestingAudio}
            >
              {requestingAudio ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating secure link…
                </>
              ) : (
                <>
                  <Headphones className="w-4 h-4" />
                  Request audio playback
                </>
              )}
            </Button>
            {audioError && (
              <p className="text-sm text-myh-danger flex items-center gap-1">
                <AlertTriangle className="w-4 h-4" />
                {audioError}
              </p>
            )}
            {audioUrl && (
              <div className="space-y-1">
                <audio controls className="w-full" src={audioUrl}>
                  Your browser does not support audio playback.
                </audio>
                {audioExpiresAt && (
                  <p className="text-xs text-myh-textSoft">
                    Link expires at {new Date(audioExpiresAt).toLocaleTimeString()}.
                  </p>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="rounded-md bg-slate-50 border border-slate-200 px-3 py-2 text-sm text-slate-600 flex gap-2 items-center">
            <AlertTriangle className="w-4 h-4" />
            Audio recording has expired, but transcripts remain archived.
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function TranscriptBlock({
  title,
  subtitle,
  text,
}: {
  title: string;
  subtitle?: string;
  text: string;
}) {
  return (
    <div className="space-y-2">
      <div>
        <p className="text-xs uppercase text-myh-textSoft">{title}</p>
        {subtitle && <p className="text-xs text-myh-textSoft">{subtitle}</p>}
      </div>
      <div className="rounded-xl border border-myh-borderSoft bg-myh-background p-3 text-sm leading-relaxed text-myh-textPrimary">
        {text}
      </div>
    </div>
  );
}

