'use client';

import { useRouter, useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { getPatient, getMessageThreads, getPatientVitals } from '@/lib/supabase/queries';
import { getPatientMedications } from '@/lib/supabase/queries-medications';
import { getPatientLabOrders } from '@/lib/supabase/queries-labs';
import { getPatientCarePlans } from '@/lib/supabase/queries-careplans';
import { format } from 'date-fns';
import Link from 'next/link';
import type { MessageThread } from '@/lib/supabase/types';
import { DisclaimerBanner } from '@/components/governance/DisclaimerBanner';

export default function ProviderPatientDetailPage() {
  const router = useRouter();
  const params = useParams();
  const patientId = typeof params['id'] === 'string' ? params['id'] : '';

  const { data: patient, isLoading } = useQuery({
    queryKey: ['provider-patient', patientId],
    queryFn: () => getPatient(patientId),
  });

  const { data: messageThreads } = useQuery({
    queryKey: ['provider-patient-messages', patientId],
    queryFn: () => getMessageThreads({ patientId, limit: 5 }),
    enabled: !!patientId,
  });

  const { data: vitals } = useQuery({
    queryKey: ['provider-patient-vitals', patientId],
    queryFn: () => getPatientVitals(patientId, { limit: 5 }),
    enabled: !!patientId,
  });

  const { data: medications } = useQuery({
    queryKey: ['provider-patient-medications', patientId],
    queryFn: () => getPatientMedications(patientId),
    enabled: !!patientId,
  });

  const { data: labOrders } = useQuery({
    queryKey: ['provider-patient-labs', patientId],
    queryFn: () => getPatientLabOrders(patientId, { limit: 5 }),
    enabled: !!patientId,
  });

  const { data: carePlans } = useQuery({
    queryKey: ['provider-patient-careplans', patientId],
    queryFn: () => getPatientCarePlans(patientId),
    enabled: !!patientId,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading patient...</div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">Patient not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <DisclaimerBanner type="standard" className="mb-6" />
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="text-sm text-gray-600 hover:text-gray-900"
        >
          ← Back to Patients
        </button>
      </div>

      {/* Patient Info */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          {patient.first_name} {patient.last_name}
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-gray-500">Email</label>
            <p className="text-sm text-gray-900">{patient.users?.email || '-'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Phone</label>
            <p className="text-sm text-gray-900">{patient.users?.phone || '-'}</p>
          </div>
          {patient.date_of_birth && (
            <div>
              <label className="text-sm font-medium text-gray-500">Date of Birth</label>
              <p className="text-sm text-gray-900">{format(new Date(patient.date_of_birth), 'PP')}</p>
            </div>
          )}
          {patient.medical_record_number && (
            <div>
              <label className="text-sm font-medium text-gray-500">MRN</label>
              <p className="text-sm text-gray-900">{patient.medical_record_number}</p>
            </div>
          )}
          <div>
            <label className="text-sm font-medium text-gray-500">Status</label>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Active
            </span>
          </div>
        </div>
      </div>

      {/* Recent Messages */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Recent Messages</h3>
          <Link
            href={`/provider/messages?patient_id=${patientId}`}
            className="text-sm text-primary-600 hover:text-primary-700"
          >
            View All
          </Link>
        </div>
        {messageThreads && messageThreads.length > 0 ? (
          <ul className="space-y-3">
            {messageThreads.slice(0, 5).map((thread: MessageThread & { patients?: { first_name: string; last_name: string; preferred_name: string | null } }) => (
              <li key={thread.id} className="border-b border-gray-200 pb-3 last:border-0 last:pb-0">
                <Link href={`/provider/messages/${thread.id}`}>
                  <p className="text-sm text-gray-900">{thread.last_message_preview || thread.subject || 'No preview'}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {thread.last_message_at ? format(new Date(thread.last_message_at), 'PPpp') : 'No messages'}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500">No messages</p>
        )}
      </div>

      {/* Recent Vitals */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Vital Signs</h3>
        {vitals && vitals.length > 0 ? (
          <div className="space-y-3">
            {vitals.slice(0, 5).map((vital) => (
              <div key={vital.id} className="border-b border-gray-200 pb-3 last:border-0 last:pb-0">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{vital.type}</p>
                    <p className="text-xs text-gray-500">
                      {format(
                        new Date(
                          (vital as { timestamp?: string; measured_at?: string; created_at?: string }).timestamp ||
                          (vital as { timestamp?: string; measured_at?: string; created_at?: string }).measured_at ||
                          (vital as { timestamp?: string; measured_at?: string; created_at?: string }).created_at ||
                          ''
                        ),
                        'PPpp'
                      )}
                    </p>
                  </div>
                  {(() => {
                    const urgency = (vital as { urgency?: string }).urgency;
                    if (!urgency) return null;
                    return (
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        urgency === 'red' ? 'bg-red-100 text-red-800' :
                        urgency === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {urgency.toUpperCase()}
                      </span>
                    );
                  })()}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">No vital signs recorded</p>
        )}
      </div>

      {/* Medications */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Medications</h3>
        {medications && medications.length > 0 ? (
          <ul className="space-y-3">
            {medications.map((med) => {
              const medInfo = med as {
                id: string;
                name?: string | null;
                dosage?: string | number | null;
                dosage_unit?: string | null;
                frequency?: string | null;
                is_active?: boolean | null;
              };
              return (
                <li key={medInfo.id} className="border-b border-gray-200 pb-3 last:border-0 last:pb-0">
                  <p className="text-sm font-medium text-gray-900">{medInfo.name || 'Medication'}</p>
                  <p className="text-xs text-gray-500">
                    {medInfo.dosage ?? '—'} {medInfo.dosage_unit ?? ''} - {medInfo.frequency ?? 'unspecified'}
                  </p>
                  {medInfo.is_active === false && (
                    <p className="text-xs text-red-500">Discontinued</p>
                  )}
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-sm text-gray-500">No medications</p>
        )}
      </div>

      {/* Lab Orders */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Lab Orders</h3>
        {labOrders && labOrders.length > 0 ? (
          <ul className="space-y-3">
            {labOrders.map((lab) => {
              const labInfo = lab as {
                id: string;
                status?: string | null;
                ordered_at?: string | null;
                lab_tests?: Array<{ id?: string; name?: string; test_name?: string; result?: string; status?: string | null }>;
              };
              const firstTest = labInfo.lab_tests?.[0];
              const label = firstTest?.name || firstTest?.test_name || 'Lab Order';
              return (
                <li key={labInfo.id} className="border-b border-gray-200 pb-3 last:border-0 last:pb-0">
                  <p className="text-sm font-medium text-gray-900">
                    {label}
                  </p>
                  <p className="text-xs text-gray-500">
                    Status: {labInfo.status || 'pending'} | Ordered: {labInfo.ordered_at ? format(new Date(labInfo.ordered_at), 'MMM d, yyyy') : 'N/A'}
                  </p>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-sm text-gray-500">No lab orders</p>
        )}
      </div>

      {/* Care Plans */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Care Plans</h3>
        {carePlans && carePlans.length > 0 ? (
          <ul className="space-y-3">
            {carePlans.map((plan: { id: string; title: string; status: string; created_at: string }) => (
              <li key={plan.id} className="border-b border-gray-200 pb-3 last:border-0 last:pb-0">
                <p className="text-sm font-medium text-gray-900">{plan.title}</p>
                <p className="text-xs text-gray-500">Status: {plan.status}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500">No care plans</p>
        )}
      </div>
    </div>
  );
}
