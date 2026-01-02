-- Add tables for lab results, radiology results, and referral responses
-- Run this AFTER 003_missing_tables.sql

-- ============================================
-- LAB RESULTS
-- ============================================

CREATE TABLE IF NOT EXISTS lab_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  solopractice_lab_id VARCHAR(255),
  order_id VARCHAR(255),
  test_name VARCHAR(255) NOT NULL,
  test_type VARCHAR(100),
  ordered_date DATE,
  result_date DATE,
  collection_date DATE,
  status VARCHAR(50) DEFAULT 'completed',
  results JSONB, -- Store test results as JSON
  attachment_url VARCHAR(500),
  reviewed_by VARCHAR(255),
  reviewed_at TIMESTAMP,
  doctor_note TEXT,
  doctor_note_language VARCHAR(5) DEFAULT 'en',
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS lab_results_patient_idx ON lab_results(patient_id);
CREATE INDEX IF NOT EXISTS lab_results_solopractice_idx ON lab_results(solopractice_lab_id);
CREATE INDEX IF NOT EXISTS lab_results_date_idx ON lab_results(result_date);

-- ============================================
-- RADIOLOGY RESULTS
-- ============================================

CREATE TABLE IF NOT EXISTS radiology_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  solopractice_radiology_id VARCHAR(255),
  order_id VARCHAR(255),
  study_type VARCHAR(100), -- CT, MRI, X-Ray, Ultrasound, etc.
  study_name VARCHAR(255),
  body_part VARCHAR(255),
  ordered_date DATE,
  performed_date DATE,
  result_date DATE,
  status VARCHAR(50) DEFAULT 'completed',
  findings TEXT,
  findings_language VARCHAR(5) DEFAULT 'en',
  impression TEXT,
  impression_language VARCHAR(5) DEFAULT 'en',
  recommendation TEXT,
  recommendation_language VARCHAR(5) DEFAULT 'en',
  attachment_url VARCHAR(500),
  reviewed_by VARCHAR(255),
  reviewed_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS radiology_results_patient_idx ON radiology_results(patient_id);
CREATE INDEX IF NOT EXISTS radiology_results_solopractice_idx ON radiology_results(solopractice_radiology_id);
CREATE INDEX IF NOT EXISTS radiology_results_date_idx ON radiology_results(result_date);

-- ============================================
-- REFERRAL RESPONSES
-- ============================================

CREATE TABLE IF NOT EXISTS referral_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  solopractice_referral_id VARCHAR(255),
  referral_request_id VARCHAR(255),
  specialty VARCHAR(255),
  specialist_name VARCHAR(255),
  specialist_clinic VARCHAR(255),
  specialist_phone VARCHAR(20),
  specialist_address TEXT,
  status VARCHAR(50) DEFAULT 'approved',
  appointment_date DATE,
  appointment_time TIME,
  appointment_location VARCHAR(255),
  notes TEXT,
  notes_language VARCHAR(5) DEFAULT 'en',
  response_date DATE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS referral_responses_patient_idx ON referral_responses(patient_id);
CREATE INDEX IF NOT EXISTS referral_responses_solopractice_idx ON referral_responses(solopractice_referral_id);
CREATE INDEX IF NOT EXISTS referral_responses_date_idx ON referral_responses(response_date);

