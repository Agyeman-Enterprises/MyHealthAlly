'use client';

import { useState, useEffect } from 'react';
import { GlowCard } from '@/components/ui/glow-card';
import { PrimaryButton } from '@/components/ui/primary-button';
import FloatingNav from '@/components/patient/FloatingNav';

interface Vitals {
  heartRate: number;
  bloodPressure: string;
  oxygen: number;
  recovery: number;
  sleepDepth: number;
}

export default function PatientDashboardPage() {
  const [vitals, setVitals] = useState<Vitals>({
    heartRate: 72,
    bloodPressure: '120/80',
    oxygen: 98,
    recovery: 85,
    sleepDepth: 7.5,
  });
  const [aiSummary, setAiSummary] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const runAnalysis = async () => {
    setLoading(true);
    const vitalsStr = `Heart rate: ${vitals.heartRate} bpm, Blood pressure: ${vitals.bloodPressure}, Oxygen: ${vitals.oxygen}%, Recovery: ${vitals.recovery}%, Sleep: ${vitals.sleepDepth} hours`;
    
    // Simulate API call
    setTimeout(() => {
      const prompt = `You are MyHealthAlly, a calm, clinically grounded health assistant. Analyze the following patient vitals: ${vitalsStr}. 1) Give a brief, reassuring 2–3 sentence summary in plain language. 2) Then give exactly one actionable next step labeled 'Next step:'. Avoid technical jargon. Be supportive, concise, and practical.`;
      
      // Fallback if no API key
      setAiSummary("Your health metrics are within normal ranges today. Your heart rate and blood pressure are stable, and your recovery score indicates good rest. Next step: Continue with your daily medication routine and aim for 8 hours of sleep tonight.");
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-myh-bg pb-24">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-myh-text">Welcome back, Alex</h1>
          <p className="text-myh-textSoft">Your health data is updating in real time.</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <GlowCard>
            <p className="text-xs text-myh-textSoft mb-1">Heart Rate</p>
            <p className="text-2xl font-semibold text-myh-text">{vitals.heartRate}</p>
            <p className="text-xs text-myh-textSoft">bpm</p>
          </GlowCard>
          <GlowCard>
            <p className="text-xs text-myh-textSoft mb-1">Blood Pressure</p>
            <p className="text-2xl font-semibold text-myh-text">{vitals.bloodPressure}</p>
            <p className="text-xs text-myh-textSoft">mmHg</p>
          </GlowCard>
          <GlowCard>
            <p className="text-xs text-myh-textSoft mb-1">O₂ Saturation</p>
            <p className="text-2xl font-semibold text-myh-text">{vitals.oxygen}%</p>
          </GlowCard>
          <GlowCard>
            <p className="text-xs text-myh-textSoft mb-1">Recovery score</p>
            <p className="text-2xl font-semibold text-myh-text">{vitals.recovery}%</p>
          </GlowCard>
        </div>

        <GlowCard className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-myh-text">AI Health Summary</h2>
            <PrimaryButton onClick={runAnalysis} disabled={loading} className="text-sm px-4 py-2">
              {loading ? 'Generating...' : 'Generate summary'}
            </PrimaryButton>
          </div>
          {aiSummary && (
            <div className="bg-myh-surfaceSoft rounded-lg p-4 border border-myh-border">
              <p className="text-myh-text text-sm leading-relaxed">{aiSummary}</p>
            </div>
          )}
        </GlowCard>

        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-myh-text">Your daily health snapshot</h2>
          <GlowCard>
            <div className="flex items-center justify-between mb-4">
              <span className="text-myh-textSoft">Recovery score</span>
              <span className="text-myh-text font-semibold">{vitals.recovery}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-myh-textSoft">Sleep quality</span>
              <span className="text-myh-text font-semibold">{vitals.sleepDepth} hrs</span>
            </div>
          </GlowCard>
        </div>
      </div>

      <FloatingNav />
    </div>
  );
}

