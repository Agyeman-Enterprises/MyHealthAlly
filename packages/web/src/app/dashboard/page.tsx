'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { fetchAPI } from '@/lib/utils';
import { Alert } from '@myhealthally/shared';
import Link from 'next/link';

export default function DashboardPage() {
  const router = useRouter();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [stats, setStats] = useState({
    highRisk: 0,
    visitRequests: 0,
    noData: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    loadData();
  }, [router]);

  const loadData = async () => {
    try {
      const [alertsData] = await Promise.all([
        fetchAPI('/alerts'),
      ]);

      setAlerts(alertsData.slice(0, 10));
      
      // Calculate stats
      const highRisk = alertsData.filter((a: Alert) => a.severity === 'CRITICAL').length;
      const noData = alertsData.filter((a: Alert) => a.type === 'NO_DATA').length;
      
      setStats({
        highRisk,
        visitRequests: 0, // TODO: fetch from visit-requests endpoint
        noData,
      });
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <div>
            <Skeleton className="h-10 w-64 mb-2" />
            <Skeleton className="h-6 w-96" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-32" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-16" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-semibold">MyHealthAlly Clinic Dashboard</h1>
          <p className="text-muted-foreground mt-2">Continuous overview of all active patients.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>High-risk patients</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.highRisk}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Visit requests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.visitRequests}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>No data (3 days)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.noData}</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Today&apos;s alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {alerts.length === 0 ? (
                  <p className="text-muted-foreground">No active alerts</p>
                ) : (
                  alerts.map((alert) => (
                    <div key={alert.id} className="border-b pb-4 last:border-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge
                              variant={
                                alert.severity === 'CRITICAL'
                                  ? 'error'
                                  : alert.severity === 'WARNING'
                                  ? 'warning'
                                  : 'default'
                              }
                            >
                              {alert.severity}
                            </Badge>
                            <span className="text-sm font-medium">
                              Patient {alert.patientId.slice(0, 8)}
                            </span>
                          </div>
                          <h4 className="font-medium">{alert.title}</h4>
                          <p className="text-sm text-muted-foreground mt-1">{alert.body}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Upcoming visits</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">No upcoming visits scheduled</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/dashboard/today">
            <Card className="hover:bg-accent/5 cursor-pointer transition-colors">
              <CardHeader>
                <CardTitle>Today&apos;s Triage</CardTitle>
                <CardDescription>Patients needing attention and priorities</CardDescription>
              </CardHeader>
            </Card>
          </Link>
          <Link href="/patients">
            <Card className="hover:bg-accent/5 cursor-pointer transition-colors">
              <CardHeader>
                <CardTitle>View all patients</CardTitle>
                <CardDescription>Manage patient care plans and view metrics</CardDescription>
              </CardHeader>
            </Card>
          </Link>
          <Link href="/messages">
            <Card className="hover:bg-accent/5 cursor-pointer transition-colors">
              <CardHeader>
                <CardTitle>Messages</CardTitle>
                <CardDescription>Communicate with patients</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}

