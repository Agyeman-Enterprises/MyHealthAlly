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
    return <div className="text-center py-12">Patient not found</div>;
  }

  const getRiskBadgeColor = (risk: string) => {
    switch (risk) {
      case 'high':
        return 'bg-clinician-danger text-white';
      case 'moderate':
        return 'bg-clinician-warning text-white';
      default:
        return 'bg-clinician-good text-white';
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
          <div className="w-16 h-16 rounded-full bg-clinician-primary-soft flex items-center justify-center">
            <span className="text-clinician-primary font-semibold text-xl">
              {patient.name.charAt(0)}
            </span>
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-clinician-text">{patient.name}</h1>
            <p className="text-clinician-textMuted">
              {patient.age} {patient.sex} • {patient.primaryDx}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <Badge className={getRiskBadgeColor(patient.riskLevel)}>{patient.riskLevel}</Badge>
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
            <Button className="bg-clinician-primary hover:bg-clinician-primary-soft">
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
          <Card className="bg-clinician-surface">
            <CardHeader>
              <CardTitle className="text-clinician-text">Current Vitals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-clinician-panel">
                  <div className="flex items-center gap-2 mb-2">
                    <Heart className="w-4 h-4 text-clinician-textMuted" />
                    <span className="text-sm text-clinician-textMuted">Heart Rate</span>
                  </div>
                  <p className="text-2xl font-semibold text-clinician-text">
                    {patient.latestVitals.heartRate}
                    <span className="text-sm text-clinician-textMuted ml-1">bpm</span>
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-clinician-panel">
                  <div className="flex items-center gap-2 mb-2">
                    <Gauge className="w-4 h-4 text-clinician-textMuted" />
                    <span className="text-sm text-clinician-textMuted">Blood Pressure</span>
                  </div>
                  <p className="text-2xl font-semibold text-clinician-text">
                    {patient.latestVitals.systolic}/{patient.latestVitals.diastolic}
                    <span className="text-sm text-clinician-textMuted ml-1">mmHg</span>
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-clinician-panel">
                  <div className="flex items-center gap-2 mb-2">
                    <Activity className="w-4 h-4 text-clinician-textMuted" />
                    <span className="text-sm text-clinician-textMuted">HRV</span>
                  </div>
                  <p className="text-2xl font-semibold text-clinician-text">
                    {patient.latestVitals.hrvMs}
                    <span className="text-sm text-clinician-textMuted ml-1">ms</span>
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-clinician-panel">
                  <div className="flex items-center gap-2 mb-2">
                    <Scale className="w-4 h-4 text-clinician-textMuted" />
                    <span className="text-sm text-clinician-textMuted">BMI</span>
                  </div>
                  <p className="text-2xl font-semibold text-clinician-text">
                    {patient.latestVitals.bmi.toFixed(1)}
                  </p>
                </div>
              </div>
              <p className="text-xs text-clinician-textMuted mt-4">
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
          <Card className="bg-clinician-surface">
            <CardHeader>
              <CardTitle className="text-clinician-text">HRV & Recovery Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ECF7F7" />
                    <XAxis dataKey="date" stroke="#6B7C93" fontSize={12} />
                    <YAxis stroke="#6B7C93" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #ECF7F7',
                        borderRadius: '8px',
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="hrv"
                      stroke="#0FB5B3"
                      strokeWidth={2}
                      dot={{ fill: '#0FB5B3', r: 4 }}
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
          <Card className="bg-clinician-surface">
            <CardHeader>
              <CardTitle className="text-clinician-text">Active Care Plan</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-clinician-primary mt-1">•</span>
                  <span className="text-clinician-text">Nutrition plan A</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-clinician-primary mt-1">•</span>
                  <span className="text-clinician-text">Exercise plan B</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-clinician-primary mt-1">•</span>
                  <span className="text-clinician-text">Sleep hygiene steps</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Recent Notes */}
          <Card className="bg-clinician-surface">
            <CardHeader>
              <CardTitle className="text-clinician-text">Recent Notes</CardTitle>
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
                  <div key={idx} className="p-3 rounded-lg bg-clinician-panel">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-clinician-text">{note.author}</span>
                      <span className="text-xs text-clinician-textMuted">{note.date}</span>
                    </div>
                    <p className="text-sm text-clinician-textMuted">{note.snippet}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Open Tasks */}
          <Card className="bg-clinician-surface">
            <CardHeader>
              <CardTitle className="text-clinician-text">Open Tasks for This Patient</CardTitle>
            </CardHeader>
            <CardContent>
              {patientTasks.length > 0 ? (
                <div className="space-y-2">
                  {patientTasks.map((task) => (
                    <div
                      key={task.id}
                      className="p-3 rounded-lg bg-clinician-panel border border-clinician-panel"
                    >
                      <p className="text-sm font-medium text-clinician-text">{task.title}</p>
                      {task.dueDate && (
                        <p className="text-xs text-clinician-textMuted mt-1">
                          Due: {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-clinician-textMuted">No open tasks</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

