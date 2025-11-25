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
    return <div className="text-center py-12 text-slate-900">Patient not found</div>;
  }

  const riskBadgeClasses: Record<string, string> = {
    high: 'bg-red-500 text-white',
    moderate: 'bg-amber-500 text-white',
    low: 'bg-emerald-500 text-white',
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
          <div className="w-16 h-16 rounded-full flex items-center justify-center bg-teal-50">
            <span className="font-semibold text-xl text-teal-600">
              {patient.name.charAt(0)}
            </span>
          </div>
          <div>
            <h1 className="text-h2 font-semibold text-slate-900">{patient.name}</h1>
            <p className="text-body text-slate-600">
              {patient.age} {patient.sex} • {patient.primaryDx}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <Badge className={riskBadgeClasses[patient.riskLevel] ?? riskBadgeClasses.low}>{patient.riskLevel}</Badge>
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
          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="text-h3 text-slate-900">Current Vitals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-50">
                  <div className="flex items-center gap-2 mb-2 text-slate-600">
                    <Heart className="w-4 h-4" />
                    <span className="text-small">Heart Rate</span>
                  </div>
                  <p className="text-h2 font-semibold text-slate-900">
                    {patient.latestVitals.heartRate}
                    <span className="text-small ml-1 text-slate-600">bpm</span>
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50">
                  <div className="flex items-center gap-2 mb-2 text-slate-600">
                    <Gauge className="w-4 h-4" />
                    <span className="text-small">Blood Pressure</span>
                  </div>
                  <p className="text-h2 font-semibold text-slate-900">
                    {patient.latestVitals.systolic}/{patient.latestVitals.diastolic}
                    <span className="text-small ml-1 text-slate-600">mmHg</span>
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50">
                  <div className="flex items-center gap-2 mb-2 text-slate-600">
                    <Activity className="w-4 h-4" />
                    <span className="text-small">HRV</span>
                  </div>
                  <p className="text-h2 font-semibold text-slate-900">
                    {patient.latestVitals.hrvMs}
                    <span className="text-small ml-1 text-slate-600">ms</span>
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50">
                  <div className="flex items-center gap-2 mb-2 text-slate-600">
                    <Scale className="w-4 h-4" />
                    <span className="text-small">BMI</span>
                  </div>
                  <p className="text-h2 font-semibold text-slate-900">
                    {patient.latestVitals.bmi.toFixed(1)}
                  </p>
                </div>
              </div>
              <p className="text-caption mt-4 text-slate-600">
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
          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="text-h3 text-slate-900">HRV & Recovery Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                    <XAxis dataKey="date" stroke="#64748B" fontSize={12} />
                    <YAxis stroke="#64748B" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #E2E8F0',
                        borderRadius: 12,
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="hrv"
                      stroke="#0f9d8a"
                      strokeWidth={2}
                      dot={{ fill: '#0f9d8a', r: 4 }}
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
          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="text-h3 text-slate-900">Active Care Plan</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <span className="mt-1 text-teal-600">•</span>
                  <span className="text-body text-slate-900">Nutrition plan A</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 text-teal-600">•</span>
                  <span className="text-body text-slate-900">Exercise plan B</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 text-teal-600">•</span>
                  <span className="text-body text-slate-900">Sleep hygiene steps</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Recent Notes */}
          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="text-h3 text-slate-900">Recent Notes</CardTitle>
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
                  <div key={idx} className="p-3 rounded-lg bg-slate-50">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-small font-medium text-slate-900">{note.author}</span>
                      <span className="text-caption text-slate-600">{note.date}</span>
                    </div>
                    <p className="text-small text-slate-600">{note.snippet}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Open Tasks */}
          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="text-h3 text-slate-900">Open Tasks for This Patient</CardTitle>
            </CardHeader>
            <CardContent>
              {patientTasks.length > 0 ? (
                <div className="space-y-2">
                  {patientTasks.map((task) => (
                    <div
                      key={task.id}
                      className="p-3 rounded-lg bg-slate-50 border border-slate-200"
                    >
                      <p className="text-small font-medium text-slate-900">{task.title}</p>
                      {task.dueDate && (
                        <p className="text-caption mt-1 text-slate-600">
                          Due: {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-small text-slate-600">No open tasks</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
