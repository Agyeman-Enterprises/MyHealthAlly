'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth-store';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/solopractice-client';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { DisclaimerBanner } from '@/components/governance/DisclaimerBanner';
import { StatusMessage } from '@/components/ux/StatusMessage';
import { PatientFacingCopy } from '@/lib/ux-copy/patient-facing';

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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50/30 pb-20 md:pb-8">
      <Header title="Medications" showBack />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
        {/* Rule 4: Radical Role Clarity - Disclaimer */}
        <DisclaimerBanner type="standard" className="mb-6" />
        
        {/* Medication Request Information */}
        <Card variant="elevated" className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">
            {PatientFacingCopy.medicationRequest.title}
          </h2>
          <p className="text-gray-600 mb-4">
            {PatientFacingCopy.medicationRequest.description}
          </p>
          <div className="space-y-2 mb-4">
            <p className="text-sm font-medium text-gray-700">
              {PatientFacingCopy.medicationRequest.pleaseNote}
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 ml-2">
              {PatientFacingCopy.medicationRequest.notes.map((note, index) => (
                <li key={index}>{note}</li>
              ))}
            </ul>
          </div>
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded">
            <p className="text-sm font-medium text-yellow-900">
              {PatientFacingCopy.medicationRequest.warning}
            </p>
          </div>
        </Card>
        
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-200 border-t-primary-600 mb-4"></div>
            <p className="text-gray-500">Loading medications...</p>
          </div>
        ) : medications && medications.length > 0 ? (
          <div className="space-y-4">
            {medications.map((medication, index) => (
              <MedicationCard
                key={medication.id}
                medication={medication}
                onRequestRefill={(id) => requestRefillMutation.mutate(id)}
                isRequesting={requestRefillMutation.isPending}
                index={index}
              />
            ))}
          </div>
        ) : (
          <Card variant="elevated" className="text-center py-16">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No medications found</h3>
            <p className="text-gray-500">Your medications will appear here</p>
          </Card>
        )}

        {/* Refill Response */}
        {requestRefillMutation.data && (
          <Card
            variant="elevated"
            className={`mt-4 animate-slide-in border-l-4 ${
              requestRefillMutation.data.status === 'approved'
                ? 'bg-green-50 border-l-green-500'
                : requestRefillMutation.data.status === 'blocked'
                ? 'bg-red-50 border-l-red-500'
                : 'bg-yellow-50 border-l-yellow-500'
            }`}
          >
            <div className="flex items-start">
              <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                requestRefillMutation.data.status === 'approved'
                  ? 'bg-green-100'
                  : requestRefillMutation.data.status === 'blocked'
                  ? 'bg-red-100'
                  : 'bg-yellow-100'
              }`}>
                {requestRefillMutation.data.status === 'approved' ? (
                  <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : requestRefillMutation.data.status === 'blocked' ? (
                  <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
              </div>
              <div className="ml-4 flex-1">
                {requestRefillMutation.data.status === 'approved' && (
                  <div>
                    <p className="font-semibold text-green-900">Refill request approved</p>
                    <p className="text-sm text-green-700 mt-1">Your refill has been processed</p>
                  </div>
                )}
                {requestRefillMutation.data.status === 'blocked' && (
                  <div>
                    <p className="font-semibold text-red-900">Refill blocked</p>
                    {requestRefillMutation.data.reason && (
                      <p className="text-sm text-red-700 mt-1">{requestRefillMutation.data.reason}</p>
                    )}
                    {requestRefillMutation.data.required_labs &&
                      requestRefillMutation.data.required_labs.length > 0 && (
                        <div className="mt-3">
                          <p className="text-sm font-medium text-red-900">Required labs:</p>
                          <ul className="list-disc list-inside text-sm text-red-700 mt-1 space-y-1">
                            {requestRefillMutation.data.required_labs.map((lab, idx) => (
                              <li key={idx}>{lab}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                  </div>
                )}
                {requestRefillMutation.data.status === 'pending' && (
                  <div>
                    <p className="font-semibold text-yellow-900">Refill request pending</p>
                    <p className="text-sm text-yellow-700 mt-1">Your request is being reviewed</p>
                  </div>
                )}
              </div>
            </div>
          </Card>
        )}
      </main>

      <BottomNav />
    </div>
  );
}

function MedicationCard({
  medication,
  onRequestRefill,
  isRequesting,
  index,
}: {
  medication: any;
  onRequestRefill: (id: string) => void;
  isRequesting: boolean;
  index: number;
}) {
  const hasRefills = medication.refills_remaining !== undefined && medication.refills_remaining > 0;

  return (
    <Card
      variant="elevated"
      hover
      className="border-l-4 border-l-primary-500 animate-fade-in"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{medication.name}</h3>
              <div className="space-y-1">
                {medication.dosage && (
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Dosage:</span> {medication.dosage}
                  </p>
                )}
                {medication.frequency && (
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Frequency:</span> {medication.frequency}
                  </p>
                )}
                {medication.refills_remaining !== undefined && (
                  <p className="text-sm">
                    <span className="font-medium text-gray-600">Refills remaining:</span>{' '}
                    <span className={`font-semibold ${
                      medication.refills_remaining > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {medication.refills_remaining}
                    </span>
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
        {hasRefills && (
          <Button
            variant="primary"
            size="sm"
            onClick={() => onRequestRefill(medication.id)}
            isLoading={isRequesting}
            className="ml-4 flex-shrink-0"
          >
            Request Refill
          </Button>
        )}
      </div>
    </Card>
  );
}
