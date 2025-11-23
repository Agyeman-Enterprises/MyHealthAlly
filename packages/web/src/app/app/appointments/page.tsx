'use client';

import { useState, useEffect, useCallback } from 'react';
import { GlowCard } from '@/components/ui/glow-card';
import FloatingNav from '@/components/patient/FloatingNav';
import { useAuth } from '@/contexts/AuthContext';
import { fetchAPI } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, Clock, MapPin, Video } from 'lucide-react';

export default function AppAppointmentsPage() {
  const { patient, loading: authLoading } = useAuth();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAppointments = useCallback(async () => {
    if (!patient?.id) return;
    setLoading(true);
    try {
      const data = await fetchAPI(`/patients/${patient.id}/visit-requests?status=PENDING`);
      setAppointments(data);
    } catch (error) {
      console.error('Failed to load appointments:', error);
    } finally {
      setLoading(false);
    }
  }, [patient?.id]);

  useEffect(() => {
    if (!authLoading && patient) {
      loadAppointments();
    }
  }, [patient, authLoading, loadAppointments]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-myh-bg pb-24 p-6">
        <Skeleton className="h-8 w-48 mb-4" />
        <Skeleton className="h-48 w-full mb-4" />
        <Skeleton className="h-48 w-full" />
        <FloatingNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-myh-bg pb-24">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-myh-text">Appointments</h1>
          <p className="text-myh-textSoft">Your upcoming visits and care team check-ins</p>
        </div>

        {appointments.length > 0 ? (
          <div className="space-y-4">
            {appointments.map((apt) => (
              <GlowCard key={apt.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-myh-primarySoft rounded-xl flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-myh-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-myh-text text-lg">
                        {formatDate(apt.scheduledAt || apt.requestedAt)}
                      </p>
                      <div className="flex items-center gap-2 text-sm text-myh-textSoft mt-1">
                        <Clock className="w-4 h-4" />
                        <span>
                          {new Date(apt.scheduledAt || apt.requestedAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-myh-primarySoft text-myh-primary rounded-full text-sm font-medium">
                    {apt.type === 'MA_CHECK' ? 'MA Check-in' : 'Provider Visit'}
                  </span>
                </div>

                <div className="space-y-2 pt-4 border-t border-myh-border">
                  <div className="flex items-center gap-2 text-sm text-myh-textSoft">
                    <Video className="w-4 h-4" />
                    <span>Virtual Visit</span>
                  </div>
                  {apt.notes && (
                    <p className="text-sm text-myh-textSoft mt-2">{apt.notes}</p>
                  )}
                </div>
              </GlowCard>
            ))}
          </div>
        ) : (
          <GlowCard className="p-6 text-center">
            <Calendar className="w-12 h-12 mx-auto mb-4 text-myh-border" />
            <p className="text-myh-textSoft font-medium">No upcoming appointments</p>
            <p className="text-sm text-myh-textSoft mt-2">
              Your care team will schedule visits here as needed.
            </p>
          </GlowCard>
        )}
      </div>

      <FloatingNav />
    </div>
  );
}

