'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth-store';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/solopractice-client';
import { format } from 'date-fns';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { DisclaimerBanner } from '@/components/governance/DisclaimerBanner';

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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50/30 pb-20 md:pb-8">
      <Header title="Vital Signs" showBack />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
        {/* Rule 4: Radical Role Clarity - Disclaimer */}
        <DisclaimerBanner type="standard" className="mb-6" />
        
        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Blood Pressure Card */}
          <Card variant="elevated" className="border-l-4 border-l-red-500">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-1">Blood Pressure</h2>
                <p className="text-sm text-gray-500">Track your BP readings</p>
              </div>
              <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
            </div>
            
            {!showBPForm ? (
              <Button
                variant="primary"
                size="md"
                onClick={() => setShowBPForm(true)}
                className="w-full"
              >
                Record Blood Pressure
              </Button>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Systolic"
                    type="number"
                    placeholder="120"
                    value={systolic}
                    onChange={(e) => setSystolic(e.target.value)}
                  />
                  <Input
                    label="Diastolic"
                    type="number"
                    placeholder="80"
                    value={diastolic}
                    onChange={(e) => setDiastolic(e.target.value)}
                  />
                </div>
                <div className="flex space-x-3">
                  <Button
                    variant="primary"
                    size="md"
                    onClick={() => {
                      if (systolic && diastolic) {
                        recordBPMutation.mutate({
                          systolic: parseInt(systolic),
                          diastolic: parseInt(diastolic),
                        });
                      }
                    }}
                    isLoading={recordBPMutation.isPending}
                    className="flex-1"
                  >
                    Save
                  </Button>
                  <Button
                    variant="secondary"
                    size="md"
                    onClick={() => {
                      setShowBPForm(false);
                      setSystolic('');
                      setDiastolic('');
                    }}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </Card>

          {/* Weight Card */}
          <Card variant="elevated" className="border-l-4 border-l-blue-500">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-1">Weight</h2>
                <p className="text-sm text-gray-500">Track your weight</p>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                </svg>
              </div>
            </div>
            
            {!showWeightForm ? (
              <Button
                variant="primary"
                size="md"
                onClick={() => setShowWeightForm(true)}
                className="w-full"
              >
                Record Weight
              </Button>
            ) : (
              <div className="space-y-4">
                <Input
                  label="Weight (lbs)"
                  type="number"
                  placeholder="150"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                />
                <div className="flex space-x-3">
                  <Button
                    variant="primary"
                    size="md"
                    onClick={() => {
                      if (weight) {
                        recordWeightMutation.mutate(parseFloat(weight));
                      }
                    }}
                    isLoading={recordWeightMutation.isPending}
                    className="flex-1"
                  >
                    Save
                  </Button>
                  <Button
                    variant="secondary"
                    size="md"
                    onClick={() => {
                      setShowWeightForm(false);
                      setWeight('');
                    }}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Recent Measurements */}
        <Card variant="elevated">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Measurements</h2>
          
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary-200 border-t-primary-600 mb-4"></div>
              <p className="text-gray-500">Loading measurements...</p>
            </div>
          ) : measurements && measurements.length > 0 ? (
            <div className="space-y-4">
              {measurements.slice(0, 10).map((measurement) => (
                <div
                  key={measurement.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      measurement.type === 'blood_pressure' ? 'bg-red-100' : 'bg-blue-100'
                    }`}>
                      {measurement.type === 'blood_pressure' ? (
                        <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                      ) : (
                        <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                        </svg>
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 capitalize">
                        {measurement.type.replace('_', ' ')}
                      </p>
                      <p className="text-sm text-gray-500">
                        {format(new Date(measurement.timestamp), 'MMM d, yyyy • h:mm a')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    {measurement.type === 'blood_pressure' && (
                      <p className="text-lg font-bold text-gray-900">
                        {measurement.value.systolic}/{measurement.value.diastolic}
                        <span className="text-sm font-normal text-gray-500 ml-1">mmHg</span>
                      </p>
                    )}
                    {measurement.type === 'weight' && (
                      <p className="text-lg font-bold text-gray-900">
                        {measurement.value.value}
                        <span className="text-sm font-normal text-gray-500 ml-1">{measurement.value.unit}</span>
                      </p>
                    )}
                    {measurement.urgency && (
                      <span
                        className={`inline-block mt-1 text-xs font-medium px-2 py-1 rounded-full ${
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
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <p className="text-gray-500">No measurements recorded yet</p>
            </div>
          )}
        </Card>
      </main>

      <BottomNav />
    </div>
  );
}
