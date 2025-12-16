'use client';

import { useRouter, useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { providerApiClient, Patient } from '@/lib/api/provider-client';
import { format } from 'date-fns';
import Link from 'next/link';

export default function ProviderPatientDetailPage() {
  const router = useRouter();
  const params = useParams();
  const patientId = params.id as string;

  const { data: patient, isLoading } = useQuery<Patient>({
    queryKey: ['provider-patient', patientId],
    queryFn: () => providerApiClient.getPatient(patientId),
  });

  const { data: messages } = useQuery({
    queryKey: ['provider-patient-messages', patientId],
    queryFn: () => providerApiClient.getPatientMessages(patientId),
    enabled: !!patientId,
  });

  const { data: vitals } = useQuery({
    queryKey: ['provider-patient-vitals', patientId],
    queryFn: () => providerApiClient.getPatientVitals(patientId),
    enabled: !!patientId,
  });

  const { data: medications } = useQuery({
    queryKey: ['provider-patient-medications', patientId],
    queryFn: () => providerApiClient.getPatientMedications(patientId),
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
        <h2 className="text-2xl font-bold text-gray-900 mb-4">{patient.name}</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-gray-500">Email</label>
            <p className="text-sm text-gray-900">{patient.email || '-'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Phone</label>
            <p className="text-sm text-gray-900">{patient.phone || '-'}</p>
          </div>
          {patient.date_of_birth && (
            <div>
              <label className="text-sm font-medium text-gray-500">Date of Birth</label>
              <p className="text-sm text-gray-900">{format(new Date(patient.date_of_birth), 'PP')}</p>
            </div>
          )}
          {patient.mrn && (
            <div>
              <label className="text-sm font-medium text-gray-500">MRN</label>
              <p className="text-sm text-gray-900">{patient.mrn}</p>
            </div>
          )}
          <div>
            <label className="text-sm font-medium text-gray-500">Status</label>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              patient.active
                ? 'bg-green-100 text-green-800'
                : 'bg-gray-100 text-gray-800'
            }`}>
              {patient.active ? 'Active' : 'Inactive'}
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
        {messages && messages.length > 0 ? (
          <ul className="space-y-3">
            {messages.slice(0, 5).map((message) => (
              <li key={message.id} className="border-b border-gray-200 pb-3 last:border-0 last:pb-0">
                <Link href={`/provider/messages/${message.id}`}>
                  <p className="text-sm text-gray-900">{message.content}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {format(new Date(message.created_at), 'PPpp')}
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
            {vitals.slice(0, 5).map((vital: any) => (
              <div key={vital.id} className="border-b border-gray-200 pb-3 last:border-0 last:pb-0">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{vital.type}</p>
                    <p className="text-xs text-gray-500">
                      {format(new Date(vital.timestamp), 'PPpp')}
                    </p>
                  </div>
                  {vital.urgency && (
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      vital.urgency === 'red' ? 'bg-red-100 text-red-800' :
                      vital.urgency === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {vital.urgency.toUpperCase()}
                    </span>
                  )}
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
            {medications.map((med: any) => (
              <li key={med.id} className="border-b border-gray-200 pb-3 last:border-0 last:pb-0">
                <p className="text-sm font-medium text-gray-900">{med.name}</p>
                {med.dosage && (
                  <p className="text-xs text-gray-500">{med.dosage} - {med.frequency}</p>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500">No medications</p>
        )}
      </div>
    </div>
  );
}
