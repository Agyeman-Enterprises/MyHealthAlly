'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { fetchAPI } from '@/lib/utils';
import { getStoredMetaSync } from '@/lib/auth-storage';
import { Patient, RiskLevel } from '@myhealthally/shared';

function getRiskLevel(patient: Patient & { alerts?: any[] }): RiskLevel {
  if (!patient.alerts || patient.alerts.length === 0) return RiskLevel.STABLE;
  
  const criticalAlerts = patient.alerts.filter((a: any) => a.severity === 'CRITICAL');
  const warningAlerts = patient.alerts.filter((a: any) => a.severity === 'WARNING');
  
  if (criticalAlerts.length > 0) return RiskLevel.HIGH_RISK;
  if (warningAlerts.length >= 2) return RiskLevel.WORSENING;
  return RiskLevel.STABLE;
}

export default function PatientsPage() {
  const router = useRouter();
  const [patients, setPatients] = useState<(Patient & { alerts?: any[] })[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const meta = getStoredMetaSync();
    if (!meta?.user) {
      router.push('/login');
      return;
    }
    loadPatients();
  }, [router]);

  const loadPatients = async () => {
    try {
      const data = await fetchAPI('/patients');
      setPatients(data);
    } catch (error) {
      console.error('Failed to load patients:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPatients = patients.filter((p) => {
    const name = `${p.firstName || ''} ${p.lastName || ''}`.toLowerCase();
    return name.includes(search.toLowerCase());
  });

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold">Patients</h1>
            <p className="text-muted-foreground mt-2">Manage and monitor patient care</p>
          </div>
        </div>

        <Input
          placeholder="Search patients by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-md"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPatients.map((patient) => {
            const risk = getRiskLevel(patient);
            return (
              <Link key={patient.id} href={`/patients/${patient.id}`}>
                <Card className="hover:bg-accent/5 cursor-pointer transition-colors">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle>
                          {patient.firstName} {patient.lastName}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          Patient ID: {patient.id}
                        </p>
                      </div>
                      <Badge
                        variant={
                          risk === RiskLevel.HIGH_RISK
                            ? 'error'
                            : risk === RiskLevel.WORSENING
                            ? 'warning'
                            : 'success'
                        }
                      >
                        {risk === RiskLevel.HIGH_RISK
                          ? 'High risk'
                          : risk === RiskLevel.WORSENING
                          ? 'Worsening'
                          : 'Stable'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-muted-foreground">
                      Last contact: N/A
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        {filteredPatients.length === 0 && (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No patients found
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

