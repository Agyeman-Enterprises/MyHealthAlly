'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth-store';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

const mockMeds = [
  { id: '1', name: 'Metformin', dosage: '500mg', frequency: 'Twice daily', refillsLeft: 2, status: 'active', prescriber: 'Dr. Smith' },
  { id: '2', name: 'Lisinopril', dosage: '10mg', frequency: 'Once daily', refillsLeft: 0, status: 'active', prescriber: 'Dr. Smith' },
  { id: '3', name: 'Atorvastatin', dosage: '20mg', frequency: 'At bedtime', refillsLeft: 3, status: 'active', prescriber: 'Dr. Smith' },
];

export default function MedicationsPage() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [meds] = useState(mockMeds);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newMed, setNewMed] = useState({ name: '', dosage: '', frequency: '', instructions: '' });
  const [saving, setSaving] = useState(false);

  if (!isAuthenticated) { router.push('/auth/login'); return null; }

  const handleAddMed = async () => {
    if (!newMed.name) { alert('Please enter medication name'); return; }
    setSaving(true);
    await new Promise(r => setTimeout(r, 1000));
    setSaving(false);
    alert('Medication added! Your care team will review and verify this information.');
    setShowAddForm(false);
    setNewMed({ name: '', dosage: '', frequency: '', instructions: '' });
  };

  const hasMeds = meds.length > 0;

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
                <input type="text" placeholder="Dosage (e.g., 500mg)" value={newMed.dosage} onChange={(e) => setNewMed({ ...newMed, dosage: e.target.value })} className="w-full px-4 py-3 border rounded-xl" />
                <input type="text" placeholder="Frequency" value={newMed.frequency} onChange={(e) => setNewMed({ ...newMed, frequency: e.target.value })} className="w-full px-4 py-3 border rounded-xl" />
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

        {hasMeds && (
          <div className="space-y-3">
            {meds.map((med) => (
              <Card key={med.id}>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-navy-600">{med.name}</h3>
                    <p className="text-gray-600">{med.dosage} • {med.frequency}</p>
                    <p className="text-sm text-gray-500">Prescribed by {med.prescriber}</p>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs px-2 py-1 rounded-full ${med.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                      {med.status === 'active' ? '● Active' : 'Discontinued'}
                    </span>
                    <p className="text-sm text-gray-500 mt-1">{med.refillsLeft} refills left</p>
                    {med.refillsLeft <= 1 && (
                      <Button variant="outline" size="sm" className="mt-2" onClick={() => router.push(`/medications/refill?med=${med.id}`)}>
                        Request Refill
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
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
