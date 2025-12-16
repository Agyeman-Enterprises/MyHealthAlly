'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store/auth-store';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/solopractice-client';

export default function DashboardPage() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const logout = useAuthStore((state) => state.logout);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, router]);

  const { data: threads } = useQuery({
    queryKey: ['threads'],
    queryFn: () => apiClient.getThreads(),
    enabled: isAuthenticated,
  });

  const { data: medications } = useQuery({
    queryKey: ['medications'],
    queryFn: () => apiClient.getMedications(),
    enabled: isAuthenticated,
  });

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">MyHealth Ally</h1>
            <button
              onClick={logout}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Messages</h3>
            <p className="text-2xl font-bold text-gray-900 mt-2">
              {threads?.length || 0}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Medications</h3>
            <p className="text-2xl font-bold text-gray-900 mt-2">
              {medications?.length || 0}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Tasks</h3>
            <p className="text-2xl font-bold text-gray-900 mt-2">0</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Link
            href="/messages"
            className="bg-primary-600 text-white rounded-lg shadow p-6 hover:bg-primary-700 transition"
          >
            <h3 className="font-semibold mb-2">Messages</h3>
            <p className="text-sm opacity-90">View and send messages</p>
          </Link>
          <Link
            href="/vitals"
            className="bg-primary-600 text-white rounded-lg shadow p-6 hover:bg-primary-700 transition"
          >
            <h3 className="font-semibold mb-2">Record Vitals</h3>
            <p className="text-sm opacity-90">Track your health</p>
          </Link>
          <Link
            href="/medications"
            className="bg-primary-600 text-white rounded-lg shadow p-6 hover:bg-primary-700 transition"
          >
            <h3 className="font-semibold mb-2">Medications</h3>
            <p className="text-sm opacity-90">Manage prescriptions</p>
          </Link>
          <Link
            href="/appointments"
            className="bg-primary-600 text-white rounded-lg shadow p-6 hover:bg-primary-700 transition"
          >
            <h3 className="font-semibold mb-2">Appointments</h3>
            <p className="text-sm opacity-90">Schedule visits</p>
          </Link>
        </div>

        {/* Recent Messages */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Recent Messages</h2>
          </div>
          <div className="p-6">
            {threads && threads.length > 0 ? (
              <div className="space-y-4">
                {threads.slice(0, 5).map((thread) => (
                  <Link
                    key={thread.id}
                    href={`/messages/${thread.id}`}
                    className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                  >
                    <h3 className="font-medium text-gray-900">
                      {thread.subject || 'Message Thread'}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {thread.last_message_at
                        ? new Date(thread.last_message_at).toLocaleDateString()
                        : 'No messages'}
                    </p>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No messages yet</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
