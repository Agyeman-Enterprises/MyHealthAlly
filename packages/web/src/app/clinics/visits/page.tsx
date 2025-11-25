'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { fetchAPI } from '@/lib/utils';
import { getStoredMetaSync } from '@/lib/auth-storage';
import { VisitRequest } from '@myhealthally/shared';
import Link from 'next/link';
import { Calendar, Clock, User, Video } from 'lucide-react';

export default function ClinicsVisitsPage() {
  const router = useRouter();
  const [visits, setVisits] = useState<VisitRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const meta = getStoredMetaSync();
    if (!meta?.user) {
      router.push('/login');
      return;
    }
    loadVisits();
  }, [router]);

  const loadVisits = async () => {
    try {
      // TODO: Create endpoint to get all visit requests for clinic
      const patients = await fetchAPI('/patients');
      const allVisits: VisitRequest[] = [];
      
      for (const patient of patients) {
        try {
          const patientVisits = await fetchAPI(`/patients/${patient.id}/visit-requests`);
          allVisits.push(...patientVisits);
        } catch (error) {
          // Skip if patient has no visits
        }
      }

      setVisits(allVisits.sort((a, b) => 
        new Date(a.requestedAt).getTime() - new Date(b.requestedAt).getTime()
      ));
    } catch (error) {
      console.error('Failed to load visits:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string | Date) => {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (dateString: string | Date) => {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const pendingVisits = visits.filter((v) => v.status === 'PENDING' || v.status === 'SCHEDULED');
  const completedVisits = visits.filter((v) => v.status === 'COMPLETED');
  const cancelledVisits = visits.filter((v) => v.status === 'CANCELLED');

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <Skeleton className="h-10 w-64 mb-4" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900">Visit Requests</h1>
          <p className="text-muted-foreground mt-2">Schedule and manage patient appointments</p>
        </div>

        {/* Pending/Scheduled Visits */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Visits ({pendingVisits.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {pendingVisits.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                <p>No upcoming visits</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingVisits.map((visit) => (
                  <Link key={visit.id} href={`/clinics/patients/${visit.patientId}`}>
                    <div className="border-b pb-4 last:border-0 hover:bg-muted/50 -mx-4 px-4 py-2 rounded-md transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-teal-50">
                              <Calendar className="w-5 h-5 text-teal-600" />
                            </div>
                            <div>
                              <p className="font-semibold text-lg">
                                {visit.type === 'MA_CHECK' ? 'MA Check-in' : 'Provider Visit'}
                              </p>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                                <div className="flex items-center gap-1">
                                  <Clock className="w-4 h-4" />
                                  <span>
                                    {formatDate(visit.scheduledAt || visit.requestedAt)} at{' '}
                                    {formatTime(visit.scheduledAt || visit.requestedAt)}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Video className="w-4 h-4" />
                                  <span>Virtual</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          {visit.notes && (
                            <p className="text-sm text-muted-foreground ml-13">{visit.notes}</p>
                          )}
                          <Link
                            href={`/clinics/patients/${visit.patientId}`}
                            className="text-sm text-teal-600 hover:underline ml-13"
                          >
                            View Patient →
                          </Link>
                        </div>
                        <Badge
                          variant={
                            visit.status === 'SCHEDULED'
                              ? 'default'
                              : visit.status === 'PENDING'
                              ? 'warning'
                              : 'outline'
                          }
                        >
                          {visit.status}
                        </Badge>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Completed Visits */}
        {completedVisits.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Completed Visits ({completedVisits.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {completedVisits.slice(0, 10).map((visit) => (
                  <Link key={visit.id} href={`/clinics/patients/${visit.patientId}`}>
                    <div className="border-b pb-4 last:border-0 hover:bg-muted/50 -mx-4 px-4 py-2 rounded-md transition-colors">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">
                            {visit.type === 'MA_CHECK' ? 'MA Check-in' : 'Provider Visit'}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {formatDate(visit.requestedAt)}
                          </p>
                        </div>
                        <Badge variant="outline">Completed</Badge>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

