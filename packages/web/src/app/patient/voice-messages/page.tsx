'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { PageContainer } from '@/components/layout/PageContainer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getVoiceMessages, type VoiceMessageSummary } from '@/services/patient/voice-messages';
import { Loader2, AlertTriangle, Mic, ArrowRight } from 'lucide-react';

export default function VoiceMessagesPage() {
  const [items, setItems] = useState<VoiceMessageSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMessages() {
      try {
        const data = await getVoiceMessages();
        setItems(data);
      } catch (error) {
        console.error('Failed to load voice messages', error);
      } finally {
        setLoading(false);
      }
    }
    loadMessages();
  }, []);

  return (
    <PageContainer>
      <div className="py-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-600">Voice history</p>
            <h1 className="text-h1">Your recorded messages</h1>
            <p className="text-body text-slate-600">
              Every recording saves the transcript, AI summary, and care-team status for your records.
            </p>
          </div>
          <Link href="/patient/dashboard">
            <Button variant="outline" className="gap-2">
              <Mic className="w-4 h-4" />
              Record a new message
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-teal-600" />
          </div>
        ) : items.length === 0 ? (
          <Card>
            <CardContent className="py-12 flex flex-col items-center gap-3 text-center">
              <Mic className="w-10 h-10 text-slate-400" />
              <p className="text-body text-slate-600">No voice messages yet</p>
              <Link href="/patient/dashboard">
                <Button>Record your first message</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {items.map((item) => (
              <VoiceMessageCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>
    </PageContainer>
  );
}

function VoiceMessageCard({ item }: { item: VoiceMessageSummary }) {
  const severityColor =
    item.severity === 'EMERGENT'
      ? 'bg-red-100 text-red-800'
      : item.severity === 'URGENT'
      ? 'bg-amber-100 text-amber-800'
      : 'bg-emerald-100 text-emerald-800';

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-3">
          <Badge variant="outline" className={severityColor}>
            {item.severity}
          </Badge>
          <span className="text-sm text-slate-600">
            {new Date(item.createdAt).toLocaleString()}
          </span>
        </div>
        <Badge variant="secondary" className="uppercase tracking-wide">
          {item.status}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-xs uppercase mb-1 text-slate-600">Summary</p>
          <p className="text-body text-slate-900">
            {item.aiSummary || item.transcriptPreview || 'Summary not available.'}
          </p>
        </div>
        <div className="flex flex-wrap gap-3 items-center text-sm text-slate-600">
          <span className="capitalize">{item.intentType.replace(/_/g, ' ').toLowerCase()}</span>
          {item.hasAudioAvailableToPatient ? (
            <span className="flex items-center gap-1 text-slate-600">
              <Mic className="w-3 h-3" />
              Audio available
            </span>
          ) : (
            <span className="flex items-center gap-1 text-slate-600">
              <AlertTriangle className="w-3 h-3" />
              Audio expired
            </span>
          )}
        </div>

        <Link href={`/patient/voice-messages/${item.id}`}>
          <Button variant="ghost" className="justify-between w-full">
            View details
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}

