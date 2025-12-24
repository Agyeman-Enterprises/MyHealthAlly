'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store/auth-store';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/solopractice-client';
import { format } from 'date-fns';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function MessagesPage() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, router]);

  const { data: threads, isLoading } = useQuery({
    queryKey: ['threads'],
    queryFn: async () => {
      // Try Supabase first, fallback to SoloPractice API
      try {
        const { data: { user } } = await (await import('@/lib/supabase/client')).supabase.auth.getUser();
        if (!user) return [];

        const { data: userRecord } = await (await import('@/lib/supabase/client')).supabase
          .from('users')
          .select('id, patients(id)')
          .eq('supabase_auth_id', user.id)
          .single();

        if (!userRecord || !userRecord.patients) return [];

        const patientId = (userRecord.patients as any).id;

        const { data, error } = await (await import('@/lib/supabase/client')).supabase
          .from('message_threads')
          .select('*')
          .eq('patient_id', patientId)
          .order('last_message_at', { ascending: false });

        if (error) throw error;
        if (data && data.length > 0) {
          return data.map((thread: any) => ({
            id: thread.id,
            patient_id: thread.patient_id,
            subject: thread.subject,
            last_message_at: thread.last_message_at,
            created_at: thread.created_at,
          }));
        }
      } catch (e) {
        console.log('Supabase query failed, trying SoloPractice API...', e);
      }

      // Fallback to SoloPractice API
      return apiClient.getThreads();
    },
    enabled: isAuthenticated,
  });

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50/30 pb-20 md:pb-8">
      <Header title="Messages" showBack />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
        {/* Header Actions */}
        <div className="flex justify-end mb-6">
          <Link href="/messages/new">
            <Button variant="primary" size="md">
              <svg className="w-5 h-5 mr-2 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Message
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-200 border-t-primary-600 mb-4"></div>
            <p className="text-gray-500">Loading messages...</p>
          </div>
        ) : threads && threads.length > 0 ? (
          <div className="space-y-4">
            {threads.map((thread, index) => (
              <Link
                key={thread.id}
                href={`/messages/${thread.id}`}
                className="block animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <Card hover className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center flex-shrink-0">
                          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold text-gray-900 truncate">
                            {thread.subject || 'Message Thread'}
                          </h3>
                          {thread.last_message_at && (
                            <p className="text-sm text-gray-500 mt-1">
                              {format(new Date(thread.last_message_at), 'MMM d, yyyy • h:mm a')}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    <svg className="w-5 h-5 text-gray-400 ml-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <Card variant="elevated" className="text-center py-16">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No messages yet</h3>
            <p className="text-gray-500 mb-6">Start a conversation with your care team</p>
            <Link href="/messages/new">
              <Button variant="primary" size="md">
                Send your first message
              </Button>
            </Link>
          </Card>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
