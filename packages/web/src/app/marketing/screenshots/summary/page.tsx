'use client';

import { GlowCard } from '@/components/ui/glow-card';
import FloatingNav from '@/components/patient/FloatingNav';
import { PrimaryButton } from '@/components/ui/primary-button';

export default function SummaryScreenshot() {
  return (
    <div className="min-h-screen bg-myh-bg pb-24" style={{ aspectRatio: '9/19.5', maxWidth: '430px', margin: '0 auto' }}>
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Text Overlay */}
        <div className="text-center mb-8 space-y-2">
          <h2 className="text-2xl font-semibold text-myh-text">A calm summary of how you&apos;re doing.</h2>
          <p className="text-myh-textSoft">MyHealthAlly turns your health data into simple, encouraging check-ins.</p>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-myh-text">Weekly health summary</h1>
          <p className="text-myh-textSoft">Week of Dec 8 - Dec 14</p>
        </div>

        <GlowCard className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-myh-text">AI Health Summary</h2>
            <span className="px-3 py-1 bg-myh-primarySoft text-myh-primary rounded-full text-xs font-medium">
              This week
            </span>
          </div>
          
          <div className="bg-myh-surfaceSoft rounded-lg p-4 border border-myh-border space-y-3">
            <p className="text-myh-text text-sm leading-relaxed">
              Your health metrics have been stable this week. Your blood pressure readings are consistently within your target range, and your glucose levels have improved slightly. Your sleep quality has been good, averaging 7.5 hours per night.
            </p>
            <div className="pt-3 border-t border-myh-border">
              <p className="text-sm font-medium text-myh-text mb-1">Next step:</p>
              <p className="text-sm text-myh-textSoft">
                Continue with your current medication routine and aim to maintain your sleep schedule. Keep tracking your daily readings.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 pt-4 border-t border-myh-border">
            <div className="text-center">
              <p className="text-2xl font-semibold text-myh-text">↓ 3%</p>
              <p className="text-xs text-myh-textSoft">BP trend</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-semibold text-myh-text">↓ 5%</p>
              <p className="text-xs text-myh-textSoft">Glucose</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-semibold text-myh-text">85%</p>
              <p className="text-xs text-myh-textSoft">Adherence</p>
            </div>
          </div>
        </GlowCard>
      </div>

      <FloatingNav />
    </div>
  );
}

