'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth-store';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/solopractice-client';

export default function MedicationsPage() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, router]);

  const { data: medications, isLoading } = useQuery({
    queryKey: ['medications'],
    queryFn: () => apiClient.getMedications(),
    enabled: isAuthenticated,
  });

  const requestRefillMutation = useMutation({
    mutationFn: (medicationId: string) => apiClient.requestRefill(medicationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medications'] });
    },
  });

  if (!isAuthenticated) {
    return null;
  }

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
            <h1 className="text-2xl font-bold text-gray-900">Medications</h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
          </div>
        ) : medications && medications.length > 0 ? (
          <div className="space-y-4">
            {medications.map((medication) => (
              <MedicationCard
                key={medication.id}
                medication={medication}
                onRequestRefill={(id) => requestRefillMutation.mutate(id)}
                isRequesting={requestRefillMutation.isPending}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-500">No medications found</p>
          </div>
        )}

        {/* Refill Response */}
        {requestRefillMutation.data && (
          <div
            className={`mt-4 p-4 rounded-lg ${
              requestRefillMutation.data.status === 'approved'
                ? 'bg-green-50 text-green-800'
                : requestRefillMutation.data.status === 'blocked'
                ? 'bg-red-50 text-red-800'
                : 'bg-yellow-50 text-yellow-800'
            }`}
          >
            {requestRefillMutation.data.status === 'approved' && (
              <p>Refill request approved</p>
            )}
            {requestRefillMutation.data.status === 'blocked' && (
              <div>
                <p className="font-semibold">Refill blocked</p>
                {requestRefillMutation.data.reason && (
                  <p className="text-sm mt-1">{requestRefillMutation.data.reason}</p>
                )}
                {requestRefillMutation.data.required_labs &&
                  requestRefillMutation.data.required_labs.length > 0 && (
                    <div className="mt-2">
                      <p className="text-sm font-medium">Required labs:</p>
                      <ul className="list-disc list-inside text-sm mt-1">
                        {requestRefillMutation.data.required_labs.map((lab, idx) => (
                          <li key={idx}>{lab}</li>
                        ))}
                      </ul>
                    </div>
                  )}
              </div>
            )}
            {requestRefillMutation.data.status === 'pending' && (
              <p>Refill request pending review</p>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

function MedicationCard({
  medication,
  onRequestRefill,
  isRequesting,
}: {
  medication: any;
  onRequestRefill: (id: string) => void;
  isRequesting: boolean;
}) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{medication.name}</h3>
          {medication.dosage && (
            <p className="text-sm text-gray-600 mt-1">Dosage: {medication.dosage}</p>
          )}
          {medication.frequency && (
            <p className="text-sm text-gray-600">Frequency: {medication.frequency}</p>
          )}
          {medication.refills_remaining !== undefined && (
            <p className="text-sm text-gray-600 mt-2">
              Refills remaining: {medication.refills_remaining}
            </p>
          )}
        </div>
        {medication.refills_remaining !== undefined && medication.refills_remaining > 0 && (
          <button
            onClick={() => onRequestRefill(medication.id)}
            disabled={isRequesting}
            className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 disabled:opacity-50"
          >
            {isRequesting ? 'Requesting...' : 'Request Refill'}
          </button>
        )}
      </div>
    </div>
  );
}
