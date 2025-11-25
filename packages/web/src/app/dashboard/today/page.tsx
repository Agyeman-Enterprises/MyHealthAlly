'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { fetchAPI } from '@/lib/utils';
import { getStoredMetaSync } from '@/lib/auth-storage';
import { Alert } from '@myhealthally/shared';
import Link from 'next/link';
import { MessageSquare, Calendar, Clock, ArrowUp, ArrowDown, Minus } from 'lucide-react';

interface PatientAlert {
  id: string;
  patientId: string;
  patientName: string;
  alertType: string;
  severity: string;
  lastVital: string;
  lastContact: string;
  title: string;
  body: string;
}

interface RecentMessage {
  id: string;
  threadId: string;
  patientId: string;
  patientName: string;
  content: string;
  timestamp: string;
}

interface TodayVisit {
  id: string;
  patientId: string;
  patientName: string;
  time: string;
  type: string;
  status: string;
}

export default function TodayDashboard() {
  const router = useRouter();
  const [patientsNeedingAttention, setPatientsNeedingAttention] = useState<PatientAlert[]>([]);
  const [recentMessages, setRecentMessages] = useState<RecentMessage[]>([]);
  const [todayVisits, setTodayVisits] = useState<TodayVisit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const meta = getStoredMetaSync();
    if (!meta?.user) {
      router.push('/login');
      return;
    }
    loadTodayData();
  }, [router]);

  const loadTodayData = async () => {
    try {
      const [alertsData, messagesData, visitsData] = await Promise.all([
        fetchAPI('/alerts'),
        fetchAPI('/messaging/threads'),
        fetchAPI('/patients'), // TODO: Replace with actual visit-requests endpoint
      ]);

      // Filter critical alerts and format
      const criticalAlerts = alertsData
        .filter((a: Alert) => a.severity === 'CRITICAL' && a.status === 'ACTIVE')
        .slice(0, 10)
        .map((alert: Alert) => ({
          id: alert.id,
          patientId: alert.patientId,
          patientName: `Patient ${alert.patientId.slice(0, 8)}`, // TODO: Get actual patient name
          alertType: alert.type,
          severity: alert.severity,
          lastVital: '120/80', // TODO: Get from measurements
          lastContact: '2 hours ago', // TODO: Calculate from last message/visit
          title: alert.title,
          body: alert.body,
        }));

      setPatientsNeedingAttention(criticalAlerts);

      // Format recent messages
      const formattedMessages = messagesData
        .slice(0, 5)
        .map((thread: any) => ({
          id: thread.id,
          threadId: thread.id,
          patientId: thread.patientId,
          patientName: `Patient ${thread.patientId.slice(0, 8)}`, // TODO: Get actual patient name
          content: thread.messages?.[0]?.content || 'No messages',
          timestamp: thread.lastMessageAt || thread.createdAt,
        }));

      setRecentMessages(formattedMessages);

      // Format today's visits (placeholder)
      setTodayVisits([]);
    } catch (error) {
      console.error('Failed to load today data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAction = (action: string, patientId: string) => {
    if (action === 'message') {
      router.push(`/messages?patient=${patientId}`);
    } else if (action === 'schedule') {
      router.push(`/patients/${patientId}?action=schedule`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <Skeleton className="h-10 w-64" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-32" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-20 w-full" />
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
          <h1 className="text-3xl font-semibold">Today&apos;s Triage</h1>
          <p className="text-muted-foreground mt-2">Patients needing attention and today&apos;s priorities</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Patients Needing Attention */}
          <Card>
            <CardHeader>
              <CardTitle>Patients needing attention</CardTitle>
              <CardDescription>Critical alerts requiring review</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {patientsNeedingAttention.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No critical alerts</p>
                ) : (
                  patientsNeedingAttention.map((item) => (
                    <div key={item.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Link href={`/patients/${item.patientId}`}>
                              <span className="font-medium hover:underline">{item.patientName}</span>
                            </Link>
                            <Badge variant={item.severity === 'CRITICAL' ? 'error' : 'warning'}>
                              {item.severity}
                            </Badge>
                          </div>
                          <h4 className="font-medium text-sm mb-1">{item.title}</h4>
                          <p className="text-sm text-muted-foreground">{item.body}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>Last vital: {item.lastVital}</span>
                        <span>•</span>
                        <span>Last contact: {item.lastContact}</span>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleQuickAction('message', item.patientId)}
                        >
                          <MessageSquare className="w-4 h-4 mr-2" />
                          Message
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleQuickAction('schedule', item.patientId)}
                        >
                          <Calendar className="w-4 h-4 mr-2" />
                          Schedule check-in
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Messages */}
          <Card>
            <CardHeader>
              <CardTitle>Recent messages</CardTitle>
              <CardDescription>Latest patient communications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentMessages.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No recent messages</p>
                ) : (
                  recentMessages.map((msg) => (
                    <Link key={msg.id} href={`/messages?thread=${msg.threadId}`}>
                      <div className="border rounded-lg p-4 hover:bg-accent/5 cursor-pointer transition-colors">
                        <div className="flex items-start justify-between mb-2">
                          <span className="font-medium text-sm">{msg.patientName}</span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">{msg.content}</p>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Today's Visits */}
        <Card>
          <CardHeader>
            <CardTitle>Today&apos;s visits</CardTitle>
            <CardDescription>Scheduled appointments for today</CardDescription>
          </CardHeader>
          <CardContent>
            {todayVisits.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No visits scheduled for today</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2 font-medium">Time</th>
                      <th className="text-left p-2 font-medium">Patient</th>
                      <th className="text-left p-2 font-medium">Type</th>
                      <th className="text-left p-2 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {todayVisits.map((visit) => (
                      <tr key={visit.id} className="border-b hover:bg-accent/5">
                        <td className="p-2">{visit.time}</td>
                        <td className="p-2">
                          <Link href={`/patients/${visit.patientId}`} className="hover:underline">
                            {visit.patientName}
                          </Link>
                        </td>
                        <td className="p-2">{visit.type}</td>
                        <td className="p-2">
                          <Badge variant="default">{visit.status}</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

