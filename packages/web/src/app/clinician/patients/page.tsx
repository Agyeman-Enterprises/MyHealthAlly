'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search } from 'lucide-react';
import { getClinicianPatients } from '@/lib/clinician-demo-data';
import type { PatientSummary } from '@/lib/clinician-demo-data';

export default function ClinicianPatientsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [riskFilter, setRiskFilter] = useState<string>('all');
  const [telehealthFilter, setTelehealthFilter] = useState(false);

  const patients = getClinicianPatients();

  const filteredPatients = patients.filter((patient) => {
    const matchesSearch =
      patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.primaryDx?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRisk = riskFilter === 'all' || patient.riskLevel === riskFilter;
    const matchesTelehealth = !telehealthFilter || patient.devices.length > 0;
    return matchesSearch && matchesRisk && matchesTelehealth;
  });

  const riskBadgeClasses: Record<string, string> = {
    high: 'bg-red-500 text-white',
    moderate: 'bg-amber-500 text-white',
    low: 'bg-emerald-500 text-white',
  };

  return (
    <div className="space-y-6">
      {/* Header with filters */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-500" />
            <Input
              placeholder="Search patients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Select value={riskFilter} onValueChange={setRiskFilter}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Risk Levels</SelectItem>
              <SelectItem value="high">High Risk</SelectItem>
              <SelectItem value="moderate">Moderate Risk</SelectItem>
              <SelectItem value="low">Low Risk</SelectItem>
            </SelectContent>
          </Select>
          <button
            onClick={() => setTelehealthFilter(!telehealthFilter)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              telehealthFilter ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-900 hover:bg-slate-200'
            }`}
          >
            Telehealth Only
          </button>
        </div>
      </div>

      {/* Patients Table */}
      <Card className="bg-white">
        <CardContent className="p-0">
          <ScrollArea className="h-[calc(100vh-300px)]">
            <div className="divide-y divide-slate-200">
              {filteredPatients.map((patient: PatientSummary) => (
                <Link
                  key={patient.id}
                  href={`/clinician/patients/${patient.id}`}
                  className="flex items-center gap-4 p-4 transition-colors hover:bg-slate-50"
                >
                  <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 bg-teal-50">
                    <span className="font-medium text-teal-600">
                      {patient.name.charAt(0)}
                    </span>
                  </div>
                  <div className="flex-1 grid grid-cols-5 gap-4">
                    <div>
                      <p className="font-medium text-body text-slate-900">{patient.name}</p>
                      <p className="text-sm text-caption text-slate-600">
                        {patient.age} {patient.sex}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-body text-slate-900">{patient.primaryDx || '—'}</p>
                    </div>
                    <div>
                      <Badge className={riskBadgeClasses[patient.riskLevel] ?? riskBadgeClasses.low}>
                        {patient.riskLevel}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm text-caption text-slate-600">
                        {new Date(patient.lastVisit).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                    <div>
                      {patient.nextVisit ? (
                        <p className="text-sm text-body text-slate-900">
                          {new Date(patient.nextVisit).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </p>
                      ) : (
                        <p className="text-sm text-caption text-slate-600">—</p>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
