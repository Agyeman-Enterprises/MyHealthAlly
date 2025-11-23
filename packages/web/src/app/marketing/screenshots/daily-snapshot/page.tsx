'use client';

import { GlowCard } from '@/components/ui/glow-card';
import FloatingNav from '@/components/patient/FloatingNav';

export default function DailySnapshotScreenshot() {
  return (
    <div className="min-h-screen bg-myh-bg pb-24" style={{ aspectRatio: '9/19.5', maxWidth: '430px', margin: '0 auto' }}>
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Text Overlay */}
        <div className="text-center mb-8 space-y-2">
          <h2 className="text-2xl font-semibold text-myh-text">See your health at a glance.</h2>
          <p className="text-myh-textSoft">Daily vitals and gentle reminders in one place.</p>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-myh-text">Welcome back, Alex</h1>
          <p className="text-myh-textSoft">Your health data is updating in real time.</p>
        </div>

        {/* Daily Wellness Score */}
        <GlowCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-myh-textSoft">Today&apos;s wellness score</span>
            <span className="text-3xl font-semibold text-myh-primary">85%</span>
          </div>
          <div className="w-full bg-myh-surfaceSoft rounded-full h-2">
            <div className="bg-myh-primary h-2 rounded-full" style={{ width: '85%' }}></div>
          </div>
        </GlowCard>

        {/* Vitals Grid */}
        <div className="grid grid-cols-2 gap-4">
          <GlowCard>
            <p className="text-xs text-myh-textSoft mb-1">Blood Pressure</p>
            <p className="text-2xl font-semibold text-myh-text">120/80</p>
            <p className="text-xs text-myh-textSoft">mmHg</p>
          </GlowCard>
          <GlowCard>
            <p className="text-xs text-myh-textSoft mb-1">Glucose</p>
            <p className="text-2xl font-semibold text-myh-text">98</p>
            <p className="text-xs text-myh-textSoft">mg/dL</p>
          </GlowCard>
          <GlowCard>
            <p className="text-xs text-myh-textSoft mb-1">Sleep</p>
            <p className="text-2xl font-semibold text-myh-text">7.5</p>
            <p className="text-xs text-myh-textSoft">hours</p>
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

