import { useState, useEffect } from 'react';
import { fetchAPI } from '@/lib/utils';

export interface VitalsData {
  heartRate?: number;
  spo2?: number;
  respiration?: number;
  systolicBP?: number;
  diastolicBP?: number;
  weight?: number;
  bmi?: number;
  hrv?: number;
  [key: string]: any;
}

export function useVitals() {
  const [vitals, setVitals] = useState<VitalsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadVitals();
  }, []);

  const loadVitals = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchAPI('/patients/me/vitals');
      setVitals(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load vitals');
    } finally {
      setLoading(false);
    }
  };

  const recordVital = async (type: string, value: number | string, source: string = 'MANUAL') => {
    try {
      await fetchAPI('/patients/me/vitals', {
        method: 'POST',
        body: JSON.stringify({
          type,
          value,
          source,
          timestamp: new Date().toISOString(),
        }),
      });
      await loadVitals(); // Reload after recording
    } catch (err: any) {
      throw new Error(err.message || 'Failed to record vital');
    }
  };

  return {
    vitals,
    loading,
    error,
    recordVital,
    refetch: loadVitals,
  };
}

