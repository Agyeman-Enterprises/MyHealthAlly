'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useRequireAuth } from '@/lib/auth/use-require-auth';
import { useAuthStore } from '@/lib/store/auth-store';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { apiClient, type MessageThread } from '@/lib/api/solopractice-client';
import { syncAuthTokensToApiClient } from '@/lib/api/message-helpers';
import { SoloPracticeApiError } from '@/lib/api/solopractice-client';
import { RequirePractice } from '@/components/RequirePractice';

interface Message {
  id: string;
  threadId: string;
  subject: string;
  preview: string;
  from: string;
  date: string;
  read: boolean;
  urgent: boolean;
}

export default function MessagesPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useRequireAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadMessages = async () => {
      try {
        syncAuthTokensToApiClient();
        const threads = await apiClient.getThreads();
        
        if (!threads || threads.length === 0) {
          setMessages([]);
          setIsLoading(false);
          return;
        }
        
        // Get patient's preferred language for translation
        const { user } = useAuthStore.getState();
        const preferredLang = user?.preferredLanguage || 'en';
        const { translateText } = await import('@/lib/utils/translate');
        
        // For each thread, get the last message to show preview
        const messagePromises = threads.map(async (thread: MessageThread) => {
          try {
            const threadMessages = await apiClient.getThreadMessages(thread.id);
            const lastMessage = threadMessages[threadMessages.length - 1];
            
            // Translate message preview from English to patient's preferred language
            let preview = lastMessage?.content?.substring(0, 100) || 'No messages yet';
            const isFromPatient = lastMessage?.sender_id === user?.id;
            
            if (!isFromPatient && preview !== 'No messages yet' && preferredLang !== 'en') {
              const { translatedText } = await translateText(preview, preferredLang);
              preview = translatedText || preview;
            }
            
            // Translate subject if needed
            let displaySubject = thread.subject || 'No subject';
            if (displaySubject !== 'No subject' && preferredLang !== 'en') {
              const { translatedText: translatedSubject } = await translateText(displaySubject, preferredLang);
              displaySubject = translatedSubject || displaySubject;
            }
            
            return {
              id: thread.id,
              threadId: thread.id,
              subject: displaySubject,
              preview: preview,
              from: isFromPatient ? 'You' : 'Care Team',
              date: lastMessage?.created_at || thread.created_at,
              read: lastMessage?.read || false,
              urgent: false,
            };
          } catch (err) {
            console.error(`Error loading messages for thread ${thread.id}:`, err);
            return {
              id: thread.id,
              threadId: thread.id,
              subject: thread.subject || 'No subject',
              preview: 'Error loading messages',
              from: 'Care Team',
              date: thread.created_at,
              read: false,
              urgent: false,
            };
          }
        });
        
        const loadedMessages = await Promise.all(messagePromises);
        setMessages(loadedMessages);
        setIsLoading(false);
      } catch (err) {
        console.error('Error loading message threads:', err);
        setError('Failed to load messages. Please try again.');
        setIsLoading(false);
        
        if (err instanceof SoloPracticeApiError && err.code === 401) {
          router.push('/auth/login');
        }
      }
    };
    
    if (isAuthenticated) {
      loadMessages();
    }
  }, [isAuthenticated, router]);

  if (authLoading) {
    return null;
  }

  const hasMessages = messages.length > 0;

  function MessagesPageInner() {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-sky-50 pb-20 md:pb-8">
      <Header />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-navy-600">Messages</h1>
            <p className="text-gray-600">Communicate with your care team</p>
          </div>
          {hasMessages && (
            <Button variant="primary" onClick={() => router.push('/messages/new')}>
              + New Message
            </Button>
          )}
        </div>

        {error && (
          <Card className="mb-6 bg-amber-50 border-amber-200">
            <p className="text-amber-800 text-sm">{error}</p>
          </Card>
        )}

        {isLoading && (
          <Card className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-primary-300 border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-gray-500">Loading messages...</p>
          </Card>
        )}

        {!isLoading && hasMessages && (
          <div className="space-y-3">
            {messages.map((msg) => (
              <Card
                key={msg.id}
                hover
                className={`cursor-pointer ${!msg.read ? 'border-l-4 border-l-primary-500' : ''}`}
                onClick={() => router.push(`/messages/${msg.threadId}`)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {msg.urgent && <span className="text-xs px-2 py-0.5 bg-red-100 text-red-700 rounded-full">Urgent</span>}
                      {!msg.read && <span className="w-2 h-2 bg-primary-500 rounded-full" />}
                      <h3 className={`font-semibold text-navy-600 ${!msg.read ? '' : 'font-normal'}`}>{msg.subject}</h3>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">{msg.preview}</p>
                    <p className="text-xs text-gray-500 mt-2">From: {msg.from} • {new Date(msg.date).toLocaleDateString()}</p>
                  </div>
                  <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Card>
            ))}
          </div>
        )}

        {!isLoading && !hasMessages && (
          <Card className="text-center py-12">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-navy-600 mb-2">No messages yet</h3>
            <p className="text-gray-600 mb-6">Start a conversation with your care team</p>
            <Button variant="primary" onClick={() => router.push('/messages/new')}>
              Send your first message
            </Button>
          </Card>
        )}

        <Card className="mt-6 bg-primary-50 border-primary-200">
          <h3 className="font-semibold text-navy-600 mb-2">💡 About Secure Messaging</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Messages are typically answered within 24-48 hours</li>
            <li>• For urgent matters, please call our office at <a href="tel:+16715550123" className="text-primary-600 hover:underline">(671) 555-0123</a></li>
            <li>• For emergencies, call <a href="tel:911" className="text-red-600 font-semibold hover:underline">911</a></li>
          </ul>
        </Card>
      </main>

      <BottomNav />
    </div>
    );
  }

  return (
    <RequirePractice featureName="Messages">
      <MessagesPageInner />
    </RequirePractice>
  );
}
