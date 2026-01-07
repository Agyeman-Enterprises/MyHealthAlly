/**
 * Medication Reconciliation Page
 * 
 * Review and apply medication changes from hospital visit
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useRequireAuth } from '@/lib/auth/use-require-auth';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { supabase } from '@/lib/supabase/client';
import { getCurrentUserAndPatient } from '@/lib/supabase/queries-settings';
import { getPatientMedications } from '@/lib/supabase/queries-medications';

interface MedicationReconciliation {
  id: string;
  medication_name: string;
  dosage?: string;
  frequency?: string;
  route?: string;
  instructions?: string;
  action: 'added' | 'modified' | 'discontinued' | 'unchanged';
  previous_medication_id?: string;
  applied: boolean;
}

export default function MedicationReconciliationPage() {
  const router = useRouter();
  const params = useParams();
  const visitId = typeof params['id'] === 'string' ? params['id'] : '';
  const { isLoading } = useRequireAuth();
  
  const [reconciliations, setReconciliations] = useState<MedicationReconciliation[]>([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      if (isLoading || !visitId) return;

      try {
        const { patientId } = await getCurrentUserAndPatient();
        if (!patientId) {
          setLoading(false);
          return;
        }

        // Load medication reconciliations
        const { data: reconciliationsData, error: recError } = await supabase
          .from('medication_reconciliation')
          .select('*')
          .eq('hospital_admission_id', visitId)
          .eq('patient_id', patientId)
          .order('created_at', { ascending: true });

        if (recError) throw recError;
        setReconciliations(reconciliationsData || []);

        // Load current medications (for reference, not stored in state)
        await getPatientMedications(patientId);
      } catch (err) {
        console.error('Error loading reconciliation data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [isLoading, visitId]);

  const handleApplyReconciliation = async () => {
    setApplying(true);
    setError(null);

    try {
      const { patientId } = await getCurrentUserAndPatient();
      if (!patientId) return;

      // Apply each reconciliation
      for (const rec of reconciliations) {
        if (rec.applied) continue;

        if (rec.action === 'added') {
          // Add new medication
          const { error: insertError } = await supabase
            .from('medications')
            .insert({
              patient_id: patientId,
              name: rec.medication_name,
              dosage: rec.dosage || '',
              dosage_unit: rec.dosage?.match(/\d+\s*(mg|mcg|g|ml|tablet|capsule)/i)?.[1] || 'mg',
              frequency: rec.frequency || '',
              route: rec.route || null,
              instructions: rec.instructions || null,
              is_active: true,
              start_date: new Date().toISOString().split('T')[0],
            });

          if (insertError) throw insertError;
        } else if (rec.action === 'discontinued' && rec.previous_medication_id) {
          // Discontinue existing medication
          const { error: updateError } = await supabase
            .from('medications')
            .update({
              is_active: false,
              discontinued_at: new Date().toISOString(),
              discontinued_reason: 'Discontinued per hospital discharge',
            })
            .eq('id', rec.previous_medication_id);

          if (updateError) throw updateError;
        } else if (rec.action === 'modified' && rec.previous_medication_id) {
          // Update existing medication
          const { error: updateError } = await supabase
            .from('medications')
            .update({
              dosage: rec.dosage || '',
              frequency: rec.frequency || '',
              route: rec.route || null,
              instructions: rec.instructions || null,
            })
            .eq('id', rec.previous_medication_id);

          if (updateError) throw updateError;
        }

        // Mark reconciliation as applied
        await supabase
          .from('medication_reconciliation')
          .update({ applied: true, applied_at: new Date().toISOString() })
          .eq('id', rec.id);
      }

      // Mark hospital admission as reconciled
      await supabase
        .from('hospital_admissions')
        .update({
          medications_reconciled: true,
          medications_reconciled_at: new Date().toISOString(),
        })
        .eq('id', visitId);

      router.push('/hospital-visits');
    } catch (err) {
      console.error('Error applying reconciliation:', err);
      setError(err instanceof Error ? err.message : 'Failed to apply medication changes');
    } finally {
      setApplying(false);
    }
  };

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

  const unappliedReconciliations = reconciliations.filter(r => !r.applied);
  const hasUnapplied = unappliedReconciliations.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-sky-50 pb-20 md:pb-8">
      <Header title="Medication Reconciliation" showBack />
      
      <main className="max-w-4xl mx-auto px-4 py-8">
        <Card className="mb-6">
          <h1 className="text-xl font-bold text-navy-600 mb-2">Medication Reconciliation</h1>
          <p className="text-gray-600 text-sm">
            Review medication changes from your hospital visit and apply them to your medication list.
          </p>
        </Card>

        {error && (
          <Card className="mb-6 bg-red-50 border-red-200">
            <p className="text-red-800 text-sm">{error}</p>
          </Card>
        )}

        {reconciliations.length === 0 ? (
          <Card className="text-center py-12">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">💊</span>
            </div>
            <h3 className="text-lg font-semibold text-navy-600 mb-2">No medication changes</h3>
            <p className="text-gray-600 mb-6">No medication changes were identified from this visit.</p>
            <Button variant="outline" onClick={() => router.back()}>
              Go Back
            </Button>
          </Card>
        ) : (
          <>
            <div className="space-y-4 mb-6">
              {reconciliations.map((rec) => (
                <Card key={rec.id} className={`p-4 ${rec.applied ? 'opacity-60' : ''}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-navy-600">{rec.medication_name}</h3>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          rec.action === 'added' ? 'bg-green-100 text-green-800' :
                          rec.action === 'modified' ? 'bg-yellow-100 text-yellow-800' :
                          rec.action === 'discontinued' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {rec.action}
                        </span>
                        {rec.applied && (
                          <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                            Applied
                          </span>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                        {rec.dosage && <p><strong>Dosage:</strong> {rec.dosage}</p>}
                        {rec.frequency && <p><strong>Frequency:</strong> {rec.frequency}</p>}
                        {rec.route && <p><strong>Route:</strong> {rec.route}</p>}
                        {rec.instructions && <p><strong>Instructions:</strong> {rec.instructions}</p>}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {hasUnapplied && (
              <Card className="bg-blue-50 border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-blue-900 mb-1">Ready to Apply Changes</h3>
                    <p className="text-sm text-blue-800">
                      {unappliedReconciliations.length} medication change{unappliedReconciliations.length !== 1 ? 's' : ''} will be applied to your medication list.
                    </p>
                  </div>
                  <Button
                    variant="primary"
                    onClick={handleApplyReconciliation}
                    isLoading={applying}
                    disabled={applying}
                  >
                    Apply Changes
                  </Button>
                </div>
              </Card>
            )}

            {!hasUnapplied && (
              <Card className="bg-green-50 border-green-200">
                <p className="text-green-800 text-sm">
                  ✓ All medication changes have been applied to your medication list.
                </p>
              </Card>
            )}
          </>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
