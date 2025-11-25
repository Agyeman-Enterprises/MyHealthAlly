'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { getLabs } from '@/lib/clinician-demo-data';
import type { LabResult } from '@/lib/clinician-demo-data';
import Link from 'next/link';
import { FileText } from 'lucide-react';

export default function ClinicianLabsPage() {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [flagFilter, setFlagFilter] = useState<string>('all');
  const [selectedLab, setSelectedLab] = useState<LabResult | null>(null);

  let labs = getLabs();

  if (statusFilter !== 'all') {
    labs = labs.filter((l) => l.status === statusFilter);
  }
  if (flagFilter !== 'all') {
    labs = labs.filter((l) => l.flag === flagFilter);
  }

  const flagClasses: Record<string, string> = {
    abnormal: 'bg-red-500 text-white',
    normal: 'bg-emerald-500 text-white',
  };

  const statusClasses: Record<string, string> = {
    unreviewed: 'bg-amber-500 text-white',
    abnormal: 'bg-red-500 text-white',
    reviewed: 'bg-slate-100 text-slate-900',
  };

  return (
    <div className="space-y-6">
      {/* Header with filters */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <h1 className="text-h2 font-semibold text-slate-900">Labs & Results</h1>
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="unreviewed">New</SelectItem>
              <SelectItem value="abnormal">Abnormal</SelectItem>
              <SelectItem value="reviewed">Reviewed</SelectItem>
            </SelectContent>
          </Select>
          <Select value={flagFilter} onValueChange={setFlagFilter}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Flags</SelectItem>
              <SelectItem value="normal">Normal</SelectItem>
              <SelectItem value="abnormal">Abnormal</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Labs Table */}
      <Card className="bg-white">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-900">Date</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-900">Patient</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-900">Test</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-900">Result</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-900">Flag</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-900">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-900">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {labs.map((lab: LabResult) => (
                  <tr
                    key={lab.id}
                    className="transition-colors hover:bg-slate-50"
                  >
                    <td className="px-4 py-3 text-sm text-slate-900">
                      {new Date(lab.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-900">{lab.patientName}</td>
                    <td className="px-4 py-3 text-sm text-slate-900">{lab.test}</td>
                    <td className="px-4 py-3 text-sm text-slate-900">{lab.result}</td>
                    <td className="px-4 py-3">
                      <Badge className={flagClasses[lab.flag] ?? flagClasses.normal}>
                        {lab.flag}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge className={statusClasses[lab.status] ?? statusClasses.reviewed}>
                        {lab.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedLab(lab)}
                      >
                        Review
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Lab Detail Sheet */}
      {selectedLab && (
        <Sheet open={!!selectedLab} onOpenChange={(open) => !open && setSelectedLab(null)}>
          <SheetContent className="bg-white">
            <SheetHeader>
              <SheetTitle className="text-slate-900">{selectedLab.test}</SheetTitle>
              <SheetDescription className="text-slate-600">
                {selectedLab.patientName} •{' '}
                {new Date(selectedLab.date).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </SheetDescription>
            </SheetHeader>
            <div className="mt-6 space-y-4">
              <div>
                <p className="text-sm text-caption mb-1 text-slate-600">Result</p>
                <p className="text-body text-lg text-slate-900">{selectedLab.result}</p>
              </div>
              <div>
                <p className="text-sm text-caption mb-1 text-slate-600">Flag</p>
                <Badge className={flagClasses[selectedLab.flag] ?? flagClasses.normal}>
                  {selectedLab.flag}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-caption mb-1 text-slate-600">Status</p>
                <Badge className={statusClasses[selectedLab.status] ?? statusClasses.reviewed}>
                  {selectedLab.status}
                </Badge>
              </div>
              <div className="flex gap-2 pt-4">
                {selectedLab.status === 'unreviewed' && (
                  <Button
                    variant="primary"
                    onClick={() => {
                      setSelectedLab(null);
                    }}
                  >
                    Mark as Reviewed
                  </Button>
                )}
                <Link href={`/clinician/chart/${selectedLab.patientId}`}>
                  <Button variant="outline">
                    <FileText className="w-4 h-4 mr-2" />
                    Open Chart
                  </Button>
                </Link>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      )}
    </div>
  );
}
