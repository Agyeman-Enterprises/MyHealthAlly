'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { fetchAPI } from '@/lib/utils';
import { Patient, Alert, RiskLevel } from '@myhealthally/shared';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function PatientDetailPage() {
  const router = useRouter();
  const params = useParams();
  const patientId = params.id as string;
  
  const [patient, setPatient] = useState<Patient | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [measurements, setMeasurements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

  const handleResolveAlert = async (alertId: string) => {
    try {
      await fetchAPI(`/alerts/${alertId}/resolve`, { method: 'PATCH' });
      loadPatientData();
    } catch (error) {
      console.error('Failed to resolve alert:', error);
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

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-semibold">
              {patient.firstName} {patient.lastName}
            </h1>
            <p className="text-muted-foreground mt-2">Patient ID: {patient.id}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">Message patient</Button>
            <Button onClick={handleScheduleVisit}>Schedule visit</Button>
          </div>
        </div>

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
                <CardTitle>All Alerts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {alerts.map((alert) => (
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
                            <span className="text-sm text-muted-foreground">
                              {new Date(alert.createdAt).toLocaleDateString()}
                            </span>
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
                    <p className="text-muted-foreground">No alerts</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

