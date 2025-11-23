'use client';

import { Builder } from '@builder.io/react';
import { PatientVitalsCard } from '@/components/patient/PatientVitalsCard';
import { PatientCarePlanCard } from '@/components/patient/PatientCarePlanCard';
import { PatientTasksList } from '@/components/patient/PatientTasksList';
import { PatientMessagesPreview } from '@/components/patient/PatientMessagesPreview';
import { PatientUpcomingVisitCard } from '@/components/patient/PatientUpcomingVisitCard';
import { PatientVoiceCapture } from '@/components/patient/PatientVoiceCapture';
import { VitalsCard } from '@/components/patient/VitalsCard';
import { HRVTrendCard } from '@/components/patient/HRVTrendCard';
import { StaffMAInbox } from '@/components/staff/StaffMAInbox';
import { StaffVisitRequests } from '@/components/staff/StaffVisitRequests';
import { StaffVirtualQueue } from '@/components/staff/StaffVirtualQueue';
import { StaffPatientSummary } from '@/components/staff/StaffPatientSummary';
import { StaffCarePlanBuilder } from '@/components/staff/StaffCarePlanBuilder';
import { StaffContentLibrary } from '@/components/staff/StaffContentLibrary';

// Call this once at app bootstrap (e.g. in layout or a provider)
export function registerBuilderComponents() {
  // PATIENT COMPONENTS
  Builder.registerComponent(PatientVitalsCard, {
    name: 'PatientVitalsCard',
    inputs: [
      { name: 'title', type: 'string', defaultValue: 'Key Vitals' },
      { name: 'metrics', type: 'list', subFields: [{ name: 'id', type: 'string' }] },
    ],
  });

  Builder.registerComponent(PatientCarePlanCard, {
    name: 'PatientCarePlanCard',
    inputs: [
      { name: 'showProgress', type: 'boolean', defaultValue: true },
    ],
  });

  Builder.registerComponent(PatientTasksList, {
    name: 'PatientTasksList',
    inputs: [
      { name: 'maxItems', type: 'number', defaultValue: 5 },
    ],
  });

  Builder.registerComponent(PatientMessagesPreview, {
    name: 'PatientMessagesPreview',
    inputs: [
      { name: 'maxThreads', type: 'number', defaultValue: 2 },
    ],
  });

  Builder.registerComponent(PatientUpcomingVisitCard, {
    name: 'PatientUpcomingVisitCard',
    inputs: [],
  });

  Builder.registerComponent(PatientVoiceCapture, {
    name: 'PatientVoiceCapture',
    inputs: [
      { name: 'hintText', type: 'string', defaultValue: 'Speak to MyHealthAlly' },
    ],
  });

  // STAFF COMPONENTS
  Builder.registerComponent(StaffMAInbox, {
    name: 'StaffMAInbox',
    inputs: [],
  });

  Builder.registerComponent(StaffVisitRequests, {
    name: 'StaffVisitRequests',
    inputs: [
      { name: 'initialTab', type: 'string', defaultValue: 'walk-ins' },
    ],
  });

  Builder.registerComponent(StaffVirtualQueue, {
    name: 'StaffVirtualQueue',
    inputs: [],
  });

  Builder.registerComponent(StaffPatientSummary, {
    name: 'StaffPatientSummary',
    inputs: [
      { name: 'showAlerts', type: 'boolean', defaultValue: true },
      { name: 'patientId', type: 'string' },
    ],
  });

  Builder.registerComponent(StaffCarePlanBuilder, {
    name: 'StaffCarePlanBuilder',
    inputs: [],
  });

  Builder.registerComponent(StaffContentLibrary, {
    name: 'StaffContentLibrary',
    inputs: [],
  });

  // HRV & VITALS COMPONENTS
  Builder.registerComponent(VitalsCard, {
    name: 'Vitals Card',
    inputs: [
      { name: 'name', type: 'string', defaultValue: 'Alex' },
      { name: 'heartRate', type: 'number', defaultValue: 68 },
      { name: 'spo2', type: 'number', defaultValue: 98 },
      { name: 'respiration', type: 'number', defaultValue: 14 },
      { name: 'bmi', type: 'number', defaultValue: 24.1 },
      { name: 'bmiLabel', type: 'text', defaultValue: 'Healthy range' },
      { name: 'recoveryScore', type: 'number', defaultValue: 85 },
      {
        name: 'stressLevel',
        type: 'text',
        enum: ['low', 'moderate', 'high'],
        defaultValue: 'low',
      },
    ],
  });

  Builder.registerComponent(HRVTrendCard, {
    name: 'HRV Trend Card',
    inputs: [
      { name: 'title', type: 'string', defaultValue: 'Health trends' },
      { name: 'statusLabel', type: 'string', defaultValue: 'In a healthy range' },
      {
        name: 'points',
        type: 'list',
        subFields: [
          { name: 'date', type: 'string' },
          { name: 'value', type: 'number' },
        ],
      },
    ],
  });
}

