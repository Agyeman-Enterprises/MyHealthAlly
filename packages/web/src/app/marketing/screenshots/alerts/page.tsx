'use client';

import { GlowCard } from '@/components/ui/glow-card';
import FloatingNav from '@/components/patient/FloatingNav';
import { AlertTriangle } from 'lucide-react';

export default function AlertsScreenshot() {
  return (
    <div className="min-h-screen bg-myh-bg pb-24" style={{ aspectRatio: '9/19.5', maxWidth: '430px', margin: '0 auto' }}>
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Text Overlay */}
        <div className="text-center mb-8 space-y-2">
          <h2 className="text-2xl font-semibold text-myh-text">Get support when something needs attention.</h2>
          <p className="text-myh-textSoft">Thoughtful alerts help you and your clinic catch changes early.</p>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-myh-text">Health alerts</h1>
        </div>

        {/* Alert Card */}
        <GlowCard className="p-6 border-l-4 border-myh-warning">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-amber-50 rounded-full flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-myh-text mb-2">Blood pressure monitoring</h3>
              <p className="text-sm text-myh-textSoft leading-relaxed mb-4">
                Your blood pressure has been slightly above your target range over the past few days. Let&apos;s keep an eye on it together.
              </p>
              <div className="flex gap-2">
                <button className="px-4 py-2 bg-myh-primary text-white rounded-lg text-sm font-medium">
                  Message care team
                </button>
                <button className="px-4 py-2 bg-myh-surface border border-myh-border text-myh-text rounded-lg text-sm font-medium">
                  Learn more
                </button>
              </div>
            </div>
          </div>
        </GlowCard>

        {/* Additional context */}
        <GlowCard className="p-4">
          <p className="text-sm text-myh-textSoft">
            <strong className="text-myh-text">Last reading:</strong> 128/82 mmHg (2 hours ago)
          </p>
          <p className="text-sm text-myh-textSoft mt-2">
            <strong className="text-myh-text">Target range:</strong> Below 120/80 mmHg
          </p>
        </GlowCard>
      </div>

      <FloatingNav />
    </div>
  );
}

