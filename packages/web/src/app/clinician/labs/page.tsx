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

  const getFlagColor = (flag: string): React.CSSProperties => {
    return flag === 'abnormal'
      ? { backgroundColor: 'var(--color-danger)', color: '#FFFFFF' }
      : { backgroundColor: 'var(--color-success)', color: '#FFFFFF' };
  };

  const getStatusColor = (status: string): React.CSSProperties => {
    return status === 'unreviewed'
      ? { backgroundColor: 'var(--color-warning)', color: '#FFFFFF' }
      : { backgroundColor: 'var(--color-background)', color: 'var(--color-textPrimary)' };
  };

  return (
    <div className="space-y-6">
      {/* Header with filters */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <h1 className="text-h2 font-semibold" style={{ color: 'var(--color-textPrimary)' }}>Labs & Results</h1>
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40" style={{ backgroundColor: 'var(--color-surface)' }}>
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
            <SelectTrigger className="w-40" style={{ backgroundColor: 'var(--color-surface)' }}>
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
      <Card style={{ backgroundColor: 'var(--color-surface)' }}>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead style={{ backgroundColor: 'var(--color-background)' }}>
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium" style={{ color: 'var(--color-textPrimary)' }}>Date</th>
                  <th className="px-4 py-3 text-left text-sm font-medium" style={{ color: 'var(--color-textPrimary)' }}>Patient</th>
                  <th className="px-4 py-3 text-left text-sm font-medium" style={{ color: 'var(--color-textPrimary)' }}>Test</th>
                  <th className="px-4 py-3 text-left text-sm font-medium" style={{ color: 'var(--color-textPrimary)' }}>Result</th>
                  <th className="px-4 py-3 text-left text-sm font-medium" style={{ color: 'var(--color-textPrimary)' }}>Flag</th>
                  <th className="px-4 py-3 text-left text-sm font-medium" style={{ color: 'var(--color-textPrimary)' }}>Status</th>
                  <th className="px-4 py-3 text-left text-sm font-medium" style={{ color: 'var(--color-textPrimary)' }}>Action</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: 'var(--color-border)' }}>
                {labs.map((lab: LabResult) => (
                  <tr
                    key={lab.id}
                    className="transition-colors"
                    style={{ backgroundColor: 'transparent' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--color-background)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <td className="px-4 py-3 text-sm" style={{ color: 'var(--color-textPrimary)' }}>
                      {new Date(lab.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-4 py-3 text-sm" style={{ color: 'var(--color-textPrimary)' }}>{lab.patientName}</td>
                    <td className="px-4 py-3 text-sm" style={{ color: 'var(--color-textPrimary)' }}>{lab.test}</td>
                    <td className="px-4 py-3 text-sm" style={{ color: 'var(--color-textPrimary)' }}>{lab.result}</td>
                    <td className="px-4 py-3">
                      <Badge style={getFlagColor(lab.flag)}>
                        {lab.flag}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge style={getStatusColor(lab.status)}>
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
          <SheetContent style={{ backgroundColor: 'var(--color-surface)' }}>
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
                <p className="text-sm text-caption mb-1" style={{ color: 'var(--color-textSecondary)' }}>Result</p>
                <p className="text-body text-lg" style={{ color: 'var(--color-textPrimary)' }}>{selectedLab.result}</p>
              </div>
              <div>
                <p className="text-sm text-caption mb-1" style={{ color: 'var(--color-textSecondary)' }}>Flag</p>
                <Badge style={getFlagColor(selectedLab.flag)}>
                  {selectedLab.flag}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-caption mb-1" style={{ color: 'var(--color-textSecondary)' }}>Status</p>
                <Badge style={getStatusColor(selectedLab.status)}>
                  {selectedLab.status}
                </Badge>
              </div>
              <div className="flex gap-2 pt-4">
                {selectedLab.status === 'unreviewed' && (
                  <Button
                    variant="primary"
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
