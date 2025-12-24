-- MyHealthAlly Supabase Database Schema
-- Based on files 01-07
-- This creates all tables, enums, and indexes for MHA

-- ============================================
-- ENUMS
-- ============================================

-- User & Auth
CREATE TYPE user_role AS ENUM ('patient', 'clinician', 'care_coordinator', 'admin');
CREATE TYPE user_status AS ENUM ('active', 'inactive', 'pending_verification', 'suspended');

-- Languages - CRITICAL for i18n
CREATE TYPE language AS ENUM ('en', 'ch', 'chu', 'mh', 'es', 'fil');

-- Patient specific
CREATE TYPE gender AS ENUM ('male', 'female', 'other', 'prefer_not_to_say');
CREATE TYPE insurance_type AS ENUM ('medicaid', 'medicare', 'private', 'tricare', 'cofa', 'self_pay', 'other');
CREATE TYPE cofa_status AS ENUM ('fsm', 'rmi', 'palau', 'not_applicable');

-- Vitals
CREATE TYPE vital_type AS ENUM (
  'blood_pressure', 'heart_rate', 'hrv', 'weight', 'bmi', 'glucose',
  'spo2', 'temperature', 'respiratory_rate', 'steps', 'sleep_hours', 'sleep_quality'
);
CREATE TYPE vital_source AS ENUM (
  'manual', 'apple_health', 'fitbit', 'oura', 'garmin', 'withings',
  'dexcom', 'freestyle_libre', 'omron', 'device_other'
);

-- Care Plans
CREATE TYPE care_plan_status AS ENUM ('draft', 'active', 'paused', 'completed', 'archived');
CREATE TYPE care_plan_section_type AS ENUM (
  'supplements', 'nutrition', 'lifestyle', 'exercise', 'labs',
  'medications', 'mindfulness', 'sleep', 'other'
);

-- Encounters
CREATE TYPE encounter_type AS ENUM (
  'initial_consult', 'follow_up', 'telehealth', 'in_person',
  'walk_in', 'urgent', 'lab_review', 'care_coordination'
);
CREATE TYPE encounter_status AS ENUM (
  'scheduled', 'checked_in', 'in_progress', 'completed', 'cancelled', 'no_show'
);

-- Messages
CREATE TYPE message_type AS ENUM ('text', 'voice', 'image', 'document', 'system');
CREATE TYPE message_priority AS ENUM ('normal', 'urgent', 'emergency');

-- Tasks
CREATE TYPE task_status AS ENUM ('pending', 'in_progress', 'completed', 'cancelled', 'overdue');
CREATE TYPE task_priority AS ENUM ('low', 'medium', 'high', 'urgent');
CREATE TYPE task_category AS ENUM (
  'vital_check', 'medication', 'appointment', 'lab_order',
  'care_plan_review', 'patient_outreach', 'documentation', 'billing', 'other'
);

-- Alerts
CREATE TYPE alert_severity AS ENUM ('info', 'low', 'medium', 'high', 'critical');
CREATE TYPE alert_status AS ENUM ('active', 'acknowledged', 'resolved', 'dismissed');

-- Billing - RPM/CCM codes
CREATE TYPE billing_code_type AS ENUM (
  'rpm_99453', 'rpm_99454', 'rpm_99457', 'rpm_99458',
  'ccm_99490', 'ccm_99439', 'ccm_99491',
  'pcm_99426', 'pcm_99427'
);

-- Labs
CREATE TYPE lab_status AS ENUM (
  'ordered', 'scheduled', 'collected', 'processing', 'resulted', 'reviewed', 'cancelled'
);

-- Documents
CREATE TYPE document_type AS ENUM (
  'insurance_card', 'id', 'lab_result', 'imaging', 'referral',
  'consent', 'intake_form', 'other'
);

-- Notifications
CREATE TYPE notification_type AS ENUM (
  'appointment_reminder', 'medication_reminder', 'vital_reminder',
  'lab_result', 'message', 'care_plan_update', 'alert', 'billing', 'system'
);
CREATE TYPE notification_channel AS ENUM ('in_app', 'push', 'sms', 'email');

-- ============================================
-- TABLES
-- ============================================

