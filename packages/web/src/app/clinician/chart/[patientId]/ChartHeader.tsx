'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Plus, Stethoscope } from 'lucide-react';

interface ChartHeaderProps {
  patient: {
    name: string;
    dob: string;
    age: number;
    sex: string;
    mrn?: string;
    primaryClinician?: string;
  };
  onStartNote: () => void;
  onCreateOrder: () => void;
}

export function ChartHeader({ patient, onStartNote, onCreateOrder }: ChartHeaderProps) {
  const formatDOB = (dob: string) => {
    return new Date(dob).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="p-6 rounded-2xl bg-white shadow-md">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full flex items-center justify-center bg-teal-50">
            <span className="font-semibold text-xl text-teal-600">
              {patient.name.charAt(0)}
            </span>
          </div>
          <div>
            <h1 className="text-h1 font-semibold text-slate-900">
              {patient.name}
            </h1>
            <div className="flex items-center gap-4 mt-2">
              <p className="text-body text-slate-600">
                {patient.age} {patient.sex} • DOB: {formatDOB(patient.dob)}
              </p>
              {patient.mrn && (
                <Badge variant="outline" className="text-caption">
                  MRN: {patient.mrn}
                </Badge>
              )}
              {patient.primaryClinician && (
                <div className="flex items-center gap-1">
                  <Stethoscope className="w-4 h-4 text-slate-600" />
                  <span className="text-caption text-slate-600">
                    {patient.primaryClinician}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="primary" onClick={onStartNote}>
            <FileText className="w-4 h-4 mr-2" />
            Start Note
          </Button>
          <Button variant="outline" onClick={onCreateOrder}>
            <Plus className="w-4 h-4 mr-2" />
            Create Order
          </Button>
        </div>
      </div>
    </div>
  );
}

