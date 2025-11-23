'use client';

import { useEffect, useState } from 'react';
import { fetchAPI } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { User, Video, Clock, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function StaffVirtualQueue() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSessions();
    // Refresh every 10 seconds
    const interval = setInterval(loadSessions, 10000);
    return () => clearInterval(interval);
  }, []);

  const loadSessions = async () => {
    try {
      const data = await fetchAPI('/virtual-visits/active');
      setSessions(data);
    } catch (error) {
      console.error('Failed to load virtual queue:', error);
    } finally {
      setLoading(false);
    }
  };

  const waiting = sessions.filter((s) => s.status === 'WAITING');
  const inProgress = sessions.filter((s) => s.status === 'ACTIVE');

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  const renderSessionList = (sessionList: any[], status: string) => {
    if (sessionList.length === 0) {
      return (
        <div className="text-center py-8 text-myh-textSoft">
          <Video className="w-10 h-10 mx-auto mb-2 text-myh-border" />
          <p className="text-sm">No {status.toLowerCase()} sessions</p>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {sessionList.map((session) => (
          <div
            key={session.id}
            className="p-4 border border-myh-border rounded-lg bg-myh-surface"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-myh-primarySoft rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-myh-primary" />
                </div>
                <div>
                  <p className="font-medium text-myh-text">
                    {session.visit?.patient?.user?.firstName} {session.visit?.patient?.user?.lastName}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <Clock className="w-3 h-3 text-myh-textSoft" />
                    <span className="text-xs text-myh-textSoft">
                      {session.patientJoinedAt
                        ? `Joined ${new Date(session.patientJoinedAt).toLocaleTimeString()}`
                        : 'Waiting...'}
                    </span>
                  </div>
                </div>
              </div>
              {status === 'WAITING' && (
                <Button size="sm" onClick={() => handleJoin(session.visitId)}>
                  Join Session
                </Button>
              )}
              {status === 'ACTIVE' && (
                <Badge className="bg-green-500">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  In Progress
                </Badge>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const handleJoin = (visitId: string) => {
    // TODO: Navigate to virtual visit screen
    window.location.href = `/staff/virtual/${visitId}`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Virtual Visit Queue</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-medium text-myh-text mb-3">In Waiting Room ({waiting.length})</h3>
            {renderSessionList(waiting, 'WAITING')}
          </div>
          <div>
            <h3 className="text-sm font-medium text-myh-text mb-3">In Progress ({inProgress.length})</h3>
            {renderSessionList(inProgress, 'ACTIVE')}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

