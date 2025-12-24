-- Supabase Storage Buckets Setup for MyHealthAlly
-- Run this in Supabase SQL Editor after migrations
-- 
-- PREREQUISITE: Run migration 006_billing_and_payments.sql first
-- This script requires the patient_billing table to exist

-- ============================================
-- STORAGE BUCKETS
-- ============================================

-- Patient document uploads (insurance cards, medical records, etc.)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'patient-uploads',
  'patient-uploads',
  false, -- Private bucket (RLS enforced)
  10485760, -- 10MB limit
  ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/jpg']
)
ON CONFLICT (id) DO NOTHING;

-- Voice recordings (audio files from patients)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'voice-recordings',
  'voice-recordings',
  false, -- Private bucket (RLS enforced)
  52428800, -- 50MB limit for audio
  ARRAY['audio/webm', 'audio/mp4', 'audio/mpeg', 'audio/aac', 'audio/m4a', 'audio/wav']
)
ON CONFLICT (id) DO NOTHING;

-- Invoice PDFs (generated invoices)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'invoices',
  'invoices',
  false, -- Private bucket (RLS enforced)
  5242880, -- 5MB limit
  ARRAY['application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- STORAGE POLICIES (RLS)
-- ============================================

-- Patient Uploads: Patients can upload their own documents
CREATE POLICY "Patients can upload own documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'patient-uploads' AND
  (storage.foldername(name))[1] = 'documents' AND
  EXISTS (
    SELECT 1 FROM users
    JOIN patients ON patients.user_id = users.id
    WHERE users.supabase_auth_id = auth.uid()
    AND (storage.foldername(name))[2] = patients.id::text
  )
);

-- Patient Uploads: Patients can view their own documents
CREATE POLICY "Patients can view own documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'patient-uploads' AND
  EXISTS (
    SELECT 1 FROM users
    JOIN patients ON patients.user_id = users.id
    WHERE users.supabase_auth_id = auth.uid()
    AND (storage.foldername(name))[2] = patients.id::text
  )
);

-- Patient Uploads: Clinicians can view patient documents
CREATE POLICY "Clinicians can view patient documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'patient-uploads' AND
  EXISTS (
    SELECT 1 FROM users
    JOIN clinicians ON clinicians.user_id = users.id
    JOIN patients ON patients.primary_clinician_id = clinicians.id
    WHERE users.supabase_auth_id = auth.uid()
    AND (storage.foldername(name))[2] = patients.id::text
  )
);

-- Voice Recordings: Patients can upload their own recordings
CREATE POLICY "Patients can upload own voice recordings"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'voice-recordings' AND
  (storage.foldername(name))[1] = 'recordings' AND
  EXISTS (
    SELECT 1 FROM users
    JOIN patients ON patients.user_id = users.id
    WHERE users.supabase_auth_id = auth.uid()
    AND (storage.foldername(name))[2] = patients.id::text
  )
);

-- Voice Recordings: Patients can view their own recordings
CREATE POLICY "Patients can view own voice recordings"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'voice-recordings' AND
  EXISTS (
    SELECT 1 FROM users
    JOIN patients ON patients.user_id = users.id
    WHERE users.supabase_auth_id = auth.uid()
    AND (storage.foldername(name))[2] = patients.id::text
  )
);

-- Voice Recordings: Clinicians can view patient recordings
CREATE POLICY "Clinicians can view patient voice recordings"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'voice-recordings' AND
  EXISTS (
    SELECT 1 FROM users
    JOIN clinicians ON clinicians.user_id = users.id
    JOIN patients ON patients.primary_clinician_id = clinicians.id
    WHERE users.supabase_auth_id = auth.uid()
    AND (storage.foldername(name))[2] = patients.id::text
  )
);

-- Invoices: Patients can view their own invoices
CREATE POLICY "Patients can view own invoices"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'invoices' AND
  EXISTS (
    SELECT 1 FROM users
    JOIN patients ON patients.user_id = users.id
    JOIN patient_billing ON patient_billing.patient_id = patients.id
    WHERE users.supabase_auth_id = auth.uid()
    AND name LIKE '%' || patient_billing.id::text || '%'
  )
);

-- Invoices: Clinicians can view patient invoices
CREATE POLICY "Clinicians can view patient invoices"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'invoices' AND
  EXISTS (
    SELECT 1 FROM users
    JOIN clinicians ON clinicians.user_id = users.id
    JOIN patients ON patients.primary_clinician_id = clinicians.id
    JOIN patient_billing ON patient_billing.patient_id = patients.id
    WHERE users.supabase_auth_id = auth.uid()
    AND name LIKE '%' || patient_billing.id::text || '%'
  )
);

