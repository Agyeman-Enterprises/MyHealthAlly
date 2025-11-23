'use client';

import { use } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Video, Apple, Activity, Heart, Gauge, Scale } from 'lucide-react';
import { getPatientById, getTasks } from '@/lib/clinician-demo-data';
import type { PatientSummary } from '@/lib/clinician-demo-data';

export default function PatientDetailPage({ params }: { params: Promise<{ patientId: string }> }) {
  const { patientId } = use(params);
  const patient = getPatientById(patientId);
  const patientTasks = getTasks({ patientId });

  if (!patient) {
    return <div className="text-center py-12" style={{ color: 'var(--color-textPrimary)' }}>Patient not found</div>;
  }

  const getRiskBadgeColor = (risk: string): React.CSSProperties => {
    switch (risk) {
      case 'high':
        return { backgroundColor: 'var(--color-danger)', color: '#FFFFFF' };
      case 'moderate':
        return { backgroundColor: 'var(--color-warning)', color: '#FFFFFF' };
      default:
        return { backgroundColor: 'var(--color-success)', color: '#FFFFFF' };
    }
  };

  const chartData = patient.hrvTrend.map((point) => ({
    date: point.date,
    hrv: point.hrvMs,
  }));

  return (
    <div className="space-y-6">
      {/* Patient Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--color-primaryLight)' }}>
            <span className="font-semibold text-xl" style={{ color: 'var(--color-primary)' }}>
              {patient.name.charAt(0)}
            </span>
          </div>
          <div>
            <h1 className="text-h2 font-semibold" style={{ color: 'var(--color-textPrimary)' }}>{patient.name}</h1>
            <p className="text-body" style={{ color: 'var(--color-textSecondary)' }}>
              {patient.age} {patient.sex} • {patient.primaryDx}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <Badge style={getRiskBadgeColor(patient.riskLevel)}>{patient.riskLevel}</Badge>
              {patient.devices.map((device) => (
                <Badge key={device} variant="outline" className="text-xs">
                  {device === 'Apple Watch' && <Apple className="w-3 h-3 mr-1" />}
                  {device}
                </Badge>
              ))}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/clinician/visit/new?patientId=${patient.id}`}>
            <Button variant="primary">
              <Video className="w-4 h-4 mr-2" />
              Start Virtual Visit
            </Button>
          </Link>
          <Button variant="outline">Add Task</Button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Vitals & Trends */}
        <div className="space-y-6">
          {/* Current Vitals */}
          <Card style={{ backgroundColor: 'var(--color-surface)' }}>
            <CardHeader>
              <CardTitle className="text-h3" style={{ color: 'var(--color-textPrimary)' }}>Current Vitals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--color-background)', borderRadius: 'var(--radius)' }}>
                  <div className="flex items-center gap-2 mb-2">
                    <Heart className="w-4 h-4" style={{ color: 'var(--color-textSecondary)' }} />
                    <span className="text-small" style={{ color: 'var(--color-textSecondary)' }}>Heart Rate</span>
                  </div>
                  <p className="text-h2 font-semibold" style={{ color: 'var(--color-textPrimary)' }}>
                    {patient.latestVitals.heartRate}
                    <span className="text-small ml-1" style={{ color: 'var(--color-textSecondary)' }}>bpm</span>
                  </p>
                </div>
                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--color-background)', borderRadius: 'var(--radius)' }}>
                  <div className="flex items-center gap-2 mb-2">
                    <Gauge className="w-4 h-4" style={{ color: 'var(--color-textSecondary)' }} />
                    <span className="text-small" style={{ color: 'var(--color-textSecondary)' }}>Blood Pressure</span>
                  </div>
                  <p className="text-h2 font-semibold" style={{ color: 'var(--color-textPrimary)' }}>
                    {patient.latestVitals.systolic}/{patient.latestVitals.diastolic}
                    <span className="text-small ml-1" style={{ color: 'var(--color-textSecondary)' }}>mmHg</span>
                  </p>
                </div>
                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--color-background)', borderRadius: 'var(--radius)' }}>
                  <div className="flex items-center gap-2 mb-2">
                    <Activity className="w-4 h-4" style={{ color: 'var(--color-textSecondary)' }} />
                    <span className="text-small" style={{ color: 'var(--color-textSecondary)' }}>HRV</span>
                  </div>
                  <p className="text-h2 font-semibold" style={{ color: 'var(--color-textPrimary)' }}>
                    {patient.latestVitals.hrvMs}
                    <span className="text-small ml-1" style={{ color: 'var(--color-textSecondary)' }}>ms</span>
                  </p>
                </div>
                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--color-background)', borderRadius: 'var(--radius)' }}>
                  <div className="flex items-center gap-2 mb-2">
                    <Scale className="w-4 h-4" style={{ color: 'var(--color-textSecondary)' }} />
                    <span className="text-small" style={{ color: 'var(--color-textSecondary)' }}>BMI</span>
                  </div>
                  <p className="text-h2 font-semibold" style={{ color: 'var(--color-textPrimary)' }}>
                    {patient.latestVitals.bmi.toFixed(1)}
                  </p>
                </div>
              </div>
              <p className="text-caption mt-4" style={{ color: 'var(--color-textSecondary)' }}>
                Last updated:{' '}
                {new Date(patient.latestVitals.timestamp).toLocaleString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit',
                })}
              </p>
            </CardContent>
          </Card>

          {/* HRV Trend */}
          <Card style={{ backgroundColor: 'var(--color-surface)' }}>
            <CardHeader>
              <CardTitle className="text-h3" style={{ color: 'var(--color-textPrimary)' }}>HRV & Recovery Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-line)" />
                    <XAxis dataKey="date" stroke="var(--color-textSecondary)" fontSize={12} />
                    <YAxis stroke="var(--color-textSecondary)" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--color-surface)',
                        border: '1px solid var(--color-border)',
                        borderRadius: 'var(--radius)',
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="hrv"
                      stroke="var(--color-primary)"
                      strokeWidth={2}
                      dot={{ fill: 'var(--color-primary)', r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: Care & Notes */}
        <div className="space-y-6">
          {/* Active Care Plan */}
          <Card style={{ backgroundColor: 'var(--color-surface)' }}>
            <CardHeader>
              <CardTitle className="text-h3" style={{ color: 'var(--color-textPrimary)' }}>Active Care Plan</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <span className="mt-1" style={{ color: 'var(--color-primary)' }}>•</span>
                  <span className="text-body" style={{ color: 'var(--color-textPrimary)' }}>Nutrition plan A</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1" style={{ color: 'var(--color-primary)' }}>•</span>
                  <span className="text-body" style={{ color: 'var(--color-textPrimary)' }}>Exercise plan B</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1" style={{ color: 'var(--color-primary)' }}>•</span>
                  <span className="text-body" style={{ color: 'var(--color-textPrimary)' }}>Sleep hygiene steps</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Recent Notes */}
          <Card style={{ backgroundColor: 'var(--color-surface)' }}>
            <CardHeader>
              <CardTitle className="text-h3" style={{ color: 'var(--color-textPrimary)' }}>Recent Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    date: '2024-01-18',
                    author: 'Dr. Smith',
                    snippet: 'Patient reports improvement in symptoms...',
                  },
                  {
                    date: '2024-01-15',
                    author: 'Dr. Smith',
                    snippet: 'Follow-up on medication adjustments...',
                  },
                  {
                    date: '2024-01-10',
                    author: 'Dr. Smith',
                    snippet: 'Initial consultation completed...',
                  },
                ].map((note, idx) => (
                  <div key={idx} className="p-3 rounded-lg" style={{ backgroundColor: 'var(--color-background)', borderRadius: 'var(--radius)' }}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-small font-medium" style={{ color: 'var(--color-textPrimary)' }}>{note.author}</span>
                      <span className="text-caption" style={{ color: 'var(--color-textSecondary)' }}>{note.date}</span>
                    </div>
                    <p className="text-small" style={{ color: 'var(--color-textSecondary)' }}>{note.snippet}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Open Tasks */}
          <Card style={{ backgroundColor: 'var(--color-surface)' }}>
            <CardHeader>
              <CardTitle className="text-h3" style={{ color: 'var(--color-textPrimary)' }}>Open Tasks for This Patient</CardTitle>
            </CardHeader>
            <CardContent>
              {patientTasks.length > 0 ? (
                <div className="space-y-2">
                  {patientTasks.map((task) => (
                    <div
                      key={task.id}
                      className="p-3 rounded-lg"
                      style={{ 
                        backgroundColor: 'var(--color-background)', 
                        border: '1px solid var(--color-border)',
                        borderRadius: 'var(--radius)',
                      }}
                    >
                      <p className="text-small font-medium" style={{ color: 'var(--color-textPrimary)' }}>{task.title}</p>
                      {task.dueDate && (
                        <p className="text-caption mt-1" style={{ color: 'var(--color-textSecondary)' }}>
                          Due: {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-small" style={{ color: 'var(--color-textSecondary)' }}>No open tasks</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
