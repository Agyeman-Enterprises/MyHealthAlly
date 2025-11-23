'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { fetchAPI } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, Clock, MapPin, Video, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export function PatientUpcomingVisitCard() {
  const { patient, loading: authLoading } = useAuth();
  const [upcomingVisit, setUpcomingVisit] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!patient?.id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    Promise.all([
      fetchAPI(`/visits/patient/${patient.id}?status=PLANNED`).catch(() => []),
      fetchAPI(`/visit-requests/patient/${patient.id}?status=AWAITING_PATIENT_CONFIRMATION`).catch(() => []),
    ])
      .then(([visits, requests]) => {
        // Get the earliest upcoming visit or request
        const all = [...(visits || []), ...(requests || [])];
        if (all.length > 0) {
          const sorted = all.sort((a, b) => {
            const dateA = new Date(a.slot?.startTime || a.requestedDate || a.createdAt);
            const dateB = new Date(b.slot?.startTime || b.requestedDate || b.createdAt);
            return dateA.getTime() - dateB.getTime();
          });
          setUpcomingVisit(sorted[0]);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [patient?.id]);

  if (authLoading || loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!upcomingVisit) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Upcoming Visit</CardTitle>
        </CardHeader>
        <CardContent className="text-center py-6">
          <Calendar className="w-8 h-8 mx-auto mb-2 text-myh-border" />
          <p className="text-sm text-myh-textSoft">No upcoming visits scheduled</p>
          <Link
            href="/patient/schedule/request"
            className="block mt-3 text-sm text-myh-primary hover:underline"
          >
            Schedule a visit →
          </Link>
        </CardContent>
      </Card>
    );
  }

  const visitDate = upcomingVisit.slot?.startTime || upcomingVisit.requestedDate || upcomingVisit.createdAt;
  const isVirtual = upcomingVisit.visitMode === 'VIRTUAL' || upcomingVisit.slot?.visitMode === 'VIRTUAL';
  const isRequest = !upcomingVisit.slot;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Upcoming Visit</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-myh-primarySoft rounded-full flex items-center justify-center flex-shrink-0">
              {isVirtual ? (
                <Video className="w-5 h-5 text-myh-primary" />
              ) : (
                <MapPin className="w-5 h-5 text-myh-primary" />
              )}
            </div>
            <div className="flex-1">
              <p className="font-medium text-myh-text">
                {isRequest ? 'Visit Request Pending' : 'Scheduled Visit'}
              </p>
              <div className="flex items-center gap-2 mt-1 text-sm text-myh-textSoft">
                <Calendar className="w-4 h-4" />
                <span>{new Date(visitDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
              </div>
              {upcomingVisit.slot?.startTime && (
                <div className="flex items-center gap-2 mt-1 text-sm text-myh-textSoft">
                  <Clock className="w-4 h-4" />
                  <span>{new Date(upcomingVisit.slot.startTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</span>
                </div>
              )}
            </div>
          </div>

          {isRequest && (
            <div className="flex items-center gap-2 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
              <AlertCircle className="w-4 h-4 text-yellow-600" />
              <p className="text-xs text-yellow-800">Please confirm your preferred time slot</p>
            </div>
          )}

          <Link
            href={isRequest ? `/patient/schedule/proposals/${upcomingVisit.id}` : `/patient/schedule`}
            className="block text-sm text-myh-primary hover:underline text-center"
          >
            {isRequest ? 'Review proposal →' : 'View details →'}
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