-- Users & Authentication
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supabase_auth_id UUID UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(20),
  role user_role NOT NULL DEFAULT 'patient',
  status user_status NOT NULL DEFAULT 'pending_verification',
  preferred_language language NOT NULL DEFAULT 'en',
  communication_language language NOT NULL DEFAULT 'en',
  brand VARCHAR(50) NOT NULL DEFAULT 'myhealthally',
  timezone VARCHAR(50) DEFAULT 'Pacific/Guam',
  pin_hash VARCHAR(64),
  biometric_enabled BOOLEAN DEFAULT false,
  failed_login_attempts INTEGER DEFAULT 0,
  locked_until TIMESTAMP,
  notification_settings JSONB DEFAULT '{"push": true, "sms": true, "email": true}'::jsonb,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  last_login_at TIMESTAMP,
  email_verified_at TIMESTAMP,
  phone_verified_at TIMESTAMP
);

CREATE TABLE user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  device_type VARCHAR(20),
  device_id VARCHAR(255),
  device_name VARCHAR(100),
  push_token VARCHAR(500),
  ip_address VARCHAR(45),
  user_agent VARCHAR(500),
  last_active_at TIMESTAMP NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Patients
CREATE TABLE patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  preferred_name VARCHAR(100),
  date_of_birth DATE NOT NULL,
  gender gender,
  address JSONB,
  emergency_contact JSONB,
  insurance_type insurance_type,
  insurance_provider VARCHAR(100),
  insurance_policy_number VARCHAR(100),
  insurance_group_number VARCHAR(100),
  insurance_card_front_url VARCHAR(500),
  insurance_card_back_url VARCHAR(500),
  cofa_status cofa_status DEFAULT 'not_applicable',
  cofa_document_url VARCHAR(500),
  primary_clinician_id UUID,
  medical_record_number VARCHAR(50),
  chronic_conditions JSONB DEFAULT '[]'::jsonb,
  allergies JSONB DEFAULT '[]'::jsonb,
  height_inches DECIMAL(5,2),
  glp1_eligible BOOLEAN DEFAULT false,
  glp1_start_date DATE,
  glp1_current_medication VARCHAR(100),
  rpm_enrolled BOOLEAN DEFAULT false,
  rpm_enrollment_date DATE,
  ccm_enrolled BOOLEAN DEFAULT false,
  ccm_enrollment_date DATE,
  onboarding_completed_at TIMESTAMP,
  intake_completed_at TIMESTAMP,
  appointment_reminders BOOLEAN DEFAULT true,
  medication_reminders BOOLEAN DEFAULT true,
  vital_reminders BOOLEAN DEFAULT true,
  avatar_url VARCHAR(500),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Clinicians
