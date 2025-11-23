import { useState, useEffect } from 'react';
import { fetchAPI } from '@/lib/utils';

export interface MetricConfig {
  id: string;
  label: string;
  unit: string;
  input_type: 'numeric' | 'scale' | 'select';
  options?: string[];
  min?: number;
  max?: number;
}

export function useMetrics() {
  const [metrics, setMetrics] = useState<MetricConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadMetrics();
  }, []);

  const loadMetrics = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchAPI('/config/metrics');
      setMetrics(data.metrics || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load metrics');
    } finally {
      setLoading(false);
    }
  };

  const getMetricById = (id: string): MetricConfig | undefined => {
    return metrics.find(m => m.id === id);
  };

  return {
    metrics,
    loading,
    error,
    getMetricById,
    refetch: loadMetrics,
  };
}

