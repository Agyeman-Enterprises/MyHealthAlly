'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store/auth-store';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/solopractice-client';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { DisclaimerBanner } from '@/components/governance/DisclaimerBanner';
import { format } from 'date-fns';

export default function DashboardPage() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const role = useAuthStore((state) => state.role);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    
    if (role === 'provider' || role === 'admin') {
      router.push('/provider/dashboard');
      return;
    }
  }, [isAuthenticated, role, router]);

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

  const messageCount = threads?.length || 0;
  const medicationCount = medications?.length || 0;
  const recentThreads = threads?.slice(0, 3) || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50/30 pb-20 md:pb-8">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
        {/* Rule 4: Radical Role Clarity - Disclaimer */}
        <DisclaimerBanner type="standard" className="mb-6" />
        
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back! 👋
          </h2>
          <p className="text-gray-600">
            Here's what's happening with your health today
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card variant="gradient" hover className="border-l-4 border-l-primary-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-primary-700 mb-1">Messages</p>
                <p className="text-3xl font-bold text-primary-900">{messageCount}</p>
                <p className="text-xs text-primary-600 mt-1">Active conversations</p>
              </div>
              <div className="w-12 h-12 bg-white/50 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
            </div>
          </Card>

          <Card variant="elevated" hover className="border-l-4 border-l-success-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Medications</p>
                <p className="text-3xl font-bold text-gray-900">{medicationCount}</p>
                <p className="text-xs text-gray-500 mt-1">Active prescriptions</p>
              </div>
              <div className="w-12 h-12 bg-success-50 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-success-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              </div>
            </div>
          </Card>

          <Card variant="elevated" hover className="border-l-4 border-l-warning-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Tasks</p>
                <p className="text-3xl font-bold text-gray-900">0</p>
                <p className="text-xs text-gray-500 mt-1">Pending items</p>
              </div>
              <div className="w-12 h-12 bg-warning-50 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-warning-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Link href="/messages" className="group">
            <Card hover className="text-center p-6 h-full">
              <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Messages</h3>
              <p className="text-xs text-gray-500">View conversations</p>
            </Card>
          </Link>

          <Link href="/vitals" className="group">
            <Card hover className="text-center p-6 h-full">
              <div className="w-12 h-12 bg-gradient-success rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Vitals</h3>
              <p className="text-xs text-gray-500">Record health data</p>
            </Card>
          </Link>

          <Link href="/medications" className="group">
            <Card hover className="text-center p-6 h-full">
              <div className="w-12 h-12 bg-gradient-purple rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Medications</h3>
              <p className="text-xs text-gray-500">Manage prescriptions</p>
            </Card>
          </Link>

          <Link href="/appointments" className="group">
            <Card hover className="text-center p-6 h-full">
              <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Appointments</h3>
              <p className="text-xs text-gray-500">Schedule & view</p>
            </Card>
          </Link>

          <Link href="/documents" className="group">
            <Card hover className="text-center p-6 h-full">
              <div className="w-12 h-12 bg-gradient-success rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Documents</h3>
              <p className="text-xs text-gray-500">Upload & view</p>
            </Card>
          </Link>

          <Link href="/referrals" className="group">
            <Card hover className="text-center p-6 h-full">
              <div className="w-12 h-12 bg-gradient-warning rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Referrals</h3>
              <p className="text-xs text-gray-500">Request specialist</p>
            </Card>
          </Link>

          <Link href="/payments" className="group">
            <Card hover className="text-center p-6 h-full">
              <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Payments</h3>
              <p className="text-xs text-gray-500">Make payment</p>
            </Card>
          </Link>

          <Link href="/invoices" className="group">
            <Card hover className="text-center p-6 h-full">
              <div className="w-12 h-12 bg-gradient-warning rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Invoices</h3>
              <p className="text-xs text-gray-500">View & pay</p>
            </Card>
          </Link>

          <Link href="/intake" className="group">
            <Card hover className="text-center p-6 h-full">
              <div className="w-12 h-12 bg-gradient-success rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Intake Forms</h3>
              <p className="text-xs text-gray-500">Complete paperwork</p>
            </Card>
          </Link>

          <Link href="/appointments" className="group">
            <Card hover className="text-center p-6 h-full">
              <div className="w-12 h-12 bg-gradient-warm rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Appointments</h3>
              <p className="text-xs text-gray-500">Schedule visits</p>
            </Card>
          </Link>
        </div>

        {/* Recent Messages */}
        <Card variant="elevated">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Recent Messages</h2>
            <Link href="/messages">
              <Button variant="ghost" size="sm">View All</Button>
            </Link>
          </div>
          
          {recentThreads.length > 0 ? (
            <div className="space-y-4">
              {recentThreads.map((thread) => (
                <Link
                  key={thread.id}
                  href={`/messages/${thread.id}`}
                  className="block"
                >
                  <Card hover className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">
                          {thread.subject || 'Message Thread'}
                        </h3>
                        {thread.last_message_at && (
                          <p className="text-sm text-gray-500">
                            {format(new Date(thread.last_message_at), 'MMM d, h:mm a')}
                          </p>
                        )}
                      </div>
                      <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <p className="text-gray-500 mb-4">No messages yet</p>
              <Link href="/messages">
                <Button variant="primary" size="sm">Send your first message</Button>
              </Link>
            </div>
          )}
        </Card>
      </main>

      <BottomNav />
    </div>
  );
}
