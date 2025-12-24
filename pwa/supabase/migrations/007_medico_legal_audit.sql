-- Medico-Legal Audit and Attestation Schema
-- Hash-chained audit events for legal defensibility
-- Run this AFTER 006_billing_and_payments.sql

-- ============================================
-- CAPTURE SESSIONS
-- ============================================

CREATE TABLE capture_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  encounter_id UUID REFERENCES encounters(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  clinician_id UUID NOT NULL REFERENCES clinicians(id),
  
  -- State machine state
  state VARCHAR(20) NOT NULL DEFAULT 'IDLE',
  -- IDLE, INITIALIZING, STREAM_ACTIVE, RECORDING, PAUSED, STOPPING, PROCESSING, COMPLETE, FAILED, ABORTED
  
  -- Audio capture
  audio_blob_url VARCHAR(500),
  audio_duration_seconds INTEGER,
  audio_format VARCHAR(50), -- webm, mp4, m4a, etc.
  audio_size_bytes BIGINT,
  
  -- Diagnostics
  diagnostics JSONB DEFAULT '{}'::jsonb,
  -- { streamActive, recordingActive, audioLevel, error, permissions, lastError }
  
  -- Timestamps
  started_at TIMESTAMP,
  stopped_at TIMESTAMP,
  completed_at TIMESTAMP,
  failed_at TIMESTAMP,
  error_message TEXT,
  error_code VARCHAR(50),
  
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX capture_sessions_encounter_idx ON capture_sessions(encounter_id);
CREATE INDEX capture_sessions_patient_idx ON capture_sessions(patient_id);
CREATE INDEX capture_sessions_state_idx ON capture_sessions(state);

-- ============================================
-- TRANSCRIPTS
-- ============================================

CREATE TABLE transcripts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  capture_session_id UUID NOT NULL REFERENCES capture_sessions(id) ON DELETE CASCADE,
  encounter_id UUID REFERENCES encounters(id) ON DELETE CASCADE,
  
  -- Transcription data
  raw_text TEXT NOT NULL,
  detected_language VARCHAR(10),
  confidence_score DECIMAL(5,2),
  transcription_service VARCHAR(50), -- whisper, google, azure, etc.
  
  -- Processing
  processed_text TEXT,
  segments JSONB DEFAULT '[]'::jsonb, -- Time-stamped segments
  
  -- Status
  status VARCHAR(20) NOT NULL DEFAULT 'pending', -- pending, processing, completed, failed
  error_message TEXT,
  
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMP
);

CREATE INDEX transcripts_capture_session_idx ON transcripts(capture_session_id);
CREATE INDEX transcripts_encounter_idx ON transcripts(encounter_id);

-- ============================================
-- NOTES
-- ============================================

CREATE TABLE notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  encounter_id UUID NOT NULL REFERENCES encounters(id) ON DELETE CASCADE,
  capture_session_id UUID REFERENCES capture_sessions(id),
  transcript_id UUID REFERENCES transcripts(id),
  
  -- State machine state
  state VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
  -- DRAFT, AUTO_SAVED, SUBMITTED, UNDER_REVIEW, SIGNED, AMENDED, FINALIZED, LOCKED
  
  -- Note content
  note_type VARCHAR(50) NOT NULL DEFAULT 'SOAP', -- SOAP, progress, procedure, etc.
  subjective TEXT,
  objective TEXT,
  assessment TEXT,
  plan TEXT,
  
  -- Metadata
  version INTEGER NOT NULL DEFAULT 1,
  parent_note_id UUID REFERENCES notes(id), -- For amendments
  
  -- Gating: Cannot create note without audio
  has_audio BOOLEAN NOT NULL DEFAULT false,
  audio_validated BOOLEAN NOT NULL DEFAULT false,
  
  -- Timestamps
  drafted_at TIMESTAMP,
  submitted_at TIMESTAMP,
  signed_at TIMESTAMP,
  finalized_at TIMESTAMP,
  
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX notes_encounter_idx ON notes(encounter_id);
CREATE INDEX notes_state_idx ON notes(state);
CREATE INDEX notes_parent_idx ON notes(parent_note_id);

-- ============================================
-- NOTE EDITS (Append-only history)
-- ============================================

CREATE TABLE note_edits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  note_id UUID NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
  edited_by_user_id UUID NOT NULL REFERENCES users(id),
  
  -- Edit data
  edit_type VARCHAR(20) NOT NULL, -- create, update, amend
  field_name VARCHAR(50), -- subjective, objective, assessment, plan
  old_value TEXT,
  new_value TEXT,
  
  -- Diff
  diff JSONB,
  
  -- Timestamp
  edited_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX note_edits_note_idx ON note_edits(note_id);
CREATE INDEX note_edits_user_idx ON note_edits(edited_by_user_id);

-- ============================================
-- ATTESTATIONS (Digital Signatures)
-- ============================================

