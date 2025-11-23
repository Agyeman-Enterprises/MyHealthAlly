'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, Activity, Droplet, Gauge, Scale } from 'lucide-react';

export type VitalsCardProps = {
  name?: string; // "Alex"
  heartRate?: number; // bpm
  spo2?: number; // %
  respiration?: number; // breaths/min
  bmi?: number; // 0–60
  bmiLabel?: string; // "Healthy", "Overweight", etc.
  recoveryScore?: number; // 0–100
  stressLevel?: 'low' | 'moderate' | 'high';
};

export function VitalsCard(props: VitalsCardProps) {
  const {
    name = 'Patient',
    heartRate,
    spo2,
    respiration,
    bmi,
    bmiLabel,
    recoveryScore,
    stressLevel = 'moderate',
  } = props;

  const getBMIColor = (bmiValue?: number): string => {
    if (!bmiValue) return 'var(--color-textSecondary)';
    if (bmiValue < 18.5) return 'var(--color-info)';
    if (bmiValue < 25) return 'var(--color-success)';
    if (bmiValue < 30) return 'var(--color-warning)';
    return 'var(--color-danger)';
  };

  const getStressColor = (level: string): string => {
    switch (level) {
      case 'low':
        return 'var(--color-success)';
      case 'moderate':
        return 'var(--color-warning)';
      case 'high':
        return 'var(--color-danger)';
      default:
        return 'var(--color-textSecondary)';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">
          {name}&apos;s Vitals
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {heartRate !== undefined && (
            <div className="flex flex-col p-3 rounded-lg bg-myh-surfaceSoft border border-myh-border">
              <div className="flex items-center gap-2 mb-1">
                <Heart className="w-4 h-4 text-myh-textSoft" />
                <span className="text-xs text-myh-textSoft">Heart Rate</span>
              </div>
              <span className="text-xl font-semibold text-myh-text">
                {heartRate}
                <span className="text-sm text-myh-textSoft ml-1">bpm</span>
              </span>
            </div>
          )}

          {spo2 !== undefined && (
            <div className="flex flex-col p-3 rounded-lg bg-myh-surfaceSoft border border-myh-border">
              <div className="flex items-center gap-2 mb-1">
                <Droplet className="w-4 h-4 text-myh-textSoft" />
                <span className="text-xs text-myh-textSoft">O₂ Saturation</span>
              </div>
              <span className="text-xl font-semibold text-myh-text">
                {spo2}
                <span className="text-sm text-myh-textSoft ml-1">%</span>
              </span>
            </div>
          )}

          {respiration !== undefined && (
            <div className="flex flex-col p-3 rounded-lg bg-myh-surfaceSoft border border-myh-border">
              <div className="flex items-center gap-2 mb-1">
                <Activity className="w-4 h-4 text-myh-textSoft" />
                <span className="text-xs text-myh-textSoft">Respiration</span>
              </div>
              <span className="text-xl font-semibold text-myh-text">
                {respiration}
                <span className="text-sm text-myh-textSoft ml-1">/min</span>
              </span>
            </div>
          )}

          {bmi !== undefined && (
            <div className="flex flex-col p-3 rounded-lg bg-myh-surfaceSoft border border-myh-border">
              <div className="flex items-center gap-2 mb-1">
                <Scale className="w-4 h-4 text-myh-textSoft" />
                <span className="text-xs text-myh-textSoft">BMI</span>
              </div>
              <span className="text-xl font-semibold" style={{ color: getBMIColor(bmi) }}>
                {bmi.toFixed(1)}
              </span>
              {bmiLabel && (
                <span className="text-xs text-myh-textSoft mt-1">{bmiLabel}</span>
              )}
            </div>
          )}

          {recoveryScore !== undefined && (
            <div className="flex flex-col p-3 rounded-lg bg-myh-surfaceSoft border border-myh-border">
              <div className="flex items-center gap-2 mb-1">
                <Activity className="w-4 h-4 text-myh-textSoft" />
                <span className="text-xs text-myh-textSoft">Recovery</span>
              </div>
              <span className="text-xl font-semibold text-myh-text">
                {recoveryScore}
                <span className="text-sm text-myh-textSoft ml-1">/100</span>
              </span>
            </div>
          )}

          {stressLevel && (
            <div className="flex flex-col p-3 rounded-lg bg-myh-surfaceSoft border border-myh-border">
              <div className="flex items-center gap-2 mb-1">
                <Gauge className="w-4 h-4 text-myh-textSoft" />
                <span className="text-xs text-myh-textSoft">Stress</span>
              </div>
              <span className="text-lg font-semibold capitalize" style={{ color: getStressColor(stressLevel) }}>
                {stressLevel}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

