'use client';

import { GlowCard } from '@/components/ui/glow-card';
import FloatingNav from '@/components/patient/FloatingNav';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Stable, non-random data for screenshots
const bpData = [
  { date: 'Mon', systolic: 118, diastolic: 78 },
  { date: 'Tue', systolic: 120, diastolic: 80 },
  { date: 'Wed', systolic: 122, diastolic: 79 },
  { date: 'Thu', systolic: 119, diastolic: 77 },
  { date: 'Fri', systolic: 121, diastolic: 80 },
  { date: 'Sat', systolic: 120, diastolic: 78 },
  { date: 'Sun', systolic: 118, diastolic: 77 },
];

export default function TrendsScreenshot() {
  return (
    <div className="min-h-screen bg-myh-bg pb-24" style={{ aspectRatio: '9/19.5', maxWidth: '430px', margin: '0 auto' }}>
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Text Overlay */}
        <div className="text-center mb-8 space-y-2">
          <h2 className="text-2xl font-semibold text-myh-text">Understand your numbers over time.</h2>
          <p className="text-myh-textSoft">Clear trends for blood pressure, glucose, weight, and sleep.</p>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-myh-text">Health trends</h1>
          <p className="text-myh-textSoft">Blood pressure (7 days)</p>
        </div>

        <GlowCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-myh-text font-medium">Current average</span>
            <span className="px-3 py-1 bg-myh-primarySoft text-myh-primary rounded-full text-sm font-medium">
              In a healthy range
            </span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={bpData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="date" stroke="#4B5563" />
              <YAxis stroke="#4B5563" />
              <Tooltip />
              <Line type="monotone" dataKey="systolic" stroke="#2A7F79" strokeWidth={2} name="Systolic" />
              <Line type="monotone" dataKey="diastolic" stroke="#47C1B9" strokeWidth={2} name="Diastolic" />
            </LineChart>
          </ResponsiveContainer>
        </GlowCard>

        <div className="grid grid-cols-2 gap-4">
          <GlowCard>
            <p className="text-xs text-myh-textSoft mb-1">Glucose trend</p>
            <p className="text-2xl font-semibold text-myh-text">↓ 5%</p>
            <p className="text-xs text-myh-textSoft">Improving</p>
          </GlowCard>
          <GlowCard>
            <p className="text-xs text-myh-textSoft mb-1">Weight trend</p>
            <p className="text-2xl font-semibold text-myh-text">→ Stable</p>
            <p className="text-xs text-myh-textSoft">Last 30 days</p>
          </GlowCard>
        </div>
      </div>

      <FloatingNav />
    </div>
  );
}

