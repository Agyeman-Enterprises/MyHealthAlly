'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth-store';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/solopractice-client';
import { format } from 'date-fns';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

export default function AppointmentsPage() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, router]);

  // For now, we'll use a placeholder query
  // In production, this would call the actual appointments API
  const { data: appointments, isLoading } = useQuery({
    queryKey: ['appointments'],
    queryFn: async () => {
      // Placeholder - replace with actual API call
      return [];
    },
    enabled: isAuthenticated,
  });

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50/30 pb-20 md:pb-8">
      <Header title="Appointments" showBack />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Your Appointments</h2>
          <Link href="/appointments/request">
            <Button variant="primary" size="md">
              <svg className="w-5 h-5 mr-2 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Request Appointment
            </Button>
          </Link>
        </div>

        <Link href="/appointments/calendar" className="block mb-6">
          <Card hover className="p-6">
            <div className="flex items-center">
              <svg className="w-8 h-8 text-primary-600 mr-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">View Available Appointments</h3>
                <p className="text-sm text-gray-500">See available time slots and book directly</p>
              </div>
            </div>
          </Card>
        </Link>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-200 border-t-primary-600 mb-4"></div>
            <p className="text-gray-500">Loading appointments...</p>
          </div>
        ) : appointments && appointments.length > 0 ? (
          <div className="space-y-4">
            {appointments.map((appointment: any) => (
              <Card key={appointment.id} hover className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{appointment.type}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {format(new Date(appointment.dateTime), 'PPpp')}
                    </p>
                    {appointment.providerName && (
                      <p className="text-sm text-gray-600 mt-2">With {appointment.providerName}</p>
                    )}
                    {appointment.location && (
                      <p className="text-sm text-gray-600 mt-1">{appointment.location}</p>
                    )}
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    appointment.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                    appointment.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {appointment.status}
                  </span>
                </div>
                {appointment.isTelehealth && appointment.telehealthUrl && (
                  <div className="mt-4">
                    <a
                      href={appointment.telehealthUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                    >
                      Join Telehealth Session →
                    </a>
                  </div>
                )}
              </Card>
            ))}
          </div>
        ) : (
          <Card variant="elevated" className="text-center py-16">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No appointments scheduled</h3>
            <p className="text-gray-500 mb-6">Request an appointment to get started</p>
            <Link href="/appointments/request">
              <Button variant="primary" size="md">
                Request Appointment
              </Button>
            </Link>
          </Card>
        )}
      </main>

      <BottomNav />
    </div>
  );
}

