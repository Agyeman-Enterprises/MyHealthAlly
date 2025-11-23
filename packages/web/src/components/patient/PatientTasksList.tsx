'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { fetchAPI } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { CheckCircle2, Circle, Calendar } from 'lucide-react';

type Props = {
  maxItems?: number;
};

export function PatientTasksList({ maxItems = 5 }: Props) {
  const { patient, loading: authLoading } = useAuth();
  const [tasks, setTasks] = useState<any[]>([]);
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
          const carePlan = data[0];
          const allTasks: any[] = [];
          (carePlan.phases || []).forEach((phase: any) => {
            (phase.tasks || []).forEach((task: any) => {
              allTasks.push({ ...task, phaseName: phase.name });
            });
          });
          setTasks(allTasks.slice(0, maxItems));
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [patient?.id, maxItems]);

  if (authLoading || loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Your Tasks</CardTitle>
      </CardHeader>
      <CardContent>
        {tasks.length > 0 ? (
          <div className="space-y-2">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="flex items-start gap-3 p-3 bg-myh-surfaceSoft rounded-lg border border-myh-border"
              >
                {task.status === 'COMPLETED' ? (
                  <CheckCircle2 className="w-5 h-5 text-myh-primary mt-0.5 flex-shrink-0" />
                ) : (
                  <Circle className="w-5 h-5 text-myh-border mt-0.5 flex-shrink-0" />
                )}
                <div className="flex-1">
                  <p className={`text-sm font-medium ${task.status === 'COMPLETED' ? 'text-myh-textSoft line-through' : 'text-myh-text'}`}>
                    {task.title}
                  </p>
                  {task.dueDate && (
                    <div className="flex items-center gap-1 mt-1 text-xs text-myh-textSoft">
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
        ) : (
          <p className="text-sm text-myh-textSoft text-center py-4">No tasks assigned</p>
        )}
      </CardContent>
    </Card>
  );
}

