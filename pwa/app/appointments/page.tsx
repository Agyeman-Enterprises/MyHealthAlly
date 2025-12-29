'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth-store';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

const mockAppts = [
  { id: '1', type: 'Follow-up Visit', provider: 'Dr. Smith', date: '2025-01-05T10:00:00', location: 'Main Office', status: 'confirmed' },
  { id: '2', type: 'Lab Work', provider: 'Lab Services', date: '2025-01-03T08:30:00', location: 'Lab Center', status: 'confirmed' },
];

export default function AppointmentsPage() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [appts, setAppts] = useState(mockAppts);
  const [loading, setLoading] = useState(true);

  useEffect(() => { setTimeout(() => setLoading(false), 500); }, []);

  if (!isAuthenticated) { router.push('/auth/login'); return null; }

  const hasAppts = appts.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-sky-50 pb-20 md:pb-8">
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-navy-600">Your Appointments</h1>
            <p className="text-gray-600">Manage your healthcare visits</p>
          </div>
          {hasAppts && (
            <Button variant="primary" onClick={() => router.push('/appointments/request')}>+ Request Appointment</Button>
          )}
        </div>

        {loading && (
          <Card className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-primary-300 border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-gray-500">Loading appointments...</p>
          </Card>
        )}

        {!loading && hasAppts && (
          <>
            <div className="space-y-3 mb-6">
              {appts.map((appt) => (
                <Card key={appt.id}>
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-navy-600">{appt.type}</h3>
                      <p className="text-gray-600">{appt.provider}</p>
                      <p className="text-sm text-gray-500">{appt.location}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-navy-600">{new Date(appt.date).toLocaleDateString()}</p>
                      <p className="text-sm text-gray-500">{new Date(appt.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                      <span className={`text-xs px-2 py-1 rounded-full ${appt.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                        {appt.status === 'confirmed' ? '✓ Confirmed' : 'Pending'}
                      </span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <Card className="bg-primary-50 border-primary-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-navy-600">📅 View Calendar</h3>
                  <p className="text-sm text-gray-600">See all appointments in calendar view</p>
                </div>
                <Button variant="outline" onClick={() => router.push('/appointments/calendar')}>Open Calendar</Button>
              </div>
            </Card>
          </>
        )}

        {!loading && !hasAppts && (
          <Card className="text-center py-12">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">📅</span>
            </div>
            <h3 className="text-lg font-semibold text-navy-600 mb-2">No upcoming appointments</h3>
            <p className="text-gray-600 mb-6">Schedule your next visit with your care team</p>
            <Button variant="primary" onClick={() => router.push('/appointments/request')}>Request Appointment</Button>
          </Card>
        )}

        <Card className="mt-6">
          <h3 className="font-semibold text-navy-600 mb-2">📍 Office Information</h3>
          <p className="text-gray-600"><strong>Hours:</strong> Monday - Friday, 9:00 AM - 5:00 PM ChST</p>
          <p className="text-gray-600"><strong>Phone:</strong> <a href="tel:+16715550123" className="text-primary-600 hover:underline">(671) 555-0123</a></p>
          <p className="text-gray-600"><strong>Address:</strong> 123 Health Center Drive, Tamuning, GU 96913</p>
        </Card>
      </main>
      <BottomNav />
    </div>
  );
}
