'use client';

import { useState, useEffect, useCallback } from 'react';
import { GlowCard } from '@/components/ui/glow-card';
import { PrimaryButton } from '@/components/ui/primary-button';
import FloatingNav from '@/components/patient/FloatingNav';
import { useAuth } from '@/contexts/AuthContext';
import { fetchAPI } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { Heart, Activity, TrendingUp } from 'lucide-react';
import Link from 'next/link';

export default function AppHomePage() {
  const { patient, loading: authLoading } = useAuth();
  const [vitals, setVitals] = useState({
    heartRate: '—',
    bloodPressure: '—',
    oxygen: '—',
    recovery: '—',
  });
  const [wellnessScore, setWellnessScore] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!patient?.id) return;
    setLoading(true);
    try {
      const measurements = await fetchAPI(`/patients/${patient.id}/measurements?limit=10`);
      const latest: { [key: string]: any } = {};
      measurements.forEach((m: any) => {
        if (!latest[m.type] || new Date(m.timestamp) > new Date(latest[m.type].timestamp)) {
          latest[m.type] = m;
        }
      });

      setVitals({
        heartRate: latest.HEART_RATE?.value || '—',
        bloodPressure: latest.BLOOD_PRESSURE
          ? `${(latest.BLOOD_PRESSURE.value as any).systolic}/${(latest.BLOOD_PRESSURE.value as any).diastolic}`
          : '—',
        oxygen: latest.OXYGEN_SATURATION?.value || '—',
        recovery: latest.HRV?.value || '—',
      });

      // Calculate wellness score (simplified)
      const score = calculateWellnessScore(latest);
      setWellnessScore(score);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  }, [patient?.id]);

  useEffect(() => {
    if (!authLoading && patient) {
      loadData();
    }
  }, [patient, authLoading, loadData]);

  const calculateWellnessScore = (latest: any): number => {
    // Simplified wellness score calculation
    let score = 85; // Base score
    if (latest.HEART_RATE && typeof latest.HEART_RATE.value === 'number') {
      if (latest.HEART_RATE.value >= 60 && latest.HEART_RATE.value <= 100) score += 5;
    }
    if (latest.OXYGEN_SATURATION && typeof latest.OXYGEN_SATURATION.value === 'number') {
      if (latest.OXYGEN_SATURATION.value >= 95) score += 5;
    }
    return Math.min(100, score);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen pb-24 p-6 bg-gradient-to-br from-slate-50 to-teal-50">
        <Skeleton className="h-8 w-48 mb-4" />
        <Skeleton className="h-32 w-full mb-4" />
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
        <FloatingNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 bg-gradient-to-br from-slate-50 to-teal-50">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-slate-900">
            Welcome back, {patient?.firstName || 'there'}
          </h1>
          <p className="text-slate-600">Your health at a glance</p>
        </div>

        {/* Wellness Score Card */}
        <GlowCard className="p-6 bg-gradient-to-br from-teal-50/50 to-white">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm mb-1 text-slate-600">Daily Wellness Score</p>
              <p className="text-4xl font-bold text-teal-600">
                {wellnessScore !== null ? `${wellnessScore}%` : '—'}
              </p>
            </div>
            <div className="w-20 h-20 rounded-full flex items-center justify-center bg-teal-50">
              <Activity className="w-10 h-10 text-teal-600" />
            </div>
          </div>
          <p className="text-sm text-slate-600">
            {wellnessScore !== null && wellnessScore >= 80
              ? 'You\'re doing great! Keep up the good work.'
              : 'Track your vitals to see your score improve.'}
          </p>
        </GlowCard>

        {/* Vitals Grid */}
        <div className="grid grid-cols-2 gap-4">
          <GlowCard className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Heart className="w-4 h-4 text-teal-600" />
              <p className="text-xs text-slate-600">Heart Rate</p>
            </div>
            <p className="text-2xl font-semibold text-slate-900">{vitals.heartRate}</p>
            <p className="text-xs text-slate-600">bpm</p>
          </GlowCard>

          <GlowCard className="p-4">
            <p className="text-xs mb-2 text-slate-600">Blood Pressure</p>
            <p className="text-2xl font-semibold text-slate-900">{vitals.bloodPressure}</p>
            <p className="text-xs text-slate-600">mmHg</p>
          </GlowCard>

          <GlowCard className="p-4">
            <p className="text-xs mb-2 text-slate-600">O₂ Saturation</p>
            <p className="text-2xl font-semibold text-slate-900">{vitals.oxygen}</p>
            <p className="text-xs text-slate-600">%</p>
          </GlowCard>

          <GlowCard className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-teal-600" />
              <p className="text-xs text-slate-600">Recovery</p>
            </div>
            <p className="text-2xl font-semibold text-slate-900">{vitals.recovery}</p>
            <p className="text-xs text-slate-600">HRV</p>
          </GlowCard>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4">
          <Link href="/app/vitals">
            <GlowCard className="p-4 card-hover cursor-pointer">
              <p className="font-medium mb-1 text-slate-900">View All Vitals</p>
              <p className="text-sm text-slate-600">See detailed metrics</p>
            </GlowCard>
          </Link>
          <Link href="/app/care-plan">
            <GlowCard className="p-4 card-hover cursor-pointer">
              <p className="font-medium mb-1 text-slate-900">Your Care Plan</p>
              <p className="text-sm text-slate-600">Track your progress</p>
            </GlowCard>
          </Link>
        </div>
      </div>

      <FloatingNav />
    </div>
  );
}
