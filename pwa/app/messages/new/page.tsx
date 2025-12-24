'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth-store';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/solopractice-client';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { DisclaimerBanner } from '@/components/governance/DisclaimerBanner';
import Link from 'next/link';

export default function NewMessagePage() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const queryClient = useQueryClient();
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [messageType, setMessageType] = useState<'text' | 'voice'>('text');

  const createThreadMutation = useMutation({
    mutationFn: async ({ subject, body }: { subject: string; body: string }) => {
      // Create message thread in Supabase
      const { data: { user } } = await (await import('@/lib/supabase/client')).supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: userRecord } = await (await import('@/lib/supabase/client')).supabase
        .from('users')
        .select('id, patients(id)')
        .eq('supabase_auth_id', user.id)
        .single();

      if (!userRecord || !userRecord.patients) {
        throw new Error('Patient record not found');
      }

      const patientId = (userRecord.patients as any).id;

      // Create thread
      const { data: thread, error: threadError } = await (await import('@/lib/supabase/client')).supabase
        .from('message_threads')
        .insert({
          patient_id: patientId,
          subject: subject || null,
          status: 'open',
          priority: 'normal',
        })
        .select('id')
        .single();

      if (threadError) throw threadError;

      // Create first message
      const { data: message, error: messageError } = await (await import('@/lib/supabase/client')).supabase
        .from('messages')
        .insert({
          thread_id: thread.id,
          sender_user_id: userRecord.id,
          sender_role: 'patient',
          type: 'text',
          content: body,
        })
        .select('id')
        .single();

      if (messageError) throw messageError;

      return { threadId: thread.id };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['threads'] });
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      router.push(`/messages/${data.threadId}`);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!body.trim()) {
      alert('Please enter a message');
      return;
    }
    createThreadMutation.mutate({ subject, body });
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50/30 pb-20 md:pb-8">
      <Header title="New Message" showBack />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <DisclaimerBanner type="standard" className="mb-6" />

        <Card variant="elevated" className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message Type
              </label>
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => setMessageType('text')}
                  className={`flex-1 px-4 py-3 rounded-lg border-2 transition-all ${
                    messageType === 'text'
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-200 text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <svg className="w-5 h-5 inline mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Type Text
                </button>
                <Link
                  href="/messages/voice"
                  className="flex-1 px-4 py-3 rounded-lg border-2 border-gray-200 text-gray-700 hover:border-gray-300 transition-all text-center"
                >
                  <svg className="w-5 h-5 inline mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                  Record Voice
                </Link>
              </div>
            </div>

            <Input
              id="subject"
              name="subject"
              label="Subject (Optional)"
              type="text"
              placeholder="What is this about?"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />

            <div>
              <label htmlFor="body" className="block text-sm font-medium text-gray-700 mb-2">
                Message
              </label>
              <textarea
                id="body"
                name="body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Type your message here..."
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none transition-all"
                rows={8}
                required
              />
            </div>

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                isLoading={createThreadMutation.isPending}
                disabled={!body.trim()}
              >
                Send Message
              </Button>
            </div>
          </form>
        </Card>
      </main>

      <BottomNav />
    </div>
  );
}

