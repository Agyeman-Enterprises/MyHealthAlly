'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { fetchAPI } from '@/lib/utils';
import { Alert, Patient } from '@myhealthally/shared';
import Link from 'next/link';
import { Activity, Users, Calendar, MessageSquare, ArrowRight } from 'lucide-react';

export default function ClinicsDashboardPage() {
  const router = useRouter();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [stats, setStats] = useState({
    totalPatients: 0,
    highRisk: 0,
    visitRequests: 0,
    unreadMessages: 0,
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
      const [alertsData, patientsData] = await Promise.all([
        fetchAPI('/alerts?status=ACTIVE'),
        fetchAPI('/patients'),
      ]);

      setAlerts(alertsData.slice(0, 10));
      setStats({
        totalPatients: patientsData.length,
        highRisk: alertsData.filter((a: Alert) => a.severity === 'CRITICAL').length,
        visitRequests: 0, // TODO: fetch from visit-requests endpoint
        unreadMessages: 0, // TODO: fetch from messaging endpoint
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
          <Skeleton className="h-10 w-64 mb-2" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
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
          <h1 className="text-3xl font-semibold text-myh-text">Clinic Dashboard</h1>
          <p className="text-muted-foreground mt-2">Overview of your practice and patient care</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalPatients}</div>
              <p className="text-xs text-muted-foreground">Active patients</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">High-Risk Patients</CardTitle>
              <Activity className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.highRisk}</div>
              <p className="text-xs text-muted-foreground">Need attention</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Visit Requests</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.visitRequests}</div>
              <p className="text-xs text-muted-foreground">Pending</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Unread Messages</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.unreadMessages}</div>
              <p className="text-xs text-muted-foreground">From patients</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link href="/clinics/patients">
            <Card className="hover:bg-accent/5 cursor-pointer transition-colors">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  View All Patients
                  <ArrowRight className="h-4 w-4" />
                </CardTitle>
                <CardDescription>Manage patient care plans and view metrics</CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/dashboard/today">
            <Card className="hover:bg-accent/5 cursor-pointer transition-colors">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Today&apos;s Triage
                  <ArrowRight className="h-4 w-4" />
                </CardTitle>
                <CardDescription>Overview of urgent patient needs</CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/clinics/alerts">
            <Card className="hover:bg-accent/5 cursor-pointer transition-colors">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Alerts
                  <ArrowRight className="h-4 w-4" />
                </CardTitle>
                <CardDescription>Review and manage patient alerts</CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/clinics/visits">
            <Card className="hover:bg-accent/5 cursor-pointer transition-colors">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Visit Requests
                  <ArrowRight className="h-4 w-4" />
                </CardTitle>
                <CardDescription>Schedule and manage appointments</CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/clinics/rules">
            <Card className="hover:bg-accent/5 cursor-pointer transition-colors">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Rules Engine
                  <ArrowRight className="h-4 w-4" />
                </CardTitle>
                <CardDescription>Configure clinical rules and alerts</CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/messages">
            <Card className="hover:bg-accent/5 cursor-pointer transition-colors">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Messages
                  <ArrowRight className="h-4 w-4" />
                </CardTitle>
                <CardDescription>Communicate with patients</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        </div>

        {/* Recent Alerts */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Alerts</CardTitle>
            <CardDescription>Patients needing attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {alerts.length === 0 ? (
                <p className="text-muted-foreground">No active alerts</p>
              ) : (
                alerts.map((alert) => (
                  <Link key={alert.id} href={`/clinics/patients/${alert.patientId}`}>
                    <div className="border-b pb-4 last:border-0 hover:bg-muted/50 -mx-4 px-4 py-2 rounded-md transition-colors">
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
                  </Link>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

