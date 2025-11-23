'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { fetchAPI } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { CheckCircle2, Circle, Target } from 'lucide-react';
import { ProgressRing } from '@/components/ui/progress-ring';

type Props = {
  showProgress?: boolean;
};

export function PatientCarePlanCard({ showProgress = true }: Props) {
  const { patient, loading: authLoading } = useAuth();
  const [carePlan, setCarePlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!patient?.id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    fetchAPI(`/patients/${patient.id}/care-plans`)
      .then((data) => {
        if (data && data.length > 0) {
          setCarePlan(data[0]);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [patient?.id]);

  if (authLoading || loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    );
  }

  const phases = carePlan?.phases || [];
  const currentPhase = phases[0] || null;
  const progress = currentPhase?.progress || 0;

  if (!carePlan) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Your Care Plan</CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <Target className="w-12 h-12 mx-auto mb-4 text-myh-border" />
          <p className="text-myh-textSoft">No care plan assigned yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Your Care Plan</CardTitle>
        {currentPhase && (
          <p className="text-sm text-myh-textSoft">
            Phase {currentPhase.phase}: {currentPhase.name}
          </p>
        )}
      </CardHeader>
      <CardContent>
        {showProgress && currentPhase && (
          <div className="flex items-center gap-4 mb-4">
            <ProgressRing progress={progress} size={64} />
            <div className="flex-1">
              <p className="text-sm text-myh-textSoft mb-1">Overall Progress</p>
              <div className="w-full bg-myh-surfaceSoft rounded-full h-2">
                <div
                  className="bg-myh-primary h-2 rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {currentPhase?.tasks && currentPhase.tasks.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-myh-text mb-2">Current Tasks</h3>
            {currentPhase.tasks.slice(0, 3).map((task: any) => (
              <div
                key={task.id}
                className="flex items-start gap-2 p-2 bg-myh-surfaceSoft rounded-lg"
              >
                {task.status === 'COMPLETED' ? (
                  <CheckCircle2 className="w-4 h-4 text-myh-primary mt-0.5 flex-shrink-0" />
                ) : (
                  <Circle className="w-4 h-4 text-myh-border mt-0.5 flex-shrink-0" />
                )}
                <p className={`text-sm flex-1 ${task.status === 'COMPLETED' ? 'text-myh-textSoft line-through' : 'text-myh-text'}`}>
                  {task.title}
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

