'use client';

import { GlowCard } from '@/components/ui/glow-card';
import FloatingNav from '@/components/patient/FloatingNav';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const hrvData = [
  { date: 'Mon', value: 45 },
  { date: 'Tue', value: 48 },
  { date: 'Wed', value: 42 },
  { date: 'Thu', value: 50 },
  { date: 'Fri', value: 47 },
  { date: 'Sat', value: 49 },
  { date: 'Sun', value: 46 },
];

export default function PatientAnalyticsPage() {
  return (
    <div className="min-h-screen bg-myh-bg pb-24">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-myh-text">Health trends</h1>
          <p className="text-myh-textSoft">Recovery (HRV)</p>
        </div>

        <GlowCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-myh-text font-medium">Current HRV</span>
            <span className="px-3 py-1 bg-myh-primarySoft text-myh-primary rounded-full text-sm font-medium">
              In a healthy range
            </span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={hrvData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="date" stroke="#4B5563" />
              <YAxis stroke="#4B5563" />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#2A7F79" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </GlowCard>

        <div className="grid grid-cols-2 gap-4">
          <GlowCard>
            <p className="text-xs text-myh-textSoft mb-1">Resting heart rate</p>
            <p className="text-2xl font-semibold text-myh-text">68</p>
            <p className="text-xs text-myh-textSoft">bpm</p>
          </GlowCard>
          <GlowCard>
            <p className="text-xs text-myh-textSoft mb-1">O₂ saturation</p>
            <p className="text-2xl font-semibold text-myh-text">98%</p>
          </GlowCard>
          <GlowCard>
            <p className="text-xs text-myh-textSoft mb-1">Breathing rate</p>
            <p className="text-2xl font-semibold text-myh-text">14</p>
            <p className="text-xs text-myh-textSoft">breaths/min</p>
          </GlowCard>
          <GlowCard>
            <p className="text-xs text-myh-textSoft mb-1">Recovery</p>
            <p className="text-2xl font-semibold text-myh-text">85%</p>
          </GlowCard>
        </div>
      </div>

      <FloatingNav />
    </div>
  );
}

