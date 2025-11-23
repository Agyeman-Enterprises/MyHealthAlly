'use client';

import { GlowCard } from '@/components/ui/glow-card';
import FloatingNav from '@/components/patient/FloatingNav';
import { CheckCircle2, Circle } from 'lucide-react';

const planPhases = [
  {
    id: '1',
    title: 'Month 1: Foundation',
    tasks: [
      { id: '1', text: 'Take medication daily at 8 AM', completed: true },
      { id: '2', text: 'Log blood pressure twice daily', completed: true },
      { id: '3', text: 'Aim for 7-8 hours of sleep', completed: false },
    ],
  },
  {
    id: '2',
    title: 'Month 2: Building habits',
    tasks: [
      { id: '4', text: 'Add 10 minutes of daily movement', completed: false },
      { id: '5', text: 'Continue medication routine', completed: false },
    ],
  },
];

export default function CarePlanScreenshot() {
  return (
    <div className="min-h-screen bg-myh-bg pb-24" style={{ aspectRatio: '9/19.5', maxWidth: '430px', margin: '0 auto' }}>
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Text Overlay */}
        <div className="text-center mb-8 space-y-2">
          <h2 className="text-2xl font-semibold text-myh-text">Follow a plan made just for you.</h2>
          <p className="text-myh-textSoft">Your care plan, broken down into manageable steps.</p>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-myh-text">Your 3-month plan</h1>
        </div>

        {planPhases.map((phase) => (
          <GlowCard key={phase.id} className="p-6">
            <h3 className="text-lg font-semibold text-myh-text mb-4">{phase.title}</h3>
            <div className="space-y-3">
              {phase.tasks.map((task) => (
                <div key={task.id} className="flex items-start gap-3">
                  {task.completed ? (
                    <CheckCircle2 className="w-5 h-5 text-myh-primary mt-0.5 flex-shrink-0" />
                  ) : (
                    <Circle className="w-5 h-5 text-myh-textSoft mt-0.5 flex-shrink-0" />
                  )}
                  <p className={`text-sm ${task.completed ? 'text-myh-textSoft line-through' : 'text-myh-text'}`}>
                    {task.text}
                  </p>
                </div>
              ))}
            </div>
          </GlowCard>
        ))}
      </div>

      <FloatingNav />
    </div>
  );
}

