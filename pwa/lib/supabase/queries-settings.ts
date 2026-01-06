import { supabase } from './client';

export interface UserSettingsPayload {
  notificationSettings?: {
    channels: {
      push?: boolean;
      sms?: boolean;
      email?: boolean;
    };
    categories: {
      messages?: boolean;
      appointments?: boolean;
      labResults?: boolean;
      medications?: boolean;
      billing?: boolean;
    };
  };
  appearancePreferences?: {
    theme?: 'light' | 'dark' | 'system';
    textSize?: 'small' | 'medium' | 'large';
    highContrast?: boolean;
    reduceMotion?: boolean;
  };
  preferredLanguage?: string;
  communicationLanguage?: string;
  twoFactorEnabled?: boolean;
  biometricEnabled?: boolean;
  pinHash?: string | null;
  phone?: string;
  email?: string;
}

export interface PatientProfilePayload {
  first_name?: string;
  last_name?: string;
  date_of_birth?: string | null;
  address?: {
    street1: string;
    street2?: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  emergency_contact?: {
    name: string;
    relationship: string;
    phone: string;
    email?: string;
  };
  appointment_reminders?: boolean;
  medication_reminders?: boolean;
}

export async function getCurrentUserAndPatient() {
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) throw authError || new Error('User not authenticated');

  const { data: userRecord, error: userError } = await supabase
    .from('users')
    .select('id, supabase_auth_id, email, phone, preferred_language, communication_language, notification_settings, appearance_preferences, two_factor_enabled, patients(id, first_name, last_name, date_of_birth, appointment_reminders, medication_reminders, address, emergency_contact, attachment_status, practice_id, sp_patient_id)')
    .eq('supabase_auth_id', authData.user.id)
    .single();

  if (userError || !userRecord) throw userError || new Error('User record not found');

  const patientRecord = Array.isArray(userRecord.patients)
    ? userRecord.patients[0]
    : userRecord.patients;
  const patientId =
    patientRecord && typeof patientRecord === 'object' && 'id' in patientRecord
      ? (patientRecord as { id?: string }).id ?? null
      : null;

  // Extract full patient object with attachment fields
  type PatientWithAttachment = {
    id: string;
    first_name?: string;
    last_name?: string;
    attachment_status?: string;
    practice_id?: string | null;
    sp_patient_id?: string | null;
  };

  const patient = patientRecord && typeof patientRecord === 'object' && 'id' in patientRecord
    ? (patientRecord as PatientWithAttachment)
    : null;

  // Shape user object for attachPractice
  // Use patient's first_name/last_name if available, otherwise undefined
  const patientFirstName = patient?.first_name;
  const patientLastName = patient?.last_name;

  const user = {
    id: userRecord.id,
    email: userRecord.email || '',
    firstName: patientFirstName,
    lastName: patientLastName,
    phone: userRecord.phone || null,
  };

  return { authUser: authData.user, userRecord, patientId, patient, user };
}

export async function updateUserSettings(userId: string, payload: UserSettingsPayload) {
  const { data, error } = await supabase
    .from('users')
    .update({
      notification_settings: payload.notificationSettings,
      appearance_preferences: payload.appearancePreferences,
      preferred_language: payload.preferredLanguage,
      communication_language: payload.communicationLanguage,
      two_factor_enabled: payload.twoFactorEnabled,
      biometric_enabled: payload.biometricEnabled,
      pin_hash: payload.pinHash,
      phone: payload.phone,
      email: payload.email,
    })
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updatePatientProfile(patientId: string, payload: PatientProfilePayload) {
  const { data, error } = await supabase
    .from('patients')
    .update(payload)
    .eq('id', patientId)
    .select()
    .single();

  if (error) throw error;
  return data;
}
