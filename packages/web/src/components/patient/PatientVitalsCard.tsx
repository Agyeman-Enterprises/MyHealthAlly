'use client';

import { useEffect, useState } from 'react';
import { getPatientVitalsSummary, type Metric } from '@/services/patient/vitals';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Heart, Activity, Droplet, Gauge, Scale } from 'lucide-react';

type Props = {
  title?: string;
  metrics?: { id: string }[];
};

const iconMap: { [key: string]: any } = {
  HEART_RATE: Heart,
  BLOOD_PRESSURE: Gauge,
  OXYGEN_SATURATION: Droplet,
  WEIGHT: Scale,
  GLUCOSE: Activity,
};

export function PatientVitalsCard({ title = 'Key Vitals', metrics }: Props) {
  const [data, setData] = useState<Metric[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getPatientVitalsSummary(metrics?.map(m => m.id))
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [metrics]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/80">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {data.map((metric) => {
            const Icon = iconMap[metric.id] || Activity;
            const statusColor =
              metric.status === 'high'
                ? 'text-red-600'
                : metric.status === 'low'
                ? 'text-yellow-600'
                : 'text-green-600';

            return (
              <div key={metric.id} className="flex flex-col p-3 rounded-lg bg-myh-surfaceSoft border border-myh-border">
                <div className="flex items-center gap-2 mb-1">
                  <Icon className="w-4 h-4 text-myh-textSoft" />
                  <span className="text-xs text-myh-textSoft">{metric.label}</span>
                </div>
                <span className={`text-base font-medium ${statusColor}`}>
                  {metric.value} {metric.unit && <span className="text-xs text-myh-textSoft">{metric.unit}</span>}
                </span>
              </div>
            );
          })}
        </div>
        {data.length === 0 && (
          <p className="text-sm text-myh-textSoft text-center py-4">No vitals data available</p>
        )}
      </CardContent>
    </Card>
  );
}

