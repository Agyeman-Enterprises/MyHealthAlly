'use client';

import { useState, useEffect, useCallback } from 'react';
import { GlowCard } from '@/components/ui/glow-card';
import FloatingNav from '@/components/patient/FloatingNav';
import { useAuth } from '@/contexts/AuthContext';
import { fetchAPI } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Heart, Activity, Droplet, Gauge } from 'lucide-react';

export default function AppVitalsPage() {
  const { patient, loading: authLoading } = useAuth();
  const [vitalsData, setVitalsData] = useState<any[]>([]);
  const [selectedMetric, setSelectedMetric] = useState<string>('HEART_RATE');
  const [loading, setLoading] = useState(true);

  const loadVitalsData = useCallback(async () => {
    if (!patient?.id) return;
    setLoading(true);
    try {
      const measurements = await fetchAPI(`/patients/${patient.id}/measurements?type=${selectedMetric}&limit=30`);
      const formatted = measurements
        .sort((a: any, b: any) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
        .map((m: any) => ({
          date: new Date(m.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          value: typeof m.value === 'object' ? (m.value as any).systolic || 0 : m.value,
        }));
      setVitalsData(formatted);
    } catch (error) {
      console.error('Failed to load vitals:', error);
    } finally {
      setLoading(false);
    }
  }, [patient?.id, selectedMetric]);

  useEffect(() => {
    if (!authLoading && patient) {
      loadVitalsData();
    }
  }, [patient, authLoading, loadVitalsData]);

  const metrics = [
    { id: 'HEART_RATE', label: 'Heart Rate', icon: Heart, unit: 'bpm' },
    { id: 'BLOOD_PRESSURE', label: 'Blood Pressure', icon: Gauge, unit: 'mmHg' },
    { id: 'OXYGEN_SATURATION', label: 'O₂ Saturation', icon: Droplet, unit: '%' },
    { id: 'HRV', label: 'Recovery (HRV)', icon: Activity, unit: 'ms' },
  ];

  const currentMetric = metrics.find(m => m.id === selectedMetric);
  const Icon = currentMetric?.icon || Heart;

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-myh-bg pb-24 p-6">
        <Skeleton className="h-8 w-48 mb-4" />
        <Skeleton className="h-64 w-full mb-4" />
        <FloatingNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-myh-bg pb-24">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-myh-text">Vitals & Trends</h1>
          <p className="text-myh-textSoft">Track your health metrics over time</p>
        </div>

        {/* Metric Selector */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {metrics.map((metric) => {
            const MetricIcon = metric.icon;
            return (
              <button
                key={metric.id}
                onClick={() => setSelectedMetric(metric.id)}
                className={`p-4 rounded-xl border transition-all ${
                  selectedMetric === metric.id
                    ? 'bg-myh-primary text-white border-myh-primary'
                    : 'bg-myh-surface border-myh-border text-myh-text hover:border-myh-primary'
                }`}
              >
                <MetricIcon className="w-5 h-5 mb-2 mx-auto" />
                <p className="text-xs font-medium">{metric.label}</p>
              </button>
            );
          })}
        </div>

        {/* Chart */}
        <GlowCard className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-myh-primarySoft rounded-lg flex items-center justify-center">
              <Icon className="w-5 h-5 text-myh-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-myh-text">{currentMetric?.label}</h3>
              <p className="text-sm text-myh-textSoft">Last 30 days</p>
            </div>
          </div>

          {vitalsData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={vitalsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="date" stroke="#4B5563" fontSize={12} />
                <YAxis stroke="#4B5563" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    borderRadius: '8px',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#2A7F79"
                  strokeWidth={2}
                  dot={{ fill: '#2A7F79', r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-myh-textSoft">
              <p>No data available for this metric yet.</p>
            </div>
          )}

          {vitalsData.length > 0 && (
            <div className="mt-4 pt-4 border-t border-myh-border">
              <div className="flex items-center justify-between text-sm">
                <span className="text-myh-textSoft">Latest reading</span>
                <span className="font-semibold text-myh-text">
                  {vitalsData[vitalsData.length - 1]?.value} {currentMetric?.unit}
                </span>
              </div>
            </div>
          )}
        </GlowCard>
      </div>

      <FloatingNav />
    </div>
  );
}