CREATE TABLE attestations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  note_id UUID NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
  clinician_id UUID NOT NULL REFERENCES clinicians(id),
  
  -- Attestation content
  attestation_text TEXT NOT NULL,
  -- "I attest that I have reviewed and agree with the above note..."
  
  -- Signature
  signature_hash VARCHAR(64) NOT NULL, -- SHA-256 of canonical JSON
  signature_data JSONB NOT NULL,
  -- { clinicianId, noteId, timestamp, attestationText, previousAttestationHash }
  
  -- Hash chain
  previous_attestation_hash VARCHAR(64), -- Links to previous attestation
  
  -- Metadata
  ip_address VARCHAR(45),
  user_agent TEXT,
  device_info JSONB,
  
  -- Timestamp
  signed_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX attestations_note_idx ON attestations(note_id);
CREATE INDEX attestations_clinician_idx ON attestations(clinician_id);
CREATE INDEX attestations_hash_idx ON attestations(signature_hash);
CREATE INDEX attestations_prev_hash_idx ON attestations(previous_attestation_hash);

-- ============================================
-- EXPORT JOBS
-- ============================================

CREATE TABLE export_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  encounter_id UUID REFERENCES encounters(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  
  -- State machine state
  state VARCHAR(20) NOT NULL DEFAULT 'PENDING',
  -- PENDING, QUEUED, PROCESSING, COMPLETED, FAILED, CANCELLED, RETRYING
  
  -- Export configuration
  export_type VARCHAR(50) NOT NULL, -- encounter, patient, audit_trail
  format VARCHAR(20) NOT NULL, -- json, csv, pdf
  include_attachments BOOLEAN DEFAULT false,
  
  -- Progress
  progress_percent INTEGER DEFAULT 0,
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  
  -- Results
  output_url VARCHAR(500),
  output_size_bytes BIGINT,
  error_message TEXT,
  
  -- Timestamps
  queued_at TIMESTAMP,
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  failed_at TIMESTAMP,
  
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX export_jobs_encounter_idx ON export_jobs(encounter_id);
CREATE INDEX export_jobs_state_idx ON export_jobs(state);

-- ============================================
-- AUDIT EVENTS (Hash-Chained)
-- ============================================

CREATE TABLE audit_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Event identification
  event_type VARCHAR(50) NOT NULL,
  -- encounter_state_change, note_created, note_signed, attestation_created, export_started, etc.
  
  -- Entity references
  entity_type VARCHAR(50), -- encounter, note, capture_session, attestation, etc.
  entity_id UUID,
  
  -- Actor
  user_id UUID REFERENCES users(id),
  clinician_id UUID REFERENCES clinicians(id),
  patient_id UUID REFERENCES patients(id),
  
  -- Event data
  event_data JSONB NOT NULL,
  -- Canonical JSON representation of the event
  
  -- Hash chain
  event_hash VARCHAR(64) NOT NULL UNIQUE, -- SHA-256 of canonical JSON
  previous_event_hash VARCHAR(64) REFERENCES audit_events(event_hash),
  -- Links to previous event in chain
  
  -- Metadata
  ip_address VARCHAR(45),
  user_agent TEXT,
  session_id VARCHAR(255),
  
  -- Timestamp
  occurred_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX audit_events_type_idx ON audit_events(event_type);
CREATE INDEX audit_events_entity_idx ON audit_events(entity_type, entity_id);
CREATE INDEX audit_events_user_idx ON audit_events(user_id);
CREATE INDEX audit_events_hash_idx ON audit_events(event_hash);
CREATE INDEX audit_events_prev_hash_idx ON audit_events(previous_event_hash);
CREATE INDEX audit_events_occurred_idx ON audit_events(occurred_at);

-- ============================================
-- RLS POLICIES
-- ============================================

ALTER TABLE capture_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE transcripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE note_edits ENABLE ROW LEVEL SECURITY;
ALTER TABLE attestations ENABLE ROW LEVEL SECURITY;
ALTER TABLE export_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_events ENABLE ROW LEVEL SECURITY;

-- Capture Sessions: Clinicians can view their own sessions
CREATE POLICY "Clinicians can view own capture sessions" ON capture_sessions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users
      JOIN clinicians ON clinicians.user_id = users.id
      WHERE users.supabase_auth_id = auth.uid()
      AND clinicians.id = capture_sessions.clinician_id
    )
  );

-- Notes: Clinicians can view notes for their encounters
CREATE POLICY "Clinicians can view encounter notes" ON notes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users
      JOIN clinicians ON clinicians.user_id = users.id
      JOIN encounters ON encounters.clinician_id = clinicians.id
      WHERE users.supabase_auth_id = auth.uid()
      AND encounters.id = notes.encounter_id
    )
  );

-- Attestations: Clinicians can view their own attestations
CREATE POLICY "Clinicians can view own attestations" ON attestations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users
      JOIN clinicians ON clinicians.user_id = users.id
      WHERE users.supabase_auth_id = auth.uid()
      AND clinicians.id = attestations.clinician_id
    )
  );

