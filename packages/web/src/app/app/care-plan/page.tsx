'use client';

import { useState, useEffect, useCallback } from 'react';
import { GlowCard } from '@/components/ui/glow-card';
import FloatingNav from '@/components/patient/FloatingNav';
import { useAuth } from '@/contexts/AuthContext';
import { fetchAPI } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { CheckCircle2, Circle, Calendar, Target } from 'lucide-react';

export default function AppCarePlanPage() {
  const { patient, loading: authLoading } = useAuth();
  const [carePlan, setCarePlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadCarePlan = useCallback(async () => {
    if (!patient?.id) return;
    setLoading(true);
    try {
      const data = await fetchAPI(`/patients/${patient.id}/care-plans`);
      if (data && data.length > 0) {
        setCarePlan(data[0]);
      }
    } catch (error) {
      console.error('Failed to load care plan:', error);
    } finally {
      setLoading(false);
    }
  }, [patient?.id]);

  useEffect(() => {
    if (!authLoading && patient) {
      loadCarePlan();
    }
  }, [patient, authLoading, loadCarePlan]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-myh-bg pb-24 p-6">
        <Skeleton className="h-8 w-48 mb-4" />
        <Skeleton className="h-48 w-full mb-4" />
        <Skeleton className="h-32 w-full" />
        <FloatingNav />
      </div>
    );
  }

  const phases = carePlan?.phases || [
    {
      phase: 1,
      name: 'Foundation & Baseline',
      progress: 75,
      tasks: [
        { id: '1', title: 'Take medication daily', status: 'COMPLETED', type: 'MEDICATION' },
        { id: '2', title: 'Walk 30 minutes, 3x a week', status: 'DUE', type: 'HABIT' },
        { id: '3', title: 'Aim for 7-8 hours of sleep', status: 'DUE', type: 'HABIT' },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-myh-bg pb-24">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-myh-text">Your Care Plan</h1>
          <p className="text-myh-textSoft">Follow your personalized health journey</p>
        </div>

        {phases.map((phase: any) => (
          <GlowCard key={phase.phase} className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-myh-text">Phase {phase.phase}: {phase.name}</h2>
                <p className="text-sm text-myh-textSoft mt-1">Progress: {phase.progress}%</p>
              </div>
              <div className="w-16 h-16 rounded-full border-4 border-myh-primarySoft flex items-center justify-center">
                <span className="text-myh-primary font-semibold">{phase.progress}%</span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-myh-surfaceSoft rounded-full h-2 mb-6">
              <div
                className="bg-myh-primary h-2 rounded-full transition-all"
                style={{ width: `${phase.progress}%` }}
              />
            </div>

            {/* Tasks */}
            <div className="space-y-3">
              <h3 className="font-medium text-myh-text mb-3">Current Tasks</h3>
              {phase.tasks?.map((task: any) => (
                <div
                  key={task.id}
                  className="flex items-start gap-3 p-4 bg-myh-surfaceSoft rounded-lg border border-myh-border"
                >
                  {task.status === 'COMPLETED' ? (
                    <CheckCircle2 className="w-5 h-5 text-myh-primary mt-0.5 flex-shrink-0" />
                  ) : (
                    <Circle className="w-5 h-5 text-myh-border mt-0.5 flex-shrink-0" />
                  )}
                  <div className="flex-1">
                    <p className={`font-medium ${task.status === 'COMPLETED' ? 'text-myh-textSoft line-through' : 'text-myh-text'}`}>
                      {task.title}
                    </p>
                    {task.subtitle && (
                      <p className="text-sm text-myh-textSoft mt-1">{task.subtitle}</p>
                    )}
                    {task.dueDate && (
                      <div className="flex items-center gap-2 mt-2 text-xs text-myh-textSoft">
                        <Calendar className="w-3 h-3" />
                        <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      task.status === 'COMPLETED'
                        ? 'bg-myh-primarySoft text-myh-primary'
                        : task.status === 'OVERDUE'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-myh-surface text-myh-textSoft'
                    }`}
                  >
                    {task.status}
                  </span>
                </div>
              ))}
            </div>
          </GlowCard>
        ))}

        {!carePlan && (
          <GlowCard className="p-6 text-center">
            <Target className="w-12 h-12 mx-auto mb-4 text-myh-border" />
            <p className="text-myh-textSoft">No care plan assigned yet</p>
            <p className="text-sm text-myh-textSoft mt-2">Your care team will create a personalized plan for you soon.</p>
          </GlowCard>
        )}
      </div>

      <FloatingNav />
    </div>
  );
}

