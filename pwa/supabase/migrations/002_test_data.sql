-- Test Data for MHA
-- Run this AFTER 001_initial_schema.sql
-- This creates test users, patients, clinicians, and sample data

-- ============================================
-- TEST USERS
-- ============================================

-- Test Clinician User
INSERT INTO users (id, email, phone, role, status, preferred_language, communication_language, brand, created_at, updated_at)
VALUES 
  (
    '00000000-0000-0000-0000-000000000001',
    'doctor@test.com',
    '+1-555-0100',
    'clinician',
    'active',
    'en',
    'en',
    'myhealthally',
    NOW(),
    NOW()
  ),
  -- Test Patient User
  (
    '00000000-0000-0000-0000-000000000002',
    'patient@test.com',
    '+1-555-0101',
    'patient',
    'active',
    'en',
    'en',
    'myhealthally',
    NOW(),
    NOW()
  ),
  -- Test Patient 2
  (
    '00000000-0000-0000-0000-000000000003',
    'patient2@test.com',
    '+1-555-0102',
    'patient',
    'active',
    'es',
    'es',
    'myhealthally',
    NOW(),
    NOW()
  );

-- ============================================
-- TEST CLINICIAN
-- ============================================

INSERT INTO clinicians (id, user_id, first_name, last_name, title, credentials, npi_number, specialties, is_active, created_at, updated_at)
VALUES 
  (
    '00000000-0000-0000-0000-000000000010',
    '00000000-0000-0000-0000-000000000001',
    'Dr. Sarah',
    'Johnson',
    'MD',
    'MD, Internal Medicine',
    '1234567890',
    '["internal_medicine", "diabetes", "hypertension"]'::jsonb,
    true,
    NOW(),
    NOW()
  );

-- ============================================
-- TEST PATIENTS
-- ============================================

INSERT INTO patients (
  id, user_id, first_name, last_name, preferred_name, date_of_birth, gender,
  medical_record_number, primary_clinician_id, chronic_conditions,
  glp1_eligible, rpm_enrolled, ccm_enrolled, created_at, updated_at
)
VALUES 
  (
    '00000000-0000-0000-0000-000000000020',
    '00000000-0000-0000-0000-000000000002',
    'John',
    'Smith',
    'Johnny',
    '1980-05-15',
    'male',
    'MRN-001',
    '00000000-0000-0000-0000-000000000010',
    '["diabetes", "hypertension"]'::jsonb,
    true,
    true,
    true,
    NOW(),
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000021',
    '00000000-0000-0000-0000-000000000003',
    'Maria',
    'Garcia',
    'Maria',
    '1975-08-22',
    'female',
    'MRN-002',
    '00000000-0000-0000-0000-000000000010',
    '["diabetes"]'::jsonb,
    false,
    true,
    false,
    NOW(),
    NOW()
  );

-- ============================================
-- TEST VITALS
-- ============================================

INSERT INTO vitals (id, patient_id, type, value, unit, source, measured_at, rpm_eligible, created_at)
VALUES 
  -- John's vitals
  (
    '00000000-0000-0000-0000-000000000030',
    '00000000-0000-0000-0000-000000000020',
    'weight',
    185.5,
    'lbs',
    'manual',
    NOW() - INTERVAL '1 day',
    true,
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000031',
    '00000000-0000-0000-0000-000000000020',
    'blood_pressure',
    130,
    'mmHg',
    'manual',
    NOW() - INTERVAL '2 hours',
    true,
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000032',
    '00000000-0000-0000-0000-000000000020',
    'glucose',
    145,
    'mg/dL',
    'manual',
    NOW() - INTERVAL '3 hours',
    true,
    NOW()
  ),
  -- Maria's vitals
  (
    '00000000-0000-0000-0000-000000000033',
    '00000000-0000-0000-0000-000000000021',
    'weight',
    165.0,
    'lbs',
    'manual',
    NOW() - INTERVAL '1 day',
    true,
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000034',
    '00000000-0000-0000-0000-000000000021',
    'blood_pressure',
    125,
    'mmHg',
    'manual',
    NOW() - INTERVAL '4 hours',
    true,
    NOW()
  );

