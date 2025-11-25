'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { PageContainer } from '@/components/layout/PageContainer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  getVoiceMessageDetail,
  type VoiceMessageDetail,
} from '@/services/patient/voice-messages';
import { AudioAccessModal } from '@/components/patient/AudioAccessModal';
import { Loader2, ArrowLeft, AlertTriangle } from 'lucide-react';

export default function VoiceMessageDetailPage() {
  const params = useParams<{ voiceMessageId: string }>();
  const router = useRouter();
  const [detail, setDetail] = useState<VoiceMessageDetail | null>(null);
  const [showEnglish, setShowEnglish] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!params?.voiceMessageId) return;
    async function loadDetail() {
      try {
        const data = await getVoiceMessageDetail(params.voiceMessageId);
        setDetail(data);
      } catch (error) {
        console.error('Failed to load voice message detail', error);
      } finally {
        setLoading(false);
      }
    }
    loadDetail();
  }, [params?.voiceMessageId]);

  const severityColor =
    detail?.severity === 'EMERGENT'
      ? 'bg-red-100 text-red-800'
      : detail?.severity === 'URGENT'
      ? 'bg-amber-100 text-amber-800'
      : 'bg-emerald-100 text-emerald-800';

  return (
    <PageContainer>
      <div className="py-6 space-y-6 max-w-3xl mx-auto">
        <Button variant="ghost" className="gap-2" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>

        {loading || !detail ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-teal-600" />
          </div>
        ) : (
          <>
            <Card>
              <CardHeader className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className={severityColor}>
                    {detail.severity}
                  </Badge>
                  <span className="text-sm text-slate-600">
                    {new Date(detail.createdAt).toLocaleString()}
                  </span>
                </div>
                <CardTitle className="text-xl">Recorded message</CardTitle>
                <p className="text-sm text-slate-600">
                  Status: <span className="uppercase">{detail.triageTaskStatus}</span>
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <TranscriptViewer
                  detail={detail}
                  showEnglish={showEnglish}
                  onToggle={() => setShowEnglish((prev) => !prev)}
                />

                <div>
                  <p className="text-xs uppercase mb-1 text-slate-600">AI summary</p>
                  <p className="text-body text-slate-900">
                    {detail.aiSummary || 'Summary not available.'}
                  </p>
                </div>

                {detail.riskFlags?.length ? (
                  <div className="rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-800 flex gap-2 items-center">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Flags: {detail.riskFlags.join(', ')}</span>
                  </div>
                ) : null}

                {detail.hasAudioAvailableToPatient ? (
                  <AudioAccessModal voiceMessageId={detail.id} />
                ) : (
                  <div className="rounded-md bg-slate-50 border border-slate-200 px-3 py-2 text-sm text-slate-600 flex gap-2 items-center">
                    <AlertTriangle className="w-4 h-4" />
                    <span>
                      The original audio recording is no longer available, but your transcript remains in
                      your record.
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </PageContainer>
  );
}

function TranscriptViewer({
  detail,
  showEnglish,
  onToggle,
}: {
  detail: VoiceMessageDetail;
  showEnglish: boolean;
  onToggle: () => void;
}) {
  const canToggle =
    detail.translatedTranscript && detail.originalLanguage && detail.originalLanguage !== 'en';
  const transcriptText =
    canToggle && !showEnglish ? detail.translatedTranscript : detail.englishTranscript;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase text-slate-600">Transcript</p>
          <p className="text-xs text-slate-600">
            Original language: {detail.originalLanguage?.toUpperCase()}
          </p>
        </div>
        {canToggle && (
          <Button variant="ghost" size="sm" onClick={onToggle}>
            {showEnglish ? 'View patient language' : 'Show English version'}
          </Button>
        )}
      </div>
      <div className="rounded-xl border border-slate-200 p-4 text-sm leading-relaxed bg-slate-50 text-slate-900">
        {transcriptText}
      </div>
    </div>
  );
}

