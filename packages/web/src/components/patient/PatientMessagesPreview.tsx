'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { fetchAPI } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { MessageSquareText, Bot } from 'lucide-react';
import Link from 'next/link';

type Props = {
  maxThreads?: number;
};

export function PatientMessagesPreview({ maxThreads = 2 }: Props) {
  const { patient, loading: authLoading } = useAuth();
  const [threads, setThreads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!patient?.id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    fetchAPI('/messaging/threads')
      .then((data) => {
        setThreads(data.slice(0, maxThreads));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [patient?.id, maxThreads]);

  if (authLoading || loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[1, 2].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Messages</CardTitle>
      </CardHeader>
      <CardContent>
        {threads.length > 0 ? (
          <div className="space-y-2">
            {threads.map((thread) => (
              <Link
                key={thread.id}
                href="/patient/messages"
                className="flex items-center gap-3 p-3 bg-myh-surfaceSoft rounded-lg border border-myh-border hover:border-myh-primary transition-colors"
              >
                <div className="w-10 h-10 bg-myh-primarySoft rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot className="w-5 h-5 text-myh-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-myh-text truncate">
                    {thread.subject || 'MyHealthAlly Assistant'}
                  </p>
                  {thread.lastMessageAt && (
                    <p className="text-xs text-myh-textSoft">
                      {new Date(thread.lastMessageAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-4">
            <MessageSquareText className="w-8 h-8 mx-auto mb-2 text-myh-border" />
            <p className="text-sm text-myh-textSoft">No messages</p>
          </div>
        )}
        {threads.length > 0 && (
          <Link
            href="/patient/messages"
            className="block mt-3 text-sm text-myh-primary text-center hover:underline"
          >
            View all messages →
          </Link>
        )}
      </CardContent>
    </Card>
  );
}

