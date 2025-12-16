'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth-store';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/solopractice-client';
import { format } from 'date-fns';

export default function VitalsPage() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const queryClient = useQueryClient();

  const [systolic, setSystolic] = useState('');
  const [diastolic, setDiastolic] = useState('');
  const [weight, setWeight] = useState('');
  const [showBPForm, setShowBPForm] = useState(false);
  const [showWeightForm, setShowWeightForm] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, router]);

  const { data: measurements, isLoading } = useQuery({
    queryKey: ['measurements'],
    queryFn: () => apiClient.getMeasurements(),
    enabled: isAuthenticated,
  });

  const recordBPMutation = useMutation({
    mutationFn: (data: { systolic: number; diastolic: number }) =>
      apiClient.recordMeasurement({
        type: 'blood_pressure',
        value: {
          systolic: data.systolic,
          diastolic: data.diastolic,
          unit: 'mmHg',
        },
        source: 'manual',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['measurements'] });
      setSystolic('');
      setDiastolic('');
      setShowBPForm(false);
    },
  });

  const recordWeightMutation = useMutation({
    mutationFn: (weight: number) =>
      apiClient.recordMeasurement({
        type: 'weight',
        value: {
          value: weight,
          unit: 'lbs',
        },
        source: 'manual',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['measurements'] });
      setWeight('');
      setShowWeightForm(false);
    },
  });

  if (!isAuthenticated) {
    return null;
  }

  const bpMeasurements = measurements?.filter((m) => m.type === 'blood_pressure') || [];
  const weightMeasurements = measurements?.filter((m) => m.type === 'weight') || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.back()}
              className="text-primary-600 hover:text-primary-700"
            >
              ← Back
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Vital Signs</h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Blood Pressure</h2>
            {!showBPForm ? (
              <button
                onClick={() => setShowBPForm(true)}
                className="w-full bg-primary-600 text-white py-2 rounded-md hover:bg-primary-700"
              >
                Record Blood Pressure
              </button>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Systolic
                  </label>
                  <input
                    type="number"
                    value={systolic}
                    onChange={(e) => setSystolic(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-4 py-2"
                    placeholder="120"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Diastolic
                  </label>
                  <input
                    type="number"
                    value={diastolic}
                    onChange={(e) => setDiastolic(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-4 py-2"
                    placeholder="80"
                  />
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      if (systolic && diastolic) {
                        recordBPMutation.mutate({
                          systolic: parseInt(systolic),
                          diastolic: parseInt(diastolic),
                        });
                      }
                    }}
                    disabled={recordBPMutation.isPending}
                    className="flex-1 bg-primary-600 text-white py-2 rounded-md hover:bg-primary-700 disabled:opacity-50"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setShowBPForm(false);
                      setSystolic('');
                      setDiastolic('');
                    }}
                    className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Weight</h2>
            {!showWeightForm ? (
              <button
                onClick={() => setShowWeightForm(true)}
                className="w-full bg-primary-600 text-white py-2 rounded-md hover:bg-primary-700"
              >
                Record Weight
              </button>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Weight (lbs)
                  </label>
                  <input
                    type="number"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-4 py-2"
                    placeholder="150"
                  />
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      if (weight) {
                        recordWeightMutation.mutate(parseFloat(weight));
                      }
                    }}
                    disabled={recordWeightMutation.isPending}
                    className="flex-1 bg-primary-600 text-white py-2 rounded-md hover:bg-primary-700 disabled:opacity-50"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setShowWeightForm(false);
                      setWeight('');
                    }}
                    className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Recent Measurements */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Recent Measurements</h2>
          </div>
          <div className="p-6">
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto"></div>
              </div>
            ) : measurements && measurements.length > 0 ? (
              <div className="space-y-4">
                {measurements.slice(0, 10).map((measurement) => (
                  <div
                    key={measurement.id}
                    className="flex justify-between items-center p-4 border border-gray-200 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-gray-900 capitalize">
                        {measurement.type.replace('_', ' ')}
                      </p>
                      <p className="text-sm text-gray-500">
                        {format(new Date(measurement.timestamp), 'PPp')}
                      </p>
                    </div>
                    <div className="text-right">
                      {measurement.type === 'blood_pressure' && (
                        <p className="font-semibold">
                          {measurement.value.systolic}/{measurement.value.diastolic} mmHg
                        </p>
                      )}
                      {measurement.type === 'weight' && (
                        <p className="font-semibold">
                          {measurement.value.value} {measurement.value.unit}
                        </p>
                      )}
                      {measurement.urgency && (
                        <span
                          className={`text-xs px-2 py-1 rounded ${
                            measurement.urgency === 'red'
                              ? 'bg-red-100 text-red-800'
                              : measurement.urgency === 'yellow'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-green-100 text-green-800'
                          }`}
                        >
                          {measurement.urgency.toUpperCase()}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No measurements yet</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
