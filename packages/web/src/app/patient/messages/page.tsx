'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { PageContainer } from '@/components/layout/PageContainer';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { fetchAPI } from '@/lib/utils';
import { formatTime, formatRelativeTime } from '@/utils/date';
import { Send, Bot, MessageSquare, Mic, MicOff, AlertTriangle } from 'lucide-react';
import { useVoiceCapture } from '@/hooks/useVoiceCapture';
import { processVoiceMessage } from '@/services/patient/voice-actions';
import { LanguagePromptModal } from '@/components/patient/LanguagePromptModal';
import { getVoiceMessages, type VoiceMessageSummary } from '@/services/patient/voice-messages';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

interface Message {
  id: string;
  content: string;
  from: { name: string; role: string };
  to: { name: string; role: string };
  createdAt: string;
  // Multilingual fields
  originalLanguage?: string;
  patientLanguageUsedForReply?: string;
  translatedTitle?: string;
  translatedBody?: string;
}

export default function PatientMessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [threads, setThreads] = useState<any[]>([]);
  const [selectedThread, setSelectedThread] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [languagePrompt, setLanguagePrompt] = useState<{
    detectedLanguage: string;
    languageName: string;
  } | null>(null);
  const { isListening, transcript, error: voiceError, startListening, stopListening } = useVoiceCapture();
  const [voiceMessages, setVoiceMessages] = useState<VoiceMessageSummary[]>([]);
  const [voiceLoading, setVoiceLoading] = useState(true);

  useEffect(() => {
    loadThreads();
    loadVoiceHistory();
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

  const loadVoiceHistory = async () => {
    try {
      const data = await getVoiceMessages();
      setVoiceMessages(data.slice(0, 3));
    } catch (error) {
      console.error('Failed to load voice history:', error);
    } finally {
      setVoiceLoading(false);
    }
  };

  const sendMessage = async (messageText?: string) => {
    const textToSend = messageText || input;
    if (!textToSend.trim() || !selectedThread) return;
    setSending(true);
    try {
      // Process voice message if it's from voice input
      const isVoiceMessage = messageText !== undefined;
      if (isVoiceMessage) {
        await processVoiceMessage(textToSend);
        setInput('');
        await loadMessages(selectedThread);
        await loadVoiceHistory();
        return;
      }

      await fetchAPI(`/patients/me/messages`, {
        method: 'POST',
        body: JSON.stringify({
          threadId: selectedThread,
          content: textToSend,
          source: isVoiceMessage ? 'voice' : 'text',
        }),
      });
      setInput('');
      await loadMessages(selectedThread);
      
      // Check if we should prompt for language preference
      try {
        const prompt = await fetchAPI('/patients/me/language/prompt');
        if (prompt && prompt.shouldPrompt) {
          setLanguagePrompt({
            detectedLanguage: prompt.detectedLanguage,
            languageName: prompt.languageName,
          });
        }
      } catch (error) {
        // Silently fail - language prompt is not critical
        console.error('Failed to check language prompt:', error);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setSending(false);
    }
  };

  const handleVoiceClick = async () => {
    if (isListening) {
      const result = await stopListening();
      if (result && result.transcript) {
        setInput(result.transcript);
        // Auto-send voice message
        await sendMessage(result.transcript);
      }
    } else {
      await startListening();
    }
  };

  // Update input when transcript changes
  useEffect(() => {
    if (transcript && !isListening) {
      setInput(transcript);
    }
  }, [transcript, isListening]);

  const currentThread = threads.find(t => t.id === selectedThread);

  if (loading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-body text-slate-600">
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
          <p className="text-body text-slate-600">
            Communicate with your care team
          </p>
        </div>

        <VoiceHistoryPreview items={voiceMessages} loading={voiceLoading} />

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
                      className={`p-3 rounded-2xl cursor-pointer transition-colors ${
                        selectedThread === thread.id ? 'bg-teal-50' : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-1">
                        <p className="text-body font-medium text-slate-900">
                          {thread.participants?.find((p: any) => p.role !== 'PATIENT')?.name || 'Care Team'}
                        </p>
                        {thread.unreadCount > 0 && (
                          <span
                            className="px-2 py-0.5 text-caption rounded-lg bg-teal-600 text-white"
                          >
                            {thread.unreadCount}
                          </span>
                        )}
                      </div>
                      {thread.lastMessage && (
                        <p className="text-caption truncate text-slate-600">
                          {thread.lastMessage.content}
                        </p>
                      )}
                      <p className="text-caption mt-1 text-slate-600">
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
                  <CardContent className="p-4 border-b border-slate-200 flex items-center gap-3">
                    <MessageSquare className="w-5 h-5 text-teal-600" />
                    <div>
                      <p className="text-body font-medium text-slate-900">
                        {currentThread.participants?.find((p: any) => p.role !== 'PATIENT')?.name || 'Care Team'}
                      </p>
                      <p className="text-caption text-slate-600">
                        {currentThread.participants?.find((p: any) => p.role !== 'PATIENT')?.role || 'Provider'}
                      </p>
                    </div>
                  </CardContent>
                  <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((msg) => {
                      const isPatient = msg.from.role === 'PATIENT';
                      const bubbleClasses = isPatient
                        ? 'bg-teal-600 text-white'
                        : 'bg-slate-50 text-slate-900';
                      const metaClasses = isPatient ? 'text-white/70' : 'text-slate-600';
                      return (
                        <div
                          key={msg.id}
                          className={`flex ${isPatient ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[80%] p-3 rounded-2xl ${bubbleClasses}`}
                          >
                            <p className="text-body">{msg.content}</p>
                            {/* Show language indicator for assistant messages */}
                            {!isPatient && msg.patientLanguageUsedForReply && msg.patientLanguageUsedForReply !== 'en' && (
                              <p className={`text-caption mt-1 italic ${metaClasses}`}>
                                MyHealthAlly Assistant (automated guidance, translated to {msg.patientLanguageUsedForReply.toUpperCase()})
                              </p>
                            )}
                            <p className={`text-caption mt-1 ${metaClasses}`}>
                              {formatTime(msg.createdAt)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </CardContent>
                  <CardContent className="p-4 border-t border-slate-200">
                    {voiceError && (
                      <div className="mb-2 p-2 rounded-lg text-caption bg-red-50 border border-red-200 text-red-600">
                        {voiceError}
                      </div>
                    )}
                    <div className="flex gap-2">
                      <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                        placeholder={isListening ? 'Listening...' : 'Type a message or tap mic to speak...'}
                        className="flex-1"
                        disabled={isListening}
                      />
                      <Button
                        variant="outline"
                        onClick={handleVoiceClick}
                        disabled={sending}
                        className={isListening ? 'bg-red-500 text-white hover:bg-red-600' : 'text-slate-900'}
                      >
                        {isListening ? (
                          <MicOff className="w-4 h-4" />
                        ) : (
                          <Mic className="w-4 h-4" />
                        )}
                      </Button>
                      <Button onClick={() => sendMessage()} disabled={!input.trim() || sending || isListening}>
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                    {isListening && (
                      <div className="mt-2 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full animate-pulse bg-red-500" />
                        <span className="text-caption text-slate-600">
                          Listening... {transcript && `"${transcript}"`}
                        </span>
                      </div>
                    )}
                  </CardContent>
                </>
              ) : (
                <CardContent className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <Bot className="w-12 h-12 mx-auto mb-4 text-slate-400" />
                    <p className="text-body text-slate-600">
                      Select a conversation to start messaging
                    </p>
                  </div>
                </CardContent>
              )}
            </Card>
          </div>
        </div>
      </div>

      {/* Language Prompt Modal */}
      {languagePrompt && (
        <LanguagePromptModal
          open={!!languagePrompt}
          detectedLanguage={languagePrompt.detectedLanguage}
          languageName={languagePrompt.languageName}
          onClose={() => setLanguagePrompt(null)}
          onLanguageSet={() => {
            setLanguagePrompt(null);
            // Optionally reload threads to reflect language change
          }}
        />
      )}
    </PageContainer>
  );
}

function VoiceHistoryPreview({
  items,
  loading,
}: {
  items: VoiceMessageSummary[];
  loading: boolean;
}) {
  return (
    <Card className="mb-6">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-caption uppercase text-slate-600">Voice history</p>
            <p className="text-body text-slate-900">Recent recorded messages</p>
          </div>
          <Link href="/patient/voice-messages">
            <Button variant="ghost" size="sm">
              View all
            </Button>
          </Link>
        </div>
        {loading ? (
          <p className="text-sm text-slate-600">Loading voice messages…</p>
        ) : items.length === 0 ? (
          <p className="text-sm text-slate-600">No voice recordings yet.</p>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <Link key={item.id} href={`/patient/voice-messages/${item.id}`}>
                <div className="rounded-lg border border-slate-200 px-3 py-2 transition-colors bg-transparent hover:bg-slate-50">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-slate-600">
                      {new Date(item.createdAt).toLocaleString()}
                    </span>
                    <Badge variant="outline" className="uppercase">
                      {item.severity}
                    </Badge>
                  </div>
                  <p className="text-sm line-clamp-2 text-slate-900">
                    {item.aiSummary || item.transcriptPreview}
                  </p>
                  <div className="mt-1 text-xs flex items-center gap-2 text-slate-600">
                    {item.hasAudioAvailableToPatient ? (
                      'Audio available'
                    ) : (
                      <span className="flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        Audio expired
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
