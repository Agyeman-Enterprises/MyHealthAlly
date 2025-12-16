'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store/auth-store';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/solopractice-client';
import { format } from 'date-fns';

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
    queryFn: () => apiClient.getThreads(),
    enabled: isAuthenticated,
  });

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="text-primary-600 hover:text-primary-700">
                ← Back
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
            </div>
            <Link
              href="/messages/new"
              className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700"
            >
              New Message
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
          </div>
        ) : threads && threads.length > 0 ? (
          <div className="space-y-4">
            {threads.map((thread) => (
              <Link
                key={thread.id}
                href={`/messages/${thread.id}`}
                className="block bg-white rounded-lg shadow p-6 hover:shadow-md transition"
              >
                <h3 className="text-lg font-semibold text-gray-900">
                  {thread.subject || 'Message Thread'}
                </h3>
                {thread.last_message_at && (
                  <p className="text-sm text-gray-500 mt-2">
                    Last message: {format(new Date(thread.last_message_at), 'PPp')}
                  </p>
                )}
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-500 mb-4">No messages yet</p>
            <Link
              href="/messages/new"
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              Send your first message
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
