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

  return (
    <div className="space-y-6">
      {/* Header with filters */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <h1 className="text-2xl font-semibold text-clinician-text">Labs & Results</h1>
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40 bg-clinician-surface">
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
            <SelectTrigger className="w-40 bg-clinician-surface">
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
      <Card className="bg-clinician-surface">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-clinician-panel">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-clinician-text">Date</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-clinician-text">Patient</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-clinician-text">Test</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-clinician-text">Result</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-clinician-text">Flag</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-clinician-text">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-clinician-text">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-clinician-panel">
                {labs.map((lab: LabResult) => (
                  <tr
                    key={lab.id}
                    className="hover:bg-clinician-panel transition-colors"
                  >
                    <td className="px-4 py-3 text-sm text-clinician-text">
                      {new Date(lab.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-4 py-3 text-sm text-clinician-text">{lab.patientName}</td>
                    <td className="px-4 py-3 text-sm text-clinician-text">{lab.test}</td>
                    <td className="px-4 py-3 text-sm text-clinician-text">{lab.result}</td>
                    <td className="px-4 py-3">
                      <Badge
                        className={
                          lab.flag === 'abnormal'
                            ? 'bg-clinician-danger text-white'
                            : 'bg-clinician-good text-white'
                        }
                      >
                        {lab.flag}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        className={
                          lab.status === 'unreviewed'
                            ? 'bg-clinician-warning text-white'
                            : 'bg-clinician-panel text-clinician-text'
                        }
                      >
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
          <SheetContent>
            <SheetHeader>
              <SheetTitle>{selectedLab.test}</SheetTitle>
              <SheetDescription>
                {selectedLab.patientName} • {new Date(selectedLab.date).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </SheetDescription>
            </SheetHeader>
            <div className="mt-6 space-y-4">
              <div>
                <p className="text-sm text-clinician-textMuted mb-1">Result</p>
                <p className="text-clinician-text text-lg">{selectedLab.result}</p>
              </div>
              <div>
                <p className="text-sm text-clinician-textMuted mb-1">Flag</p>
                <Badge
                  className={
                    selectedLab.flag === 'abnormal'
                      ? 'bg-clinician-danger text-white'
                      : 'bg-clinician-good text-white'
                  }
                >
                  {selectedLab.flag}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-clinician-textMuted mb-1">Status</p>
                <Badge
                  className={
                    selectedLab.status === 'unreviewed'
                      ? 'bg-clinician-warning text-white'
                      : 'bg-clinician-panel text-clinician-text'
                  }
                >
                  {selectedLab.status}
                </Badge>
              </div>
              <div className="flex gap-2 pt-4">
                {selectedLab.status === 'unreviewed' && (
                  <Button
                    className="bg-clinician-primary hover:bg-clinician-primary-soft"
                    onClick={() => {
                      // Handle mark as reviewed
                      setSelectedLab(null);
                    }}
                  >
                    Mark as Reviewed
                  </Button>
                )}
                <Link href={`/clinician/patients/${selectedLab.patientId}`}>
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

