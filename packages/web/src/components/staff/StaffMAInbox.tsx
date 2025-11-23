'use client';

import { useEffect, useState } from 'react';
import { fetchAPI } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { MessageSquare, User, Clock, AlertCircle } from 'lucide-react';

export function StaffMAInbox() {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    try {
      // TODO: Create endpoint for MA inbox
      const threads = await fetchAPI('/messaging/threads');
      setMessages(threads.slice(0, 5));
    } catch (error) {
      console.error('Failed to load messages:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-48 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>MA Inbox</CardTitle>
      </CardHeader>
      <CardContent>
        {messages.length > 0 ? (
          <div className="space-y-2">
            {messages.map((thread) => (
              <div
                key={thread.id}
                className="p-3 border border-myh-border rounded-lg bg-myh-surface hover:border-myh-primary transition-colors cursor-pointer"
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-myh-primarySoft rounded-full flex items-center justify-center flex-shrink-0">
                    <MessageSquare className="w-4 h-4 text-myh-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-myh-text truncate">
                      {thread.subject || 'Message Thread'}
                    </p>
                    {thread.lastMessageAt && (
                      <div className="flex items-center gap-1 mt-1">
                        <Clock className="w-3 h-3 text-myh-textSoft" />
                        <span className="text-xs text-myh-textSoft">
                          {new Date(thread.lastMessageAt).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-myh-textSoft">
            <MessageSquare className="w-10 h-10 mx-auto mb-2 text-myh-border" />
            <p className="text-sm">No messages</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

