'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, Video, Building2, AlertCircle, UserCheck, Stethoscope } from 'lucide-react';
import type { TimelineEntry } from '@/services/clinician/chart';

interface ChartTimelineProps {
  timeline: TimelineEntry[];
  onEncounterClick: (encounterId: string) => void;
}

const typeIcons: Record<string, any> = {
  Telehealth: Video,
  Clinic: Building2,
  Urgent: AlertCircle,
  'Follow-up': UserCheck,
  Consult: Stethoscope,
};

const typeStyles: Record<string, { bg: string; text: string }> = {
  Telehealth: { bg: 'bg-teal-50', text: 'text-teal-600' },
  Clinic: { bg: 'bg-cyan-50', text: 'text-cyan-600' },
  Urgent: { bg: 'bg-red-50', text: 'text-red-600' },
  'Follow-up': { bg: 'bg-emerald-50', text: 'text-emerald-600' },
  Consult: { bg: 'bg-amber-50', text: 'text-amber-600' },
};

export function ChartTimeline({ timeline, onEncounterClick }: ChartTimelineProps) {
  return (
    <Card className="bg-white">
      <CardHeader>
        <CardTitle className="text-h3 text-slate-900">
          Encounter Timeline
        </CardTitle>
      </CardHeader>
      <CardContent>
        {timeline.length > 0 ? (
          <div className="space-y-4">
            {timeline.map((entry) => {
              const Icon = typeIcons[entry.type] || Clock;
              const style = typeStyles[entry.type] || { bg: 'bg-slate-100', text: 'text-slate-600' };
              
              return (
                <div
                  key={entry.id}
                  className="flex gap-4 p-4 rounded-2xl cursor-pointer transition-colors bg-slate-50 hover:bg-teal-50"
                  onClick={() => entry.encounterId && onEncounterClick(entry.encounterId)}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${style.bg}`}
                  >
                    <Icon className={`w-5 h-5 ${style.text}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-body font-medium text-slate-900">
                        {entry.type}
                      </p>
                      <span className="text-caption text-slate-600">
                        {new Date(entry.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                    {entry.noteSummary && (
                      <p className="text-small mt-1 text-slate-600">
                        {entry.noteSummary}
                      </p>
                    )}
                    {entry.provider && (
                      <p className="text-caption mt-1 text-slate-600">
                        Provider: {entry.provider}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-body text-slate-600">No encounters found</p>
        )}
      </CardContent>
    </Card>
  );
}

