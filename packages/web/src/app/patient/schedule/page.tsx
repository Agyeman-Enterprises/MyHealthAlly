'use client';

import { useEffect, useState } from 'react';
import { PageContainer } from '@/components/layout/PageContainer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AppointmentCard } from '@/components/widgets/AppointmentCard';
import { Button } from '@/components/ui/button';
import { fetchAPI } from '@/lib/utils';
import { formatDate, formatTime } from '@/utils/date';
import { Calendar, Plus } from 'lucide-react';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export default function PatientSchedulePage() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    try {
      const data = await fetchAPI('/patients/me/appointments');
      setAppointments(data || []);
    } catch (error) {
      console.error('Failed to load appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-body" style={{ color: 'var(--color-textSecondary)' }}>
            Loading...
          </div>
        </div>
      </PageContainer>
    );
  }

  const upcoming = appointments.filter((a: any) => new Date(a.startTime) > new Date());
  const past = appointments.filter((a: any) => new Date(a.startTime) <= new Date());

  return (
    <PageContainer>
      <div className="py-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-h1 mb-2">Schedule</h1>
            <p className="text-body" style={{ color: 'var(--color-textSecondary)' }}>
              Your appointments and visits
            </p>
          </div>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Book Appointment
          </Button>
        </div>

        {/* Upcoming Appointments */}
        {upcoming.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-h3">Upcoming</h2>
            {upcoming.map((appt: any) => (
              <AppointmentCard
                key={appt.id}
                date={formatDate(appt.startTime)}
                time={formatTime(appt.startTime)}
                provider={appt.provider?.name || 'Provider'}
                type={appt.visitMode === 'VIRTUAL' ? 'virtual' : 'in_person'}
                status="scheduled"
                reason={appt.reason}
                onJoin={appt.visitMode === 'VIRTUAL' ? () => window.location.href = `/patient/visit/${appt.id}` : undefined}
              />
            ))}
          </div>
        )}

        {/* Past Appointments */}
        {past.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-h3">Past</h2>
            {past.map((appt: any) => (
              <AppointmentCard
                key={appt.id}
                date={formatDate(appt.startTime)}
                time={formatTime(appt.startTime)}
                provider={appt.provider?.name || 'Provider'}
                type={appt.visitMode === 'VIRTUAL' ? 'virtual' : 'in_person'}
                status="completed"
                reason={appt.reason}
              />
            ))}
          </div>
        )}

        {appointments.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Calendar className="w-12 h-12 mb-4" style={{ color: 'var(--color-textSecondary)' }} />
              <p className="text-body mb-4" style={{ color: 'var(--color-textSecondary)' }}>
                No appointments scheduled
              </p>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Book Your First Appointment
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </PageContainer>
  );
}