-- Audit Events: Read-only for authenticated users (append-only via functions)
CREATE POLICY "Authenticated users can view audit events" ON audit_events
  FOR SELECT USING (auth.role() = 'authenticated');

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to create hash-chained audit event
CREATE OR REPLACE FUNCTION create_audit_event(
  p_event_type VARCHAR(50),
  p_entity_type VARCHAR(50),
  p_entity_id UUID,
  p_event_data JSONB,
  p_user_id UUID DEFAULT NULL,
  p_clinician_id UUID DEFAULT NULL,
  p_patient_id UUID DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  v_event_id UUID;
  v_event_hash VARCHAR(64);
  v_previous_hash VARCHAR(64);
  v_canonical_json TEXT;
BEGIN
  -- Get previous event hash (most recent)
  SELECT event_hash INTO v_previous_hash
  FROM audit_events
  ORDER BY occurred_at DESC
  LIMIT 1;
  
  -- Create canonical JSON (stable key ordering)
  v_canonical_json := jsonb_pretty(
    jsonb_build_object(
      'event_type', p_event_type,
      'entity_type', p_entity_type,
      'entity_id', p_entity_id,
      'event_data', p_event_data,
      'user_id', p_user_id,
      'clinician_id', p_clinician_id,
      'patient_id', p_patient_id,
      'previous_hash', v_previous_hash,
      'timestamp', NOW()
    )
  );
  
  -- Calculate SHA-256 hash
  v_event_hash := encode(digest(v_canonical_json, 'sha256'), 'hex');
  
  -- Insert audit event
  INSERT INTO audit_events (
    event_type,
    entity_type,
    entity_id,
    event_data,
    user_id,
    clinician_id,
    patient_id,
    event_hash,
    previous_event_hash,
    ip_address,
    user_agent
  ) VALUES (
    p_event_type,
    p_entity_type,
    p_entity_id,
    p_event_data,
    p_user_id,
    p_clinician_id,
    p_patient_id,
    v_event_hash,
    v_previous_hash,
    current_setting('request.headers', true)::json->>'x-forwarded-for',
    current_setting('request.headers', true)::json->>'user-agent'
  )
  RETURNING id INTO v_event_id;
  
  RETURN v_event_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create attestation with hash
CREATE OR REPLACE FUNCTION create_attestation(
  p_note_id UUID,
  p_clinician_id UUID,
  p_attestation_text TEXT,
  p_signature_data JSONB
) RETURNS UUID AS $$
DECLARE
  v_attestation_id UUID;
  v_signature_hash VARCHAR(64);
  v_previous_hash VARCHAR(64);
  v_canonical_json TEXT;
BEGIN
  -- Get previous attestation hash for this note
  SELECT signature_hash INTO v_previous_hash
  FROM attestations
  WHERE note_id = p_note_id
  ORDER BY signed_at DESC
  LIMIT 1;
  
  -- Create canonical JSON
  v_canonical_json := jsonb_pretty(
    jsonb_build_object(
      'note_id', p_note_id,
      'clinician_id', p_clinician_id,
      'attestation_text', p_attestation_text,
      'signature_data', p_signature_data,
      'previous_hash', v_previous_hash,
      'timestamp', NOW()
    )
  );
  
  -- Calculate SHA-256 hash
  v_signature_hash := encode(digest(v_canonical_json, 'sha256'), 'hex');
  
  -- Insert attestation
  INSERT INTO attestations (
    note_id,
    clinician_id,
    attestation_text,
    signature_hash,
    signature_data,
    previous_attestation_hash
  ) VALUES (
    p_note_id,
    p_clinician_id,
    p_attestation_text,
    v_signature_hash,
    p_signature_data,
    v_previous_hash
  )
  RETURNING id INTO v_attestation_id;
  
  -- Create audit event for attestation
  PERFORM create_audit_event(
    'attestation_created',
    'attestation',
    v_attestation_id,
    jsonb_build_object(
      'note_id', p_note_id,
      'signature_hash', v_signature_hash
    ),
    NULL,
    p_clinician_id,
    NULL
  );
  
  RETURN v_attestation_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- TRIGGERS
-- ============================================

CREATE TRIGGER update_capture_sessions_updated_at BEFORE UPDATE ON capture_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notes_updated_at BEFORE UPDATE ON notes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_export_jobs_updated_at BEFORE UPDATE ON export_jobs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger: Audit note state changes
CREATE OR REPLACE FUNCTION audit_note_state_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.state != NEW.state THEN
    PERFORM create_audit_event(
      'note_state_change',
      'note',
      NEW.id,
      jsonb_build_object(
        'old_state', OLD.state,
        'new_state', NEW.state,
        'note_id', NEW.id,
        'encounter_id', NEW.encounter_id
      ),
      (SELECT user_id FROM clinicians WHERE id = (SELECT clinician_id FROM encounters WHERE id = NEW.encounter_id)),
      (SELECT clinician_id FROM encounters WHERE id = NEW.encounter_id),
      (SELECT patient_id FROM encounters WHERE id = NEW.encounter_id)
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER note_state_change_audit
  AFTER UPDATE OF state ON notes
  FOR EACH ROW
  WHEN (OLD.state IS DISTINCT FROM NEW.state)
  EXECUTE FUNCTION audit_note_state_change();

