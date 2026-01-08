/**
 * Hospital/ED Visit History
 * 
 * Displays all hospital and emergency department visits for the patient
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useRequireAuth } from '@/lib/auth/use-require-auth';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { supabase } from '@/lib/supabase/client';
import { getCurrentUserAndPatient } from '@/lib/supabase/queries-settings';
import { format } from 'date-fns';

interface HospitalVisit {
  id: string;
  hospital_name: string;
  hospital_address?: string;
  hospital_phone?: string;
  admission_date: string;
  discharge_date?: string;
  admission_reason?: string;
  visit_type?: string;
  status: string;
  discharge_summary_url?: string;
  discharge_instructions?: string;
  discharge_diagnosis?: string;
  medications_reconciled: boolean;
  follow_up_required: boolean;
  follow_up_days?: number;
  created_at: string;
}

export default function HospitalVisitsPage() {
  const router = useRouter();
  const { isLoading } = useRequireAuth();
  const [visits, setVisits] = useState<HospitalVisit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadVisits = async () => {
      if (isLoading) return;

      try {
        // Check for session first
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          setError('Please log in to view your hospital visits');
          setLoading(false);
          return;
        }

        const { patientId } = await getCurrentUserAndPatient();
        if (!patientId) {
          setError('Patient record not found. Please contact support.');
          setLoading(false);
          return;
        }

        const { data, error: fetchError } = await supabase
          .from('hospital_admissions')
          .select('*')
          .eq('patient_id', patientId)
          .order('admission_date', { ascending: false });

        if (fetchError) throw fetchError;

        setVisits(data || []);
      } catch (err) {
        console.error('Error loading visits:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to load visits';
        if (errorMessage.includes('not authenticated') || errorMessage.includes('session')) {
          setError('Please log in to view your hospital visits');
        } else {
          setError(errorMessage);
        }
      } finally {
        setLoading(false);
      }
    };

    loadVisits();
  }, [isLoading]);

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-sky-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-10 h-10 border-4 border-primary-300 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  const getVisitTypeLabel = (type?: string) => {
    switch (type) {
      case 'emergency': return 'Emergency Department';
      case 'inpatient': return 'Inpatient Stay';
      case 'observation': return 'Observation';
      case 'outpatient': return 'Outpatient Visit';
      default: return type || 'Hospital Visit';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Currently Admitted';
      case 'discharged': return 'Discharged';
      case 'cancelled': return 'Cancelled';
      default: return status;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-sky-50 pb-20 md:pb-8">
      <Header title="Hospital/ED Visits" showBack />
      
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-navy-600">Visit History</h1>
            <p className="text-gray-600 mt-1">View your hospital and emergency department visits</p>
          </div>
          <Button
            variant="primary"
            onClick={() => router.push('/hospital-records-request')}
          >
            New Visit
          </Button>
        </div>

        {error && (
          <Card className="mb-6 bg-red-50 border-red-200">
            <p className="text-red-800 text-sm">{error}</p>
          </Card>
        )}

        {visits.length === 0 ? (
          <Card className="text-center py-12">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🏥</span>
            </div>
            <h3 className="text-lg font-semibold text-navy-600 mb-2">No visits recorded</h3>
            <p className="text-gray-600 mb-6">Your hospital and ED visits will appear here</p>
            <Button variant="primary" onClick={() => router.push('/hospital-records-request')}>
              Record a Visit
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {visits.map((visit) => (
              <Card key={visit.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-navy-600">{visit.hospital_name}</h3>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        visit.status === 'active' 
                          ? 'bg-yellow-100 text-yellow-800'
                          : visit.status === 'discharged'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {getStatusLabel(visit.status)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {getVisitTypeLabel(visit.visit_type)}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Admission Date</p>
                    <p className="text-sm font-medium text-gray-900">
                      {format(new Date(visit.admission_date), 'MMM d, yyyy')}
                    </p>
                  </div>
                  {visit.discharge_date && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Discharge Date</p>
                      <p className="text-sm font-medium text-gray-900">
                        {format(new Date(visit.discharge_date), 'MMM d, yyyy')}
                      </p>
                    </div>
                  )}
                </div>

                {visit.admission_reason && (
                  <div className="mb-4">
                    <p className="text-xs text-gray-500 mb-1">Reason for Visit</p>
                    <p className="text-sm text-gray-900">{visit.admission_reason}</p>
                  </div>
                )}

                {visit.discharge_diagnosis && (
                  <div className="mb-4">
                    <p className="text-xs text-gray-500 mb-1">Discharge Diagnosis</p>
                    <p className="text-sm text-gray-900">{visit.discharge_diagnosis}</p>
                  </div>
                )}

                {visit.hospital_address && (
                  <div className="mb-4">
                    <p className="text-xs text-gray-500 mb-1">Address</p>
                    <p className="text-sm text-gray-900">{visit.hospital_address}</p>
                  </div>
                )}

                {visit.hospital_phone && (
                  <div className="mb-4">
                    <p className="text-xs text-gray-500 mb-1">Phone</p>
                    <p className="text-sm text-gray-900">{visit.hospital_phone}</p>
                  </div>
                )}

                <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-200">
                  {visit.discharge_summary_url && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(visit.discharge_summary_url, '_blank')}
                    >
                      View Discharge Summary
                    </Button>
                  )}
                  {!visit.medications_reconciled && visit.discharge_date && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/hospital-visits/${visit.id}/reconcile`)}
                    >
                      Reconcile Medications
                    </Button>
                  )}
                  {visit.follow_up_required && (
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                      Follow-up Required
                    </span>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
