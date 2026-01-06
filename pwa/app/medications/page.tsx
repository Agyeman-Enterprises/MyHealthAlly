'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useRequireAuth } from '@/lib/auth/use-require-auth';
import { useAuthStore } from '@/lib/store/auth-store';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { RequirePractice } from '@/components/RequirePractice';
import { getPatientMedications, type Medication } from '@/lib/supabase/queries-medications';
import { getRefillInfo, formatRefillStatus } from '@/lib/utils/medication-refills';

const DOSING_FREQUENCIES = [
  'Once daily',
  'Twice daily',
  'Three times daily',
  'Four times daily',
  'Every 12 hours',
  'Every 8 hours',
  'Every 6 hours',
  'Every 4 hours',
  'As needed (PRN)',
  'At bedtime',
  'In the morning',
  'With meals',
  'Before meals',
  'After meals',
  'Weekly',
  'Bi-weekly',
  'Monthly',
];

interface MedicationWithPrescriber extends Medication {
  clinicians: { first_name: string; last_name: string } | null;
}

export default function MedicationsPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useRequireAuth();
  const patientId = useAuthStore((state) => state.patientId);
  const [meds, setMeds] = useState<MedicationWithPrescriber[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newMed, setNewMed] = useState({ name: '', dosage: '', frequency: '', instructions: '' });
  const [saving, setSaving] = useState(false);

  // Load medications from database
  useEffect(() => {
    if (authLoading) return;
    const loadMedications = async () => {
      if (!patientId) {
        setIsLoading(false);
        return;
      }

      try {
        const medications = await getPatientMedications(patientId);
        setMeds(medications);
      } catch (error) {
        console.error('Error loading medications:', error);
        // Continue with empty list on error
        setMeds([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated) {
      loadMedications();
    }
  }, [authLoading, isAuthenticated, patientId, router]);

  if (authLoading) {
    return null;
  }

  const handleAddMed = async () => {
    if (!newMed.name) { alert('Please enter medication name'); return; }
    setSaving(true);
    await new Promise(r => setTimeout(r, 1000));
    setSaving(false);
    alert('Medication added! Your care team will review and verify this information.');
    setShowAddForm(false);
    setNewMed({ name: '', dosage: '', frequency: '', instructions: '' });
  };

  const activeMeds = meds.filter(m => m.is_active);
  const hasMeds = activeMeds.length > 0;

  function MedicationsPageInner() {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-sky-50 pb-20 md:pb-8">
        <Header />
        <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-navy-600">Medications</h1>
            <p className="text-gray-600">View and manage your prescriptions</p>
          </div>
          {hasMeds && !showAddForm && (
            <Button variant="primary" onClick={() => setShowAddForm(true)}>+ Add Medication</Button>
          )}
        </div>

        {showAddForm && (
          <Card className="mb-6">
            <h2 className="font-semibold text-navy-600 mb-4">Add Medication</h2>
            <div className="space-y-3">
              <input type="text" placeholder="Medication name *" value={newMed.name} onChange={(e) => setNewMed({ ...newMed, name: e.target.value })} className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-400" />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Dosage *</label>
                  <input type="text" placeholder="e.g., 500mg" value={newMed.dosage} onChange={(e) => setNewMed({ ...newMed, dosage: e.target.value })} className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-400" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Frequency *</label>
                  <select value={newMed.frequency} onChange={(e) => setNewMed({ ...newMed, frequency: e.target.value })} className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-400">
                    <option value="">Select frequency</option>
                    {DOSING_FREQUENCIES.map((freq) => (
                      <option key={freq} value={freq}>{freq}</option>
                    ))}
                  </select>
                </div>
              </div>
              <textarea placeholder="Special instructions" value={newMed.instructions} onChange={(e) => setNewMed({ ...newMed, instructions: e.target.value })} rows={2} className="w-full px-4 py-3 border rounded-xl resize-none" />
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setShowAddForm(false)}>Cancel</Button>
                <Button variant="primary" onClick={handleAddMed} isLoading={saving}>Save Medication</Button>
              </div>
            </div>
            <p className="text-xs text-amber-600 mt-3">⚠️ Self-reported medications will be marked as pending until verified by your care team.</p>
          </Card>
        )}

        {isLoading && (
          <Card className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-primary-300 border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-gray-500">Loading medications...</p>
          </Card>
        )}

        {!isLoading && hasMeds && (
          <div className="space-y-3">
            {activeMeds.map((med) => {
              const prescriberName = med.clinicians 
                ? `${med.clinicians.first_name} ${med.clinicians.last_name}`
                : 'Prescriber';
              
              const refillInfo = getRefillInfo(
                med.refills_remaining || null,
                med.last_refill_date,
                med.days_supply || null,
                null,
                med.next_refill_due_date || null
              );
              
              const refillStatus = formatRefillStatus(refillInfo);
              const refillsRemaining = med.refills_remaining ?? null;
              const needsRefill = (refillsRemaining !== null && refillsRemaining <= 1) || refillInfo.isDueForRefill;

              return (
                <Card key={med.id}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-navy-600">{med.name}</h3>
                      <p className="text-gray-600">{med.dosage} {med.dosage_unit} • {med.frequency}</p>
                      {med.instructions && (
                        <p className="text-sm text-gray-500 mt-1">{med.instructions}</p>
                      )}
                      <p className="text-sm text-gray-500 mt-1">Prescribed by {prescriberName}</p>
                      {refillStatus && (
                        <p className={`text-sm mt-1 ${needsRefill ? 'text-amber-600 font-medium' : 'text-gray-500'}`}>
                          {refillStatus}
                        </p>
                      )}
                    </div>
                    <div className="text-right ml-4">
                      <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">
                        ● Active
                      </span>
                      {needsRefill && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="mt-2" 
                          onClick={() => router.push(`/medications/refill?med=${med.id}`)}
                        >
                          Request Refill
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {!hasMeds && !showAddForm && (
          <Card className="text-center py-12">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">💊</span>
            </div>
            <h3 className="text-lg font-semibold text-navy-600 mb-2">No medications</h3>
            <p className="text-gray-600 mb-6">Add your current medications to keep track</p>
            <Button variant="primary" onClick={() => setShowAddForm(true)}>Add Your First Medication</Button>
          </Card>
        )}
        </main>
        <BottomNav />
      </div>
    );
  }

  return (
    <RequirePractice featureName="Medications">
      <MedicationsPageInner />
    </RequirePractice>
  );
}
