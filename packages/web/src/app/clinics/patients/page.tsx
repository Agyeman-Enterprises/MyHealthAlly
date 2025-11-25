'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { fetchAPI } from '@/lib/utils';
import { getStoredMetaSync } from '@/lib/auth-storage';
import { Patient, Alert } from '@myhealthally/shared';
import Link from 'next/link';
import { Search, Users, Activity } from 'lucide-react';

export default function ClinicsPatientsPage() {
  const router = useRouter();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const meta = getStoredMetaSync();
    if (!meta?.user) {
      router.push('/login');
      return;
    }
    loadData();
  }, [router]);

  const loadData = async () => {
    try {
      const [patientsData, alertsData] = await Promise.all([
        fetchAPI('/patients'),
        fetchAPI('/alerts?status=ACTIVE'),
      ]);

      setPatients(patientsData);
      setAlerts(alertsData);
    } catch (error) {
      console.error('Failed to load patients:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPatientAlerts = (patientId: string) => {
    return alerts.filter((a) => a.patientId === patientId);
  };

  const getRiskLevel = (patientId: string) => {
    const patientAlerts = getPatientAlerts(patientId);
    if (patientAlerts.some((a) => a.severity === 'CRITICAL')) return 'HIGH_RISK';
    if (patientAlerts.some((a) => a.severity === 'WARNING')) return 'WORSENING';
    return 'STABLE';
  };

  const filteredPatients = patients.filter((p) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      p.firstName?.toLowerCase().includes(query) ||
      p.lastName?.toLowerCase().includes(query) ||
      p.id.toLowerCase().includes(query)
    );
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <Skeleton className="h-10 w-64 mb-4" />
          <Skeleton className="h-12 w-full mb-4" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-32" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-slate-900">Patients</h1>
            <p className="text-muted-foreground mt-2">Manage all your patients</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search patients..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPatients.length === 0 ? (
            <Card className="col-span-full">
              <CardContent className="py-12 text-center">
                <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">
                  {searchQuery ? 'No patients found' : 'No patients yet'}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredPatients.map((patient) => {
              const risk = getRiskLevel(patient.id);
              const patientAlerts = getPatientAlerts(patient.id);
              return (
                <Link key={patient.id} href={`/clinics/patients/${patient.id}`}>
                  <Card className="hover:bg-accent/5 cursor-pointer transition-colors h-full">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">
                            {patient.firstName} {patient.lastName}
                          </CardTitle>
                          <p className="text-sm text-muted-foreground mt-1">
                            {patient.dateOfBirth
                              ? `${Math.floor((new Date().getTime() - new Date(patient.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))} years old`
                              : 'Age not specified'}
                          </p>
                        </div>
                        <Badge
                          variant={
                            risk === 'HIGH_RISK'
                              ? 'error'
                              : risk === 'WORSENING'
                              ? 'warning'
                              : 'success'
                          }
                        >
                          {risk === 'HIGH_RISK' ? 'High Risk' : risk === 'WORSENING' ? 'Watch' : 'Stable'}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {patientAlerts.length > 0 && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                          <Activity className="h-4 w-4" />
                          <span>{patientAlerts.length} active alert{patientAlerts.length !== 1 ? 's' : ''}</span>
                        </div>
                      )}
                      <p className="text-sm text-muted-foreground">
                        {patient.flags?.[0] || 'General Wellness'}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

