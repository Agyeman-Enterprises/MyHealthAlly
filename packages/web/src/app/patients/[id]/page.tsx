'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { fetchAPI } from '@/lib/utils';
import { Patient, Alert, RiskLevel } from '@myhealthally/shared';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { MessageSquare, Calendar, Activity, FileText, ArrowUp, ArrowDown, Minus, Clock } from 'lucide-react';

export default function PatientDetailPage() {
  const router = useRouter();
  const params = useParams();
  const patientId = params.id as string;
  
  const [patient, setPatient] = useState<Patient | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [measurements, setMeasurements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [alertStatusFilter, setAlertStatusFilter] = useState<string>('all');
  const [alertSeverityFilter, setAlertSeverityFilter] = useState<string>('all');
  const [resolveDialogOpen, setResolveDialogOpen] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [resolveNote, setResolveNote] = useState('');
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);
  const [noteContent, setNoteContent] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    loadPatientData();
  }, [patientId, router]);

  const loadPatientData = async () => {
    try {
      const [patientData, alertsData, measurementsData] = await Promise.all([
        fetchAPI(`/patients/${patientId}`),
        fetchAPI(`/alerts/patients/${patientId}`),
        fetchAPI(`/patients/${patientId}/measurements`),
      ]);

      setPatient(patientData);
      setAlerts(alertsData);
      setMeasurements(measurementsData.slice(0, 30));
    } catch (error) {
      console.error('Failed to load patient data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResolveAlert = async (alertId: string, note?: string) => {
    try {
      await fetchAPI(`/alerts/${alertId}/resolve`, { 
        method: 'PATCH',
        body: JSON.stringify({ note }),
      });
      setResolveDialogOpen(false);
      setResolveNote('');
      setSelectedAlert(null);
      loadPatientData();
    } catch (error) {
      console.error('Failed to resolve alert:', error);
    }
  };

  const handleUpdateAlertStatus = async (alertId: string, status: string) => {
    try {
      await fetchAPI(`/alerts/${alertId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      loadPatientData();
    } catch (error) {
      console.error('Failed to update alert status:', error);
    }
  };

  const handleSendMessage = () => {
    router.push(`/messages?patient=${patientId}`);
  };

  const handleRequestReadings = async () => {
    try {
      // Find or create a thread with the patient
      const threads = await fetchAPI('/messaging/threads');
      let thread = threads.find((t: any) => t.patientId === patientId);
      
      if (!thread) {
        thread = await fetchAPI('/messaging/threads', {
          method: 'POST',
          body: JSON.stringify({ patientId, subject: 'Request for readings' }),
        });
      }

      // Send templated message
      await fetchAPI(`/messaging/threads/${thread.id}/messages`, {
        method: 'POST',
        body: JSON.stringify({
          content: 'Hi! Could you please log your blood pressure, glucose, and weight readings for today? Thank you!',
        }),
      });

      router.push(`/messages?thread=${thread.id}`);
    } catch (error) {
      console.error('Failed to request readings:', error);
      alert('Failed to send message. Please try again.');
    }
  };

  const handleAddNote = async () => {
    try {
      // TODO: Implement notes endpoint
      // await fetchAPI(`/patients/${patientId}/notes`, {
      //   method: 'POST',
      //   body: JSON.stringify({ content: noteContent }),
      // });
      alert('Note feature coming soon');
      setNoteDialogOpen(false);
      setNoteContent('');
    } catch (error) {
      console.error('Failed to add note:', error);
    }
  };

  const handleScheduleVisit = async () => {
    try {
      await fetchAPI(`/patients/${patientId}/visit-requests`, {
        method: 'POST',
        body: JSON.stringify({ type: 'PROVIDER' }),
      });
      alert('Visit request created');
    } catch (error) {
      console.error('Failed to create visit request:', error);
    }
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  if (!patient) {
    return <div className="p-8">Patient not found</div>;
  }

  const risk = alerts.some((a) => a.severity === 'CRITICAL')
    ? RiskLevel.HIGH_RISK
    : alerts.filter((a) => a.severity === 'WARNING').length >= 2
    ? RiskLevel.WORSENING
    : RiskLevel.STABLE;

  const bpData = measurements
    .filter((m) => m.type === 'BLOOD_PRESSURE')
    .map((m) => {
      const value = m.value as any;
      return {
        date: new Date(m.timestamp).toLocaleDateString(),
        systolic: typeof value === 'object' ? value.systolic : null,
        diastolic: typeof value === 'object' ? value.diastolic : null,
      };
    })
    .filter((d) => d.systolic && d.diastolic);

  // Calculate age from date of birth if available
  const age = patient.dateOfBirth 
    ? Math.floor((new Date().getTime() - new Date(patient.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
    : null;

  // Get last 3 key metrics with trends
  const latestMetrics = {
    bp: measurements.find((m) => m.type === 'BLOOD_PRESSURE'),
    glucose: measurements.find((m) => m.type === 'GLUCOSE'),
    weight: measurements.find((m) => m.type === 'WEIGHT'),
  };

  const getTrend = (current: any, previous: any) => {
    if (!current || !previous) return null;
    const currentVal = typeof current.value === 'object' ? current.value.systolic || current.value : current.value;
    const previousVal = typeof previous.value === 'object' ? previous.value.systolic || previous.value : previous.value;
    if (currentVal > previousVal) return 'up';
    if (currentVal < previousVal) return 'down';
    return 'stable';
  };

  const filteredAlerts = alerts.filter((alert) => {
    if (alertStatusFilter !== 'all' && alert.status !== alertStatusFilter) return false;
    if (alertSeverityFilter !== 'all' && alert.severity !== alertSeverityFilter) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Enhanced Summary Panel */}
        <Card className="border-2">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <div className="flex items-center gap-4 mb-2">
                  <h1 className="text-3xl font-semibold">
                    {patient.firstName} {patient.lastName}
                  </h1>
                  {age && <span className="text-muted-foreground">Age {age}</span>}
                  <Badge
                    variant={
                      risk === RiskLevel.HIGH_RISK
                        ? 'error'
                        : risk === RiskLevel.WORSENING
                        ? 'warning'
                        : 'success'
                    }
                  >
                    {risk === RiskLevel.HIGH_RISK
                      ? 'High Risk'
                      : risk === RiskLevel.WORSENING
                      ? 'Watch'
                      : 'Stable'}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Program: {patient.flags?.[0] || 'Standard Care'} • Patient ID: {patient.id.slice(0, 8)}
                </p>
              </div>
            </div>

            {/* Last 3 Key Metrics */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              {latestMetrics.bp && (
                <div className="border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-muted-foreground">Blood Pressure</span>
                    {(() => {
                      const prev = measurements.find((m, i) => 
                        i > measurements.indexOf(latestMetrics.bp!) && m.type === 'BLOOD_PRESSURE'
                      );
                      const trend = prev ? getTrend(latestMetrics.bp, prev) : null;
                      return trend === 'up' ? <ArrowUp className="w-4 h-4 text-warning" /> :
                             trend === 'down' ? <ArrowDown className="w-4 h-4 text-success" /> :
                             <Minus className="w-4 h-4 text-muted-foreground" />;
                    })()}
                  </div>
                  <p className="text-lg font-semibold">
                    {typeof latestMetrics.bp.value === 'object' 
                      ? `${latestMetrics.bp.value.systolic}/${latestMetrics.bp.value.diastolic}`
                      : latestMetrics.bp.value}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(latestMetrics.bp.timestamp).toLocaleDateString()}
                  </p>
                </div>
              )}
              {latestMetrics.glucose && (
                <div className="border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-muted-foreground">Glucose</span>
                    {(() => {
                      const prev = measurements.find((m, i) => 
                        i > measurements.indexOf(latestMetrics.glucose!) && m.type === 'GLUCOSE'
                      );
                      const trend = prev ? getTrend(latestMetrics.glucose, prev) : null;
                      return trend === 'up' ? <ArrowUp className="w-4 h-4 text-warning" /> :
                             trend === 'down' ? <ArrowDown className="w-4 h-4 text-success" /> :
                             <Minus className="w-4 h-4 text-muted-foreground" />;
                    })()}
                  </div>
                  <p className="text-lg font-semibold">{latestMetrics.glucose.value} mg/dL</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(latestMetrics.glucose.timestamp).toLocaleDateString()}
                  </p>
                </div>
              )}
              {latestMetrics.weight && (
                <div className="border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-muted-foreground">Weight</span>
                    {(() => {
                      const prev = measurements.find((m, i) => 
                        i > measurements.indexOf(latestMetrics.weight!) && m.type === 'WEIGHT'
                      );
                      const trend = prev ? getTrend(latestMetrics.weight, prev) : null;
                      return trend === 'up' ? <ArrowUp className="w-4 h-4 text-warning" /> :
                             trend === 'down' ? <ArrowDown className="w-4 h-4 text-success" /> :
                             <Minus className="w-4 h-4 text-muted-foreground" />;
                    })()}
                  </div>
                  <p className="text-lg font-semibold">{latestMetrics.weight.value} lbs</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(latestMetrics.weight.timestamp).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>

            {/* Last Contact & Weekly Summary */}
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>Last contact: 2 days ago</span>
              </div>
              <span>•</span>
              <span>Last weekly summary: Dec 8, 2024</span>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" onClick={handleSendMessage}>
                <MessageSquare className="w-4 h-4 mr-2" />
                Send message
              </Button>
              <Button variant="outline" onClick={handleRequestReadings}>
                <Activity className="w-4 h-4 mr-2" />
                Request new readings
              </Button>
              <Button variant="outline" onClick={handleScheduleVisit}>
                <Calendar className="w-4 h-4 mr-2" />
                Schedule follow-up
              </Button>
              <Button variant="outline" onClick={() => setNoteDialogOpen(true)}>
                <FileText className="w-4 h-4 mr-2" />
                Add note
              </Button>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="metrics">Metrics</TabsTrigger>
            <TabsTrigger value="plan">Plan</TabsTrigger>
            <TabsTrigger value="alerts">Alerts</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Badge
                    variant={
                      risk === RiskLevel.HIGH_RISK
                        ? 'error'
                        : risk === RiskLevel.WORSENING
                        ? 'warning'
                        : 'success'
                    }
                  >
                    {risk === RiskLevel.HIGH_RISK
                      ? 'High risk'
                      : risk === RiskLevel.WORSENING
                      ? 'Worsening'
                      : 'Stable'}
                  </Badge>
                  <p className="text-sm text-muted-foreground">
                    {alerts.some((a) => a.severity === 'CRITICAL')
                      ? 'Patient may need immediate attention: BP and glucose have been high despite documented medication adherence.'
                      : 'Patient is stable and following their care plan.'}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent alerts</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {alerts.slice(0, 5).map((alert) => (
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
                            </div>
                            <h4 className="font-medium">{alert.title}</h4>
                            <p className="text-sm text-muted-foreground mt-1">{alert.body}</p>
                          </div>
                          {alert.status === 'ACTIVE' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleResolveAlert(alert.id)}
                            >
                              Resolve
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                    {alerts.length === 0 && (
                      <p className="text-sm text-muted-foreground">No recent alerts</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="metrics" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Blood Pressure</CardTitle>
              </CardHeader>
              <CardContent>
                {bpData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={bpData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="systolic" stroke="#2A7F79" name="Systolic" />
                      <Line type="monotone" dataKey="diastolic" stroke="#47C1B9" name="Diastolic" />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-muted-foreground">No blood pressure data available</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="plan">
            <Card>
              <CardHeader>
                <CardTitle>Care Plan</CardTitle>
                <CardDescription>3-month care plan phases</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Care plan data will be displayed here</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="alerts">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>All Alerts</CardTitle>
                  <div className="flex gap-2">
                    <select
                      value={alertStatusFilter}
                      onChange={(e) => setAlertStatusFilter(e.target.value)}
                      className="text-sm border rounded px-2 py-1"
                    >
                      <option value="all">All Status</option>
                      <option value="ACTIVE">Open</option>
                      <option value="ACTIVE">Active</option>
                      <option value="RESOLVED">Resolved</option>
                    </select>
                    <select
                      value={alertSeverityFilter}
                      onChange={(e) => setAlertSeverityFilter(e.target.value)}
                      className="text-sm border rounded px-2 py-1"
                    >
                      <option value="all">All Severity</option>
                      <option value="CRITICAL">Critical</option>
                      <option value="WARNING">Warning</option>
                      <option value="INFO">Info</option>
                    </select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredAlerts.map((alert) => (
                    <div key={alert.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
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
                            <Badge variant="outline">{alert.status}</Badge>
                            <span className="text-sm text-muted-foreground">
                              {new Date(alert.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <h4 className="font-medium mb-1">{alert.title}</h4>
                          <p className="text-sm text-muted-foreground">{alert.body}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => router.push(`/patients/${patientId}`)}
                        >
                          Open patient
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => router.push(`/messages?patient=${patientId}`)}
                        >
                          Send message
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleScheduleVisit}
                        >
                          Schedule follow-up
                        </Button>
                        {alert.status === 'ACTIVE' && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleUpdateAlertStatus(alert.id, 'ACTIVE')}
                            >
                              Mark in review
                            </Button>
                            <Button
                              size="sm"
                              variant="primary"
                              onClick={() => {
                                setSelectedAlert(alert);
                                setResolveDialogOpen(true);
                              }}
                            >
                              Resolve
                            </Button>
                          </>
                        )}
                        {alert.status === 'ACTIVE' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUpdateAlertStatus(alert.id, 'ACTIVE')}
                          >
                            Reopen
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                  {filteredAlerts.length === 0 && (
                    <p className="text-muted-foreground text-center py-8">No alerts match the selected filters</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Resolve Alert Dialog */}
        <Dialog open={resolveDialogOpen} onOpenChange={setResolveDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Resolve Alert</DialogTitle>
              <DialogDescription>
                Add a note about how this alert was resolved (e.g., &quot;Reviewed, BP stabilized&quot;).
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <label className="text-sm font-medium">Resolution note</label>
                <textarea
                  value={resolveNote}
                  onChange={(e) => setResolveNote(e.target.value)}
                  className="w-full mt-1 border rounded p-2 min-h-[100px]"
                  placeholder="e.g., Reviewed, BP stabilized after medication adjustment"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setResolveDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => selectedAlert && handleResolveAlert(selectedAlert.id, resolveNote)}
                disabled={!resolveNote.trim()}
              >
                Resolve
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add Note Dialog */}
        <Dialog open={noteDialogOpen} onOpenChange={setNoteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Internal Note</DialogTitle>
              <DialogDescription>
                Add a private note about this patient (visible only to clinic staff).
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <label className="text-sm font-medium">Note</label>
                <textarea
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  className="w-full mt-1 border rounded p-2 min-h-[100px]"
                  placeholder="Enter your note here..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setNoteDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddNote} disabled={!noteContent.trim()}>
                Save note
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

