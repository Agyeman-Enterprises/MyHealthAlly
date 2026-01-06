'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth-store';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { VoiceInput } from '@/components/voice/VoiceInput';
import { RequirePractice } from '@/components/RequirePractice';
import { apiClient, type MessageResponse, type MessageThread } from '@/lib/api/solopractice-client';
import { sendMessageToSolopractice, handleMessageStatus, syncAuthTokensToApiClient } from '@/lib/api/message-helpers';
import { SoloPracticeApiError } from '@/lib/api/solopractice-client';
import { getPrimaryClinician } from '@/lib/supabase/queries';

interface Message {
  id: string;
  from: string;
  date: string;
  content: string;
  sender_id?: string;
  read?: boolean;
}

export default function MessageDetailPage() {
  const router = useRouter();
  const params = useParams();
  const threadId = (params as Record<string, string>)['id'] || '';
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { patientId } = useAuthStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [threadInfo, setThreadInfo] = useState<{ subject?: string; recipientName?: string } | null>(null);

  // Load messages from Solopractice
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    if (!threadId) return;
    
    const loadMessages = async () => {
      try {
        syncAuthTokensToApiClient();
        
        // Load thread info to get subject
        const threads = await apiClient.getThreads();
        const thread = threads.find((t: MessageThread) => {
          const threadWithId = t as unknown as Record<string, unknown>;
          return threadWithId['id'] === threadId;
        });
        
        // Load primary clinician for display
        let recipientName = 'Care Team';
        if (patientId) {
          try {
            const primaryClinician = await getPrimaryClinician(patientId);
            if (primaryClinician) {
              recipientName = primaryClinician.displayName;
            }
          } catch {
            // Fallback to Care Team if clinician lookup fails
          }
        }
        
        const threadSubject = thread?.subject;
        setThreadInfo({
          ...(threadSubject ? { subject: threadSubject } : {}),
          recipientName,
        });
        
        const threadMessages = await apiClient.getThreadMessages(threadId);
        
        // Get patient's preferred language for translation
        const { user } = useAuthStore.getState();
        const preferredLang = user?.preferredLanguage || 'en';
        
        // Transform API messages to display format
        // Messages from Solopractice are in English, translate to patient's preferred language
        const transformedPromises = threadMessages.map(async (msg: MessageResponse) => {
          // Only translate messages from care team (not patient's own messages)
          const isFromPatient = msg.sender_id === user?.id;
          let displayContent = msg.content;
          
          if (!isFromPatient && preferredLang !== 'en') {
            // Translate care team messages from English to patient's preferred language
            const { translateText } = await import('@/lib/utils/translate');
            const { translatedText } = await translateText(msg.content, preferredLang);
            displayContent = translatedText || msg.content;
          }
          
          return {
            id: msg.id,
            from: isFromPatient ? 'You' : 'Care Team',
            date: msg.created_at,
            content: displayContent,
            sender_id: msg.sender_id,
            read: msg.read,
          };
        });
        
        const transformed = await Promise.all(transformedPromises);
        setMessages(transformed);
        setLoading(false);
      } catch (err) {
        console.error('Error loading messages:', err);
        setError('Failed to load messages. Please try again.');
        setLoading(false);
        
        // Fallback to mock data for development
        setMessages([
          { id: '1', from: 'You', date: '2024-12-24T10:00:00', content: 'Hi, I have a question about my recent lab results.' },
          { id: '2', from: 'Care Team', date: '2024-12-24T14:30:00', content: 'Thank you for reaching out. We will review your results and get back to you.' },
        ]);
      }
    };
    
    if (isAuthenticated && threadId) {
      loadMessages();
    }
  }, [isAuthenticated, threadId, router, patientId]);

  if (!isAuthenticated) { return null; }

  function MessageDetailPageInner() {
    const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reply.trim()) return;
    setSending(true);
    try {
      // Translate reply to English before sending to Solopractice
      // Even if patient types/spoke in foreign language, Solopractice receives it in English
      const { translateText } = await import('@/lib/utils/translate');
      const { translatedText: englishReply, detectedLang: lang } = await translateText(reply, 'en');
      
      // Send reply to Solopractice in English (replies use existing thread, no recipient needed)
      const response = await sendMessageToSolopractice(
        englishReply, // Send translated English version
        undefined, // subject
        threadId,
        lang, // Keep detected language for reference
        undefined // recipient - not needed for replies, thread already has routing
      );
      
      // Handle response status
      const status = handleMessageStatus(response);
      
      if (status.success) {
        if (status.action === 'show_deferred') {
          alert(`Reply received! ${status.message}`);
        } else {
          alert(status.message);
        }
        setReply('');
        
        // Reload messages to show the new reply (with translation)
        const { user } = useAuthStore.getState();
        const preferredLang = user?.preferredLanguage || 'en';
        const threadMessages = await apiClient.getThreadMessages(threadId);
        
        const transformedPromises = threadMessages.map(async (msg: MessageResponse) => {
          const isFromPatient = msg.sender_id === user?.id;
          let displayContent = msg.content;
          
          if (!isFromPatient && preferredLang !== 'en') {
            const { translateText } = await import('@/lib/utils/translate');
            const { translatedText } = await translateText(msg.content, preferredLang);
            displayContent = translatedText || msg.content;
          }
          
          return {
            id: msg.id,
            from: isFromPatient ? 'You' : 'Care Team',
            date: msg.created_at,
            content: displayContent,
            sender_id: msg.sender_id,
            read: msg.read,
          };
        });
        
        const transformed = await Promise.all(transformedPromises);
        setMessages(transformed);
      } else {
        if (status.action === 'redirect_emergency') {
          const proceed = confirm(`${status.message}\n\nWould you like to call 911?`);
          if (proceed) {
            window.location.href = 'tel:911';
          }
        } else {
          alert(status.message);
        }
      }
    } catch (err) {
      console.error('Error sending reply:', err);
      if (err instanceof SoloPracticeApiError) {
        if (err.code === 401) {
          alert('Your session has expired. Please log in again.');
          router.push('/auth/login');
        } else if (err.code === 403) {
          alert('Message was blocked. Please call the office for urgent matters.');
        } else {
          alert(`Error: ${err.message}`);
        }
      } else {
        alert('Failed to send reply. Please try again.');
      }
    } finally {
      setSending(false);
    }
  };

    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-sky-50 pb-20 md:pb-8">
        <Header />
        <main className="max-w-2xl mx-auto px-4 py-8">
        <Card className="mb-4">
          <h1 className="text-lg font-bold text-navy-600 mb-1">{threadInfo?.subject || 'Message Thread'}</h1>
          <p className="text-sm text-gray-500">Conversation with {threadInfo?.recipientName || 'Care Team'}</p>
        </Card>

        {loading && (
          <Card className="text-center py-12 mb-6">
            <div className="animate-spin w-8 h-8 border-4 border-primary-300 border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-gray-500">Loading messages...</p>
          </Card>
        )}

        {error && (
          <Card className="mb-6 bg-amber-50 border-amber-200">
            <p className="text-amber-800 text-sm">{error}</p>
          </Card>
        )}

        {!loading && (
          <div className="space-y-4 mb-6">
            {messages.length === 0 ? (
              <Card className="text-center py-12">
                <p className="text-gray-500">No messages in this thread.</p>
              </Card>
            ) : (
              messages.map((msg) => (
                <Card key={msg.id} className={msg.from === 'You' ? 'ml-8 bg-primary-50 border-primary-200' : 'mr-8'}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-navy-600">{msg.from}</span>
                    <span className="text-xs text-gray-500">{new Date(msg.date).toLocaleString()}</span>
                  </div>
                  <p className="text-gray-700">{msg.content}</p>
                </Card>
              ))
            )}
          </div>
        )}

        <Card>
          <form onSubmit={handleReply}>
            <div className="relative">
              <textarea value={reply} onChange={(e) => setReply(e.target.value)} rows={3} placeholder="Type your reply..." className="w-full px-4 py-3 pr-12 pb-12 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-400 resize-none mb-3" />
              <div className="absolute right-2 bottom-4">
                <VoiceInput onTranscript={(text) => setReply(reply ? `${reply} ${text}` : text)} size="sm" />
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button type="button" variant="ghost" onClick={() => router.push('/messages')}>Back to Messages</Button>
              <Button type="submit" variant="primary" isLoading={sending} disabled={!reply.trim()}>Send Reply</Button>
            </div>
          </form>
        </Card>
        </main>
        <BottomNav />
      </div>
    );
  }

  return (
    <RequirePractice featureName="Messages">
      <MessageDetailPageInner />
    </RequirePractice>
  );
}
