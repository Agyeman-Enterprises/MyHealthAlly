'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FlaskConical, ExternalLink } from 'lucide-react';
import Link from 'next/link';

interface ChartLabsPanelProps {
  labs: any[];
}

export function ChartLabsPanel({ labs }: ChartLabsPanelProps) {
  const getFlagClass = (flag: string): string => {
    return flag === 'abnormal' ? 'bg-red-500 text-white' : 'bg-emerald-500 text-white';
  };

  return (
    <Card className="bg-white">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-h3 flex items-center gap-2 text-slate-900">
            <FlaskConical className="w-5 h-5 text-teal-600" />
            Lab Results
          </CardTitle>
          <Link href="/clinician/labs">
            <Button variant="outline" size="sm">
              <ExternalLink className="w-4 h-4 mr-2" />
              View All Labs
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {labs.length > 0 ? (
          <div className="space-y-4">
            {labs.slice(0, 10).map((lab) => (
              <div
                key={lab.id}
                className="p-4 rounded-2xl border border-slate-200 bg-slate-50"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-body font-medium text-slate-900">
                      {lab.testName || lab.test}
                    </p>
                    <p className="text-caption mt-1 text-slate-600">
                      {new Date(lab.date || lab.orderedAt).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                  {lab.flag && (
                    <Badge className={getFlagClass(lab.flag)}>
                      {lab.flag}
                    </Badge>
                  )}
                </div>
                {lab.result && (
                  <p className="text-body text-slate-900">
                    Result: {lab.result}
                  </p>
                )}
                {lab.status && (
                  <Badge
                    variant="outline"
                    className="mt-2 text-caption border-slate-200 text-slate-600"
                  >
                    {lab.status}
                  </Badge>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <FlaskConical className="w-12 h-12 mx-auto mb-4 text-slate-400" />
            <p className="text-body text-slate-600">
              No lab results found
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

