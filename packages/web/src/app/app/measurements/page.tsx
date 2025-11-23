'use client';

import { useState, useEffect, useCallback } from 'react';
import { GlowCard } from '@/components/ui/glow-card';
import { PrimaryButton } from '@/components/ui/primary-button';
import FloatingNav from '@/components/patient/FloatingNav';
import { useAuth } from '@/contexts/AuthContext';
import { fetchAPI } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Calendar, Activity } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function AppMeasurementsPage() {
  const { patient, loading: authLoading } = useAuth();
  const [measurements, setMeasurements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newMeasurement, setNewMeasurement] = useState({
    type: 'HEART_RATE',
    value: '',
    timestamp: new Date().toISOString().split('T')[0],
  });

  const loadMeasurements = useCallback(async () => {
    if (!patient?.id) return;
    setLoading(true);
    try {
      const data = await fetchAPI(`/patients/${patient.id}/measurements?limit=50`);
      setMeasurements(data);
    } catch (error) {
      console.error('Failed to load measurements:', error);
    } finally {
      setLoading(false);
    }
  }, [patient?.id]);

  useEffect(() => {
    if (!authLoading && patient) {
      loadMeasurements();
    }
  }, [patient, authLoading, loadMeasurements]);

  const handleSubmit = async () => {
    if (!patient?.id || !newMeasurement.value) return;
    try {
      await fetchAPI(`/patients/${patient.id}/measurements`, {
        method: 'POST',
        body: JSON.stringify({
          type: newMeasurement.type,
          value: parseFloat(newMeasurement.value),
          timestamp: new Date(newMeasurement.timestamp),
          source: 'manual',
        }),
      });
      setDialogOpen(false);
      setNewMeasurement({ type: 'HEART_RATE', value: '', timestamp: new Date().toISOString().split('T')[0] });
      loadMeasurements();
    } catch (error) {
      console.error('Failed to add measurement:', error);
    }
  };

  const formatValue = (measurement: any) => {
    if (typeof measurement.value === 'object') {
      return `${measurement.value.systolic}/${measurement.value.diastolic}`;
    }
    return measurement.value;
  };

  const getTypeLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      HEART_RATE: 'Heart Rate',
      BLOOD_PRESSURE: 'Blood Pressure',
      OXYGEN_SATURATION: 'O₂ Saturation',
      HRV: 'Recovery (HRV)',
      WEIGHT: 'Weight',
      GLUCOSE: 'Glucose',
    };
    return labels[type] || type;
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-myh-bg pb-24 p-6">
        <Skeleton className="h-8 w-48 mb-4" />
        <Skeleton className="h-16 w-full mb-4" />
        <Skeleton className="h-32 w-full" />
        <FloatingNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-myh-bg pb-24">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-myh-text">Measurements</h1>
            <p className="text-myh-textSoft">Log and track your health metrics</p>
          </div>
          <PrimaryButton onClick={() => setDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Reading
          </PrimaryButton>
        </div>

        {/* Recent Measurements */}
        <GlowCard className="p-6">
          <h2 className="text-lg font-semibold text-myh-text mb-4">Recent Measurements</h2>
          {measurements.length > 0 ? (
            <div className="space-y-3">
              {measurements.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center justify-between p-4 bg-myh-surfaceSoft rounded-lg border border-myh-border"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-myh-primarySoft rounded-lg flex items-center justify-center">
                      <Activity className="w-5 h-5 text-myh-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-myh-text">{getTypeLabel(m.type)}</p>
                      <p className="text-sm text-myh-textSoft">
                        {new Date(m.timestamp).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-myh-text">{formatValue(m)}</p>
                    <p className="text-xs text-myh-textSoft">{m.source}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-myh-textSoft">
              <Calendar className="w-12 h-12 mx-auto mb-4 text-myh-border" />
              <p>No measurements yet</p>
              <p className="text-sm mt-2">Add your first reading to get started</p>
            </div>
          )}
        </GlowCard>
      </div>

      {/* Add Measurement Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Measurement</DialogTitle>
            <DialogDescription>Log a new health metric reading</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="type">Type</Label>
              <select
                id="type"
                value={newMeasurement.type}
                onChange={(e) => setNewMeasurement({ ...newMeasurement, type: e.target.value })}
                className="bg-myh-surface border border-myh-border rounded-lg px-3 py-2 text-myh-text"
              >
                <option value="HEART_RATE">Heart Rate</option>
                <option value="BLOOD_PRESSURE">Blood Pressure</option>
                <option value="OXYGEN_SATURATION">O₂ Saturation</option>
                <option value="HRV">Recovery (HRV)</option>
                <option value="WEIGHT">Weight</option>
                <option value="GLUCOSE">Glucose</option>
              </select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="value">Value</Label>
              <Input
                id="value"
                type="number"
                value={newMeasurement.value}
                onChange={(e) => setNewMeasurement({ ...newMeasurement, value: e.target.value })}
                placeholder="Enter reading"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={newMeasurement.timestamp}
                onChange={(e) => setNewMeasurement({ ...newMeasurement, timestamp: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <PrimaryButton variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </PrimaryButton>
            <PrimaryButton onClick={handleSubmit}>Add Measurement</PrimaryButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <FloatingNav />
    </div>
  );
}

