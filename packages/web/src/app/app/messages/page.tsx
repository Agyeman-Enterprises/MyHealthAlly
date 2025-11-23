'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { GlowCard } from '@/components/ui/glow-card';
import { PrimaryButton } from '@/components/ui/primary-button';
import FloatingNav from '@/components/patient/FloatingNav';
import { useAuth } from '@/contexts/AuthContext';
import { fetchAPI } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { Send, Bot, MessageSquareText, User } from 'lucide-react';

export default function AppMessagesPage() {
  const { patient, user, loading: authLoading } = useAuth();
  const [threads, setThreads] = useState<any[]>([]);
  const [selectedThread, setSelectedThread] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const loadThreads = useCallback(async () => {
    if (!patient?.id) return;
    setLoading(true);
    try {
      const data = await fetchAPI('/messaging/threads');
      setThreads(data);
      if (data.length > 0) {
        setSelectedThread(data[0]);
      }
    } catch (error) {
      console.error('Failed to load threads:', error);
    } finally {
      setLoading(false);
    }
  }, [patient?.id]);

  const loadMessages = useCallback(async (threadId: string) => {
    try {
      const thread = await fetchAPI(`/messaging/threads/${threadId}`);
      setMessages(thread.messages || []);
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && patient) {
      loadThreads();
    }
  }, [patient, authLoading, loadThreads]);

  useEffect(() => {
    if (selectedThread) {
      loadMessages(selectedThread.id);
    }
  }, [selectedThread, loadMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || !selectedThread || !user) return;
    setSending(true);
    const content = input;
    setInput('');

    try {
      await fetchAPI(`/messaging/threads/${selectedThread.id}/messages`, {
        method: 'POST',
        body: JSON.stringify({ content }),
      });
      loadMessages(selectedThread.id);
    } catch (error) {
      console.error('Failed to send message:', error);
      setInput(content); // Restore on error
    } finally {
      setSending(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-myh-bg pb-24 p-6 flex flex-col">
        <Skeleton className="h-8 w-48 mb-4" />
        <Skeleton className="h-16 w-full mb-4" />
        <div className="flex-1 space-y-4">
          <Skeleton className="h-20 w-3/4" />
          <Skeleton className="h-20 w-full" />
        </div>
        <FloatingNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-myh-bg pb-24 flex flex-col">
      <div className="max-w-4xl mx-auto w-full p-6 space-y-4 flex-1 flex flex-col">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-myh-text">Messages</h1>
          <div className="flex items-center gap-2 text-sm text-myh-textSoft">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Secure connection</span>
          </div>
        </div>

        {selectedThread ? (
          <>
            <GlowCard className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-myh-primarySoft rounded-full flex items-center justify-center">
                  <Bot className="w-5 h-5 text-myh-primary" />
                </div>
                <div>
                  <p className="font-medium text-myh-text">
                    {selectedThread.subject || 'MyHealthAlly Assistant'}
                  </p>
                  <p className="text-xs text-myh-textSoft">Online</p>
                </div>
              </div>
            </GlowCard>

            <div className="flex-1 space-y-4 overflow-y-auto">
              {messages.length > 0 ? (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.senderId === user?.id ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-xl p-4 ${
                        msg.senderId === user?.id
                          ? 'bg-myh-primary text-white'
                          : 'bg-myh-surface border border-myh-border text-myh-text'
                      }`}
                    >
                      <p className="text-sm">{msg.content}</p>
                      <p className={`text-xs mt-2 ${msg.senderId === user?.id ? 'text-white/70' : 'text-myh-textSoft'}`}>
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-myh-textSoft">
                  <MessageSquareText className="w-12 h-12 mx-auto mb-4 text-myh-border" />
                  <p>No messages yet</p>
                  <p className="text-sm mt-2">Start a conversation with your care team</p>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Ask a health question…"
                className="flex-1 bg-myh-surface border border-myh-border rounded-xl px-4 py-3 text-myh-text placeholder:text-myh-textSoft focus:outline-none focus:ring-2 focus:ring-myh-primary"
                disabled={sending}
              />
              <PrimaryButton onClick={sendMessage} className="px-6" disabled={sending || !input.trim()}>
                {sending ? 'Sending...' : <Send className="w-5 h-5" />}
              </PrimaryButton>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center text-myh-textSoft">
            <MessageSquareText className="w-16 h-16 mb-4 text-myh-border" />
            <p className="text-lg font-medium">No active message threads</p>
            <p className="text-sm">Your care team will start a conversation here when needed.</p>
          </div>
        )}
      </div>

      <FloatingNav />
    </div>
  );
}

