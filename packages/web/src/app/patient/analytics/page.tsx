'use client';

import { useEffect, useState } from 'react';
import { PageContainer } from '@/components/layout/PageContainer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useVitals } from '@/hooks/useVitals';
import { useMetrics } from '@/hooks/useMetrics';
import { fetchAPI } from '@/lib/utils';
import { formatDate } from '@/utils/date';
import { calculateBMI, getBMICategory } from '@/utils/bmi';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, Activity } from 'lucide-react';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export default function PatientAnalyticsPage() {
  const { vitals } = useVitals();
  const { metrics, loading: metricsLoading } = useMetrics();
  const [selectedMetric, setSelectedMetric] = useState<string>('bmi');
  const [measurements, setMeasurements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<any>(null);

  useEffect(() => {
    loadAnalytics();
    loadMeasurements();
  }, [selectedMetric]);

  const loadAnalytics = async () => {
    try {
      const data = await fetchAPI('/patients/analytics');
      setAnalytics(data);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMeasurements = async () => {
    try {
      const data = await fetchAPI(`/patients/me/measurements?type=${selectedMetric}&limit=30`);
      setMeasurements(data || []);
    } catch (error) {
      console.error('Failed to load measurements:', error);
    }
  };

  const chartData = measurements.map((m: any) => ({
    date: formatDate(m.timestamp),
    value: typeof m.value === 'number' ? m.value : m.value?.value || 0,
  }));

  const selectedMetricConfig = metrics.find(m => m.id === selectedMetric);

  if (loading || metricsLoading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-body" style={{ color: 'var(--color-textSecondary)' }}>
            Loading...
          </div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="py-6 space-y-6">
        <div>
          <h1 className="text-h1 mb-2">Analytics</h1>
          <p className="text-body" style={{ color: 'var(--color-textSecondary)' }}>
            Track your health trends over time
          </p>
        </div>

        {/* Metric Selector */}
        <Card>
          <CardHeader>
            <CardTitle>Select Metric</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={selectedMetric} onValueChange={setSelectedMetric}>
              <SelectTrigger>
                <SelectValue placeholder="Select a metric" />
              </SelectTrigger>
              <SelectContent>
                {metrics.map(m => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Charts */}
        <Tabs defaultValue="trends">
          <TabsList>
            <TabsTrigger value="trends">Trends</TabsTrigger>
            <TabsTrigger value="bmi">BMI</TabsTrigger>
            <TabsTrigger value="hrv">HRV</TabsTrigger>
          </TabsList>

          <TabsContent value="trends">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
                  {selectedMetricConfig?.label || 'Trend'} Over Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                      <XAxis dataKey="date" stroke="var(--color-textSecondary)" />
                      <YAxis stroke="var(--color-textSecondary)" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'var(--color-surface)',
                          border: '1px solid var(--color-border)',
                          borderRadius: 'var(--radius)',
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke="var(--color-primary)"
                        strokeWidth={2}
                        dot={{ fill: 'var(--color-primary)', r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-64">
                    <p className="text-body" style={{ color: 'var(--color-textSecondary)' }}>
                      No data available for this metric
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bmi">
            <Card>
              <CardHeader>
                <CardTitle>BMI Trend</CardTitle>
              </CardHeader>
              <CardContent>
                {analytics?.bmi ? (
                  <div className="space-y-4">
                    <div className="p-4 border-radius" style={{
                      backgroundColor: 'var(--color-background)',
                      borderRadius: 'var(--radius)',
                    }}>
                      <div className="flex items-center justify-between">
                        <span className="text-body" style={{ color: 'var(--color-textSecondary)' }}>
                          Current BMI
                        </span>
                        <div className="flex items-center gap-3">
                          <span className="text-h2" style={{ color: 'var(--color-textPrimary)' }}>
                            {analytics.bmi.bmi.toFixed(1)}
                          </span>
                          <span
                            className="px-3 py-1 text-caption border-radius"
                            style={{
                              backgroundColor: getBMICategory(analytics.bmi.bmi).color + '20',
                              color: getBMICategory(analytics.bmi.bmi).color,
                              borderRadius: 'var(--radius)',
                            }}
                          >
                            {getBMICategory(analytics.bmi.bmi).label}
                          </span>
                        </div>
                      </div>
                    </div>
                    <p className="text-caption" style={{ color: 'var(--color-textSecondary)' }}>
                      Weight: {analytics.bmi.weightKg} kg | Height: {analytics.bmi.heightCm} cm
                    </p>
                  </div>
                ) : (
                  <p className="text-body" style={{ color: 'var(--color-textSecondary)' }}>
                    No BMI data available
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="hrv">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
                  HRV Recovery Trend
                </CardTitle>
              </CardHeader>
              <CardContent>
                {analytics?.hrvTrend && analytics.hrvTrend.length > 0 ? (
                  <div className="space-y-4">
                    <div className="p-4 border-radius" style={{
                      backgroundColor: 'var(--color-background)',
                      borderRadius: 'var(--radius)',
                    }}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-body" style={{ color: 'var(--color-textSecondary)' }}>
                          Recovery Score
                        </span>
                        <span className="text-h2" style={{ color: 'var(--color-primary)' }}>
                          {analytics.recoveryScore || 0}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-body" style={{ color: 'var(--color-textSecondary)' }}>
                          Stress Level
                        </span>
                        <span className="text-body font-medium" style={{ color: 'var(--color-textPrimary)' }}>
                          {analytics.stressLevel || 'moderate'}
                        </span>
                      </div>
                    </div>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={analytics.hrvTrend.map((p: any) => ({
                        date: formatDate(p.timestamp),
                        value: p.rmssdMs,
                      }))}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                        <XAxis dataKey="date" stroke="var(--color-textSecondary)" />
                        <YAxis stroke="var(--color-textSecondary)" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'var(--color-surface)',
                            border: '1px solid var(--color-border)',
                            borderRadius: 'var(--radius)',
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="value"
                          stroke="var(--color-primary)"
                          strokeWidth={2}
                          dot={{ fill: 'var(--color-primary)', r: 4 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <p className="text-body" style={{ color: 'var(--color-textSecondary)' }}>
                    No HRV data available
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PageContainer>
  );
}