CREATE TABLE clinicians (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  title VARCHAR(50),
  credentials VARCHAR(100),
  npi_number VARCHAR(10),
  license_number VARCHAR(50),
  license_state VARCHAR(2),
  specialties JSONB DEFAULT '[]'::jsonb,
  bio TEXT,
  avatar_url VARCHAR(500),
  accepting_new_patients BOOLEAN DEFAULT true,
  default_appointment_duration INTEGER DEFAULT 30,
  schedule_settings JSONB,
  languages_spoken JSONB DEFAULT '["en"]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Vitals
CREATE TABLE vitals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  type vital_type NOT NULL,
  value DECIMAL(10,2) NOT NULL,
  value_secondary DECIMAL(10,2),
  unit VARCHAR(20) NOT NULL,
  source vital_source NOT NULL DEFAULT 'manual',
  device_id VARCHAR(100),
  measured_at TIMESTAMP NOT NULL,
  rpm_eligible BOOLEAN DEFAULT false,
  rpm_transmitted BOOLEAN DEFAULT false,
  rpm_transmitted_at TIMESTAMP,
  notes TEXT,
  is_abnormal BOOLEAN DEFAULT false,
  abnormal_reason VARCHAR(255),
  reviewed_by_clinician_id UUID REFERENCES clinicians(id),
  reviewed_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX vitals_patient_type_idx ON vitals(patient_id, type);
CREATE INDEX vitals_measured_at_idx ON vitals(measured_at);
CREATE INDEX vitals_patient_measured_idx ON vitals(patient_id, measured_at);

-- Message Threads
CREATE TABLE message_threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  subject VARCHAR(255),
  status VARCHAR(20) DEFAULT 'open',
  priority message_priority DEFAULT 'normal',
  has_red_flag BOOLEAN DEFAULT false,
  red_flag_reason VARCHAR(255),
  red_flag_acknowledged_at TIMESTAMP,
  red_flag_acknowledged_by_user_id UUID REFERENCES users(id),
  last_message_at TIMESTAMP,
  last_message_preview VARCHAR(255),
  patient_unread_count INTEGER DEFAULT 0,
  clinician_unread_count INTEGER DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX message_threads_patient_idx ON message_threads(patient_id);
CREATE INDEX message_threads_last_message_idx ON message_threads(last_message_at);

-- Messages
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID NOT NULL REFERENCES message_threads(id) ON DELETE CASCADE,
  sender_user_id UUID NOT NULL REFERENCES users(id),
  sender_role VARCHAR(20) NOT NULL,
  type message_type NOT NULL DEFAULT 'text',
  content TEXT,
  content_language language DEFAULT 'en',
  translations JSONB DEFAULT '{}'::jsonb,
  voice_url VARCHAR(500),
  voice_duration_seconds INTEGER,
  voice_transcript TEXT,
  voice_transcript_language language,
  attachments JSONB DEFAULT '[]'::jsonb,
  sent_at TIMESTAMP NOT NULL DEFAULT NOW(),
  delivered_at TIMESTAMP,
  read_at TIMESTAMP,
  is_edited BOOLEAN DEFAULT false,
  edited_at TIMESTAMP,
  is_deleted BOOLEAN DEFAULT false,
  deleted_at TIMESTAMP,
  has_red_flag BOOLEAN DEFAULT false,
  red_flag_type VARCHAR(50),
  reply_to_message_id UUID,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX messages_thread_sent_idx ON messages(thread_id, sent_at);
CREATE INDEX messages_sender_idx ON messages(sender_user_id);

-- Tasks
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignee_user_id UUID NOT NULL REFERENCES users(id),
  assignee_role VARCHAR(20) NOT NULL,
  created_by_user_id UUID REFERENCES users(id),
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category task_category NOT NULL,
  priority task_priority NOT NULL DEFAULT 'medium',
  status task_status NOT NULL DEFAULT 'pending',
  due_at TIMESTAMP,
  reminder_at TIMESTAMP,
  completed_at TIMESTAMP,
  completed_by_user_id UUID REFERENCES users(id),
  completion_notes TEXT,
  is_billable BOOLEAN DEFAULT false,
  billing_code_type billing_code_type,
  time_spent_seconds INTEGER DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX tasks_assignee_status_idx ON tasks(assignee_user_id, status);
CREATE INDEX tasks_patient_idx ON tasks(patient_id);
CREATE INDEX tasks_due_at_idx ON tasks(due_at);

-- Alerts
CREATE TABLE alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  severity alert_severity NOT NULL,
  status alert_status NOT NULL DEFAULT 'active',
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  trigger_data JSONB,
  assigned_to_user_id UUID REFERENCES users(id),
  acknowledged_at TIMESTAMP,
  resolved_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX alerts_patient_status_idx ON alerts(patient_id, status);
CREATE INDEX alerts_severity_idx ON alerts(severity);
CREATE INDEX alerts_created_at_idx ON alerts(created_at);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinicians ENABLE ROW LEVEL SECURITY;
ALTER TABLE vitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies (can be refined later)
-- Users can see their own data
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid() = supabase_auth_id);

-- Patients can see their own data
CREATE POLICY "Patients can view own data" ON patients
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = patients.user_id
      AND users.supabase_auth_id = auth.uid()
    )
  );

-- Clinicians can see their assigned patients
CREATE POLICY "Clinicians can view assigned patients" ON patients
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = patients.primary_clinician_id
      AND users.supabase_auth_id = auth.uid()
    )
  );

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_patients_updated_at BEFORE UPDATE ON patients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clinicians_updated_at BEFORE UPDATE ON clinicians
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_message_threads_updated_at BEFORE UPDATE ON message_threads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_alerts_updated_at BEFORE UPDATE ON alerts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

