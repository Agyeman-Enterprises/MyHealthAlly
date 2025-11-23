import { useState, useEffect } from 'react';
import { fetchAPI } from '@/lib/utils';

export interface LabOrder {
  id: string;
  testName: string;
  status: string;
  orderedAt: string;
  completedAt?: string;
  results?: any;
}

export function useLabOrders() {
  const [orders, setOrders] = useState<LabOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchAPI('/patients/me/lab-orders');
      setOrders(data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load lab orders');
    } finally {
      setLoading(false);
    }
  };

  return {
    orders,
    loading,
    error,
    refetch: loadOrders,
  };
}

export function useLabResults() {
  const [results, setResults] = useState<LabOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadResults();
  }, []);

  const loadResults = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchAPI('/patients/me/lab-results');
      setResults(data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load lab results');
    } finally {
      setLoading(false);
    }
  };

  return {
    results,
    loading,
    error,
    refetch: loadResults,
  };
}

