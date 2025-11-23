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
      <div className="min-h-screen bg-myh-bg pb-24 p-6">
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
    <div className="min-h-screen bg-myh-bg pb-24">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-myh-text">
            Welcome back, {patient?.firstName || 'there'}
          </h1>
          <p className="text-myh-textSoft">Your health at a glance</p>
        </div>

        {/* Wellness Score Card */}
        <GlowCard className="p-6 bg-gradient-to-br from-myh-primarySoft/50 to-myh-surface">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-myh-textSoft mb-1">Daily Wellness Score</p>
              <p className="text-4xl font-bold text-myh-primary">
                {wellnessScore !== null ? `${wellnessScore}%` : '—'}
              </p>
            </div>
            <div className="w-20 h-20 rounded-full bg-myh-primary/10 flex items-center justify-center">
              <Activity className="w-10 h-10 text-myh-primary" />
            </div>
          </div>
          <p className="text-sm text-myh-textSoft">
            {wellnessScore !== null && wellnessScore >= 80
              ? 'You\'re doing great! Keep up the good work.'
              : 'Track your vitals to see your score improve.'}
          </p>
        </GlowCard>

        {/* Vitals Grid */}
        <div className="grid grid-cols-2 gap-4">
          <GlowCard className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Heart className="w-4 h-4 text-myh-primary" />
              <p className="text-xs text-myh-textSoft">Heart Rate</p>
            </div>
            <p className="text-2xl font-semibold text-myh-text">{vitals.heartRate}</p>
            <p className="text-xs text-myh-textSoft">bpm</p>
          </GlowCard>

          <GlowCard className="p-4">
            <p className="text-xs text-myh-textSoft mb-2">Blood Pressure</p>
            <p className="text-2xl font-semibold text-myh-text">{vitals.bloodPressure}</p>
            <p className="text-xs text-myh-textSoft">mmHg</p>
          </GlowCard>

          <GlowCard className="p-4">
            <p className="text-xs text-myh-textSoft mb-2">O₂ Saturation</p>
            <p className="text-2xl font-semibold text-myh-text">{vitals.oxygen}</p>
            <p className="text-xs text-myh-textSoft">%</p>
          </GlowCard>

          <GlowCard className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-myh-primary" />
              <p className="text-xs text-myh-textSoft">Recovery</p>
            </div>
            <p className="text-2xl font-semibold text-myh-text">{vitals.recovery}</p>
            <p className="text-xs text-myh-textSoft">HRV</p>
          </GlowCard>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4">
          <Link href="/app/vitals">
            <GlowCard className="p-4 card-hover cursor-pointer">
              <p className="font-medium text-myh-text mb-1">View All Vitals</p>
              <p className="text-sm text-myh-textSoft">See detailed metrics</p>
            </GlowCard>
          </Link>
          <Link href="/app/care-plan">
            <GlowCard className="p-4 card-hover cursor-pointer">
              <p className="font-medium text-myh-text mb-1">Your Care Plan</p>
              <p className="text-sm text-myh-textSoft">Track your progress</p>
            </GlowCard>
          </Link>
        </div>
      </div>

      <FloatingNav />
    </div>
  );
}

