'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { fetchAPI } from '@/lib/utils';
import { Send, Paperclip, Image as ImageIcon } from 'lucide-react';

interface MessageThread {
  id: string;
  patientId: string;
  subject?: string;
  lastMessageAt?: string;
  patient?: {
    firstName?: string;
    lastName?: string;
    user?: {
      email: string;
    };
  };
  messages?: Message[];
}

interface Message {
  id: string;
  senderId: string;
  content: string;
  attachments?: Array<{
    type: string;
    url: string;
    filename: string;
    size: number;
  }>;
  read: boolean;
  readAt?: string;
  createdAt: string;
}

export default function MessagesPage() {
  const router = useRouter();
  const [threads, setThreads] = useState<MessageThread[]>([]);
  const [selectedThread, setSelectedThread] = useState<MessageThread | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    loadThreads();
  }, [router]);

  useEffect(() => {
    if (selectedThread) {
      loadMessages(selectedThread.id);
    }
  }, [selectedThread]);

  const loadThreads = async () => {
    try {
      const data = await fetchAPI('/messaging/threads');
      setThreads(data);
      if (data.length > 0 && !selectedThread) {
        setSelectedThread(data[0]);
      }
    } catch (error) {
      console.error('Failed to load threads:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (threadId: string) => {
    try {
      const thread = await fetchAPI(`/messaging/threads/${threadId}`);
      setMessages(thread.messages || []);
      setSelectedThread(thread);
      
      // Mark thread as read
      await fetchAPI(`/messaging/threads/${threadId}/read`, {
        method: 'POST',
      });
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedThread) return;

    setSending(true);
    try {
      const formData = new FormData();
      formData.append('content', newMessage);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/messaging/threads/${selectedThread.id}/messages`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: formData,
        }
      );

      if (response.ok) {
        setNewMessage('');
        await loadMessages(selectedThread.id);
        await loadThreads();
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-semibold mb-6">Messages</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
          {/* Thread List */}
          <Card className="lg:col-span-1 overflow-hidden flex flex-col">
            <CardHeader>
              <CardTitle>Conversations</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-0">
              {threads.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  No conversations yet
                </div>
              ) : (
                <div className="divide-y">
                  {threads.map((thread) => (
                    <button
                      key={thread.id}
                      onClick={() => setSelectedThread(thread)}
                      className={`w-full text-left p-4 hover:bg-accent/5 transition-colors ${
                        selectedThread?.id === thread.id ? 'bg-accent/10' : ''
                      }`}
                    >
                      <div className="font-medium">
                        {thread.patient
                          ? `${thread.patient.firstName} ${thread.patient.lastName}`
                          : thread.subject || 'Conversation'}
                      </div>
                      {thread.messages && thread.messages[0] && (
                        <div className="text-sm text-muted-foreground truncate mt-1">
                          {thread.messages[0].content}
                        </div>
                      )}
                      {thread.lastMessageAt && (
                        <div className="text-xs text-muted-foreground mt-1">
                          {new Date(thread.lastMessageAt).toLocaleDateString()}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Message Window */}
          <Card className="lg:col-span-2 flex flex-col overflow-hidden">
            {selectedThread ? (
              <>
                <CardHeader>
                  <CardTitle>
                    {selectedThread.patient
                      ? `${selectedThread.patient.firstName} ${selectedThread.patient.lastName}`
                      : selectedThread.subject || 'Conversation'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col overflow-hidden">
                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                    {messages.map((message) => {
                      const isOwn = message.senderId === localStorage.getItem('userId');
                      return (
                        <div
                          key={message.id}
                          className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[70%] rounded-lg p-3 ${
                              isOwn
                                ? 'bg-primary text-white'
                                : 'bg-muted'
                            }`}
                          >
                            <div className="text-sm">{message.content}</div>
                            {message.attachments && message.attachments.length > 0 && (
                              <div className="mt-2 space-y-2">
                                {message.attachments.map((att, idx) => (
                                  <a
                                    key={idx}
                                    href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}${att.url}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block text-xs underline"
                                  >
                                    {att.filename}
                                  </a>
                                ))}
                              </div>
                            )}
                            <div className="text-xs opacity-70 mt-1">
                              {new Date(message.createdAt).toLocaleString()}
                              {message.read && isOwn && ' ✓ Read'}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Message Input */}
                  <div className="flex gap-2">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          sendMessage();
                        }
                      }}
                      placeholder="Type a message..."
                      disabled={sending}
                    />
                    <Button
                      onClick={sendMessage}
                      disabled={!newMessage.trim() || sending}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </>
            ) : (
              <CardContent className="flex items-center justify-center h-full text-muted-foreground">
                Select a conversation to start messaging
              </CardContent>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

