'use client';

import { useEffect, useState } from 'react';
import { PageContainer } from '@/components/layout/PageContainer';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { fetchAPI } from '@/lib/utils';
import { formatTime, formatRelativeTime } from '@/utils/date';
import { Send, Bot, MessageSquare } from 'lucide-react';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

interface Message {
  id: string;
  content: string;
  from: { name: string; role: string };
  to: { name: string; role: string };
  createdAt: string;
}

export default function PatientMessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [threads, setThreads] = useState<any[]>([]);
  const [selectedThread, setSelectedThread] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    loadThreads();
  }, []);

  useEffect(() => {
    if (selectedThread) {
      loadMessages(selectedThread);
    }
  }, [selectedThread]);

  const loadThreads = async () => {
    try {
      const data = await fetchAPI('/patients/me/messages/threads');
      setThreads(data || []);
      if (data && data.length > 0 && !selectedThread) {
        setSelectedThread(data[0].id);
      }
    } catch (error) {
      console.error('Failed to load threads:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (threadId: string) => {
    try {
      const data = await fetchAPI(`/patients/me/messages/threads/${threadId}`);
      setMessages(data?.messages || []);
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || !selectedThread) return;
    setSending(true);
    try {
      await fetchAPI(`/patients/me/messages`, {
        method: 'POST',
        body: JSON.stringify({
          threadId: selectedThread,
          content: input,
        }),
      });
      setInput('');
      await loadMessages(selectedThread);
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setSending(false);
    }
  };

  const currentThread = threads.find(t => t.id === selectedThread);

  if (loading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-body" style={{ color: 'var(--color-textSecondary)' }}>
            Loading...
          </div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="py-6">
        <div className="mb-6">
          <h1 className="text-h1 mb-2">Messages</h1>
          <p className="text-body" style={{ color: 'var(--color-textSecondary)' }}>
            Communicate with your care team
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
          {/* Threads List */}
          <div className="lg:col-span-1">
            <Card className="h-full flex flex-col">
              <CardContent className="p-4 flex-1 overflow-y-auto">
                <div className="space-y-2">
                  {threads.map((thread) => (
                    <div
                      key={thread.id}
                      onClick={() => setSelectedThread(thread.id)}
                      className={`p-3 border-radius cursor-pointer transition-colors ${
                        selectedThread === thread.id ? 'bg-primary/10' : 'hover:bg-background'
                      }`}
                      style={{
                        borderRadius: 'var(--radius)',
                        backgroundColor: selectedThread === thread.id ? 'var(--color-primary)' + '10' : 'transparent',
                      }}
                    >
                      <div className="flex items-start justify-between mb-1">
                        <p className="text-body font-medium" style={{ color: 'var(--color-textPrimary)' }}>
                          {thread.participants?.find((p: any) => p.role !== 'PATIENT')?.name || 'Care Team'}
                        </p>
                        {thread.unreadCount > 0 && (
                          <span
                            className="px-2 py-0.5 text-caption border-radius"
                            style={{
                              backgroundColor: 'var(--color-primary)',
                              color: '#FFFFFF',
                              borderRadius: 'var(--radius)',
                            }}
                          >
                            {thread.unreadCount}
                          </span>
                        )}
                      </div>
                      {thread.lastMessage && (
                        <p className="text-caption truncate" style={{ color: 'var(--color-textSecondary)' }}>
                          {thread.lastMessage.content}
                        </p>
                      )}
                      <p className="text-caption mt-1" style={{ color: 'var(--color-textSecondary)' }}>
                        {thread.lastMessage ? formatRelativeTime(thread.lastMessage.createdAt) : ''}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Messages */}
          <div className="lg:col-span-2 flex flex-col">
            <Card className="flex-1 flex flex-col">
              {currentThread ? (
                <>
                  <CardContent className="p-4 border-b flex items-center gap-3" style={{ borderColor: 'var(--color-border)' }}>
                    <MessageSquare className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
                    <div>
                      <p className="text-body font-medium" style={{ color: 'var(--color-textPrimary)' }}>
                        {currentThread.participants?.find((p: any) => p.role !== 'PATIENT')?.name || 'Care Team'}
                      </p>
                      <p className="text-caption" style={{ color: 'var(--color-textSecondary)' }}>
                        {currentThread.participants?.find((p: any) => p.role !== 'PATIENT')?.role || 'Provider'}
                      </p>
                    </div>
                  </CardContent>
                  <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((msg) => {
                      const isPatient = msg.from.role === 'PATIENT';
                      return (
                        <div
                          key={msg.id}
                          className={`flex ${isPatient ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[80%] p-3 border-radius`}
                            style={{
                              backgroundColor: isPatient ? 'var(--color-primary)' : 'var(--color-background)',
                              color: isPatient ? '#FFFFFF' : 'var(--color-textPrimary)',
                              borderRadius: 'var(--radius)',
                            }}
                          >
                            <p className="text-body">{msg.content}</p>
                            <p
                              className="text-caption mt-1"
                              style={{ color: isPatient ? 'rgba(255,255,255,0.7)' : 'var(--color-textSecondary)' }}
                            >
                              {formatTime(msg.createdAt)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </CardContent>
                  <CardContent className="p-4 border-t" style={{ borderColor: 'var(--color-border)' }}>
                    <div className="flex gap-2">
                      <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                        placeholder="Type a message..."
                        className="flex-1"
                      />
                      <Button onClick={sendMessage} disabled={!input.trim() || sending}>
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </>
              ) : (
                <CardContent className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <Bot className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--color-textSecondary)' }} />
                    <p className="text-body" style={{ color: 'var(--color-textSecondary)' }}>
                      Select a conversation to start messaging
                    </p>
                  </div>
                </CardContent>
              )}
            </Card>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