-- ============================================
-- TEST MESSAGE THREADS
-- ============================================

INSERT INTO message_threads (
  id, patient_id, subject, status, priority, last_message_at, last_message_preview,
  patient_unread_count, clinician_unread_count, created_at, updated_at
)
VALUES 
  (
    '00000000-0000-0000-0000-000000000040',
    '00000000-0000-0000-0000-000000000020',
    'Question about medication',
    'open',
    'normal',
    NOW() - INTERVAL '1 hour',
    'I have a question about my medication dosage...',
    0,
    1,
    NOW(),
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000041',
    '00000000-0000-0000-0000-000000000021',
    'High blood sugar reading',
    'open',
    'urgent',
    NOW() - INTERVAL '30 minutes',
    'My glucose reading was 250 this morning...',
    0,
    1,
    NOW(),
    NOW()
  );

-- ============================================
-- TEST MESSAGES
-- ============================================

INSERT INTO messages (
  id, thread_id, sender_user_id, sender_role, type, content, content_language,
  sent_at, created_at
)
VALUES 
  (
    '00000000-0000-0000-0000-000000000050',
    '00000000-0000-0000-0000-000000000040',
    '00000000-0000-0000-0000-000000000002',
    'patient',
    'text',
    'I have a question about my medication dosage. Should I take it with food?',
    'en',
    NOW() - INTERVAL '1 hour',
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000051',
    '00000000-0000-0000-0000-000000000041',
    '00000000-0000-0000-0000-000000000003',
    'patient',
    'text',
    'My glucose reading was 250 this morning. Should I be concerned?',
    'es',
    NOW() - INTERVAL '30 minutes',
    NOW()
  );

-- ============================================
-- TEST TASKS
-- ============================================

INSERT INTO tasks (
  id, assignee_user_id, assignee_role, patient_id, title, description,
  category, priority, status, due_at, created_at, updated_at
)
VALUES 
  (
    '00000000-0000-0000-0000-000000000060',
    '00000000-0000-0000-0000-000000000001',
    'clinician',
    '00000000-0000-0000-0000-000000000020',
    'Review high glucose reading',
    'Patient reported glucose of 250 mg/dL. Review and provide guidance.',
    'vital_check',
    'high',
    'pending',
    NOW() + INTERVAL '2 hours',
    NOW(),
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000061',
    '00000000-0000-0000-0000-000000000001',
    'clinician',
    '00000000-0000-0000-0000-000000000021',
    'Follow up on medication question',
    'Patient asked about medication dosage with food.',
    'patient_outreach',
    'medium',
    'in_progress',
    NOW() + INTERVAL '1 day',
    NOW(),
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000062',
    '00000000-0000-0000-0000-000000000001',
    'clinician',
    '00000000-0000-0000-0000-000000000020',
    'Schedule follow-up appointment',
    'Patient needs follow-up for diabetes management.',
    'appointment',
    'medium',
    'pending',
    NOW() + INTERVAL '3 days',
    NOW(),
    NOW()
  );

-- ============================================
-- TEST ALERTS
-- ============================================

INSERT INTO alerts (
  id, patient_id, type, severity, status, title, message, created_at, updated_at
)
VALUES 
  (
    '00000000-0000-0000-0000-000000000070',
    '00000000-0000-0000-0000-000000000021',
    'high_glucose',
    'high',
    'active',
    'High Glucose Reading',
    'Patient reported glucose reading of 250 mg/dL. Requires immediate attention.',
    NOW(),
    NOW()
  );

-- ============================================
-- UPDATE MESSAGE THREAD COUNTS
-- ============================================

UPDATE message_threads 
SET clinician_unread_count = 1 
WHERE id IN (
  '00000000-0000-0000-0000-000000000040',
  '00000000-0000-0000-0000-000000000041'
);

