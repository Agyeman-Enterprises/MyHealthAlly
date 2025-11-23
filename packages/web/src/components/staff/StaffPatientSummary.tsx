'use client';

import { useEffect, useState } from 'react';
import { fetchAPI } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, Activity, TrendingUp } from 'lucide-react';

type Props = {
  showAlerts?: boolean;
  patientId?: string;
};

export function StaffPatientSummary({ showAlerts = true, patientId }: Props) {
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (patientId) {
      loadSummary(patientId);
    } else {
      setLoading(false);
    }
  }, [patientId]);

  const loadSummary = async (id: string) => {
    try {
      const [alerts, measurements] = await Promise.all([
        fetchAPI(`/alerts?patientId=${id}&status=ACTIVE`).catch(() => []),
        fetchAPI(`/patients/${id}/measurements?limit=10`).catch(() => []),
      ]);

      setSummary({
        alerts: alerts.slice(0, 3),
        recentMeasurements: measurements.slice(0, 5),
      });
    } catch (error) {
      console.error('Failed to load patient summary:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-48 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!summary) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Patient Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-myh-textSoft">Select a patient to view summary</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Patient Summary</CardTitle>
      </CardHeader>
      <CardContent>
        {showAlerts && summary.alerts && summary.alerts.length > 0 && (
          <div className="mb-4">
            <h3 className="text-sm font-medium text-myh-text mb-2">Active Alerts</h3>
            <div className="space-y-2">
              {summary.alerts.map((alert: any) => (
                <div
                  key={alert.id}
                  className="flex items-start gap-2 p-2 bg-red-50 border border-red-200 rounded-lg"
                >
                  <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-red-900">{alert.title}</p>
                    <p className="text-xs text-red-700">{alert.body}</p>
                  </div>
                  <Badge variant="destructive" className="text-xs">
                    {alert.severity}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {summary.recentMeasurements && summary.recentMeasurements.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-myh-text mb-2">Recent Measurements</h3>
            <div className="space-y-1">
              {summary.recentMeasurements.map((m: any) => (
                <div key={m.id} className="flex items-center justify-between text-sm">
                  <span className="text-myh-textSoft">{m.type}</span>
                  <span className="font-medium text-myh-text">
                    {typeof m.value === 'object' ? JSON.stringify(m.value) : m.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

