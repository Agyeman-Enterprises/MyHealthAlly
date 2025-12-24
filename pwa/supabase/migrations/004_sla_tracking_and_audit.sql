-- Migration 004: SLA Tracking and Audit Logging
-- Adds SLA tracking to message_threads and creates audit_logs table

-- ============================================
-- SLA TRACKING FOR MESSAGE_THREADS
-- ============================================

-- Add SLA tracking fields to message_threads
ALTER TABLE message_threads
  ADD COLUMN IF NOT EXISTS sla_started_at TIMESTAMP,
  ADD COLUMN IF NOT EXISTS sla_deadline TIMESTAMP,
  ADD COLUMN IF NOT EXISTS sla_status VARCHAR(20) DEFAULT 'pending', -- pending, active, completed, overdue
  ADD COLUMN IF NOT EXISTS sla_initial_response_at TIMESTAMP,
  ADD COLUMN IF NOT EXISTS sla_completed_at TIMESTAMP;

-- Create index for SLA queries
CREATE INDEX IF NOT EXISTS message_threads_sla_status_idx ON message_threads(sla_status);
CREATE INDEX IF NOT EXISTS message_threads_sla_deadline_idx ON message_threads(sla_deadline);

-- ============================================
-- AUDIT LOGS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  patient_id UUID REFERENCES patients(id) ON DELETE SET NULL,
  action_type VARCHAR(50) NOT NULL, -- message_sent, message_received, refill_requested, vital_recorded, etc.
  resource_type VARCHAR(50) NOT NULL, -- message, medication, vital, task, etc.
  resource_id UUID,
  details JSONB DEFAULT '{}'::jsonb,
  ip_address VARCHAR(45),
  user_agent VARCHAR(500),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Indexes for audit logs
CREATE INDEX IF NOT EXISTS audit_logs_user_idx ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS audit_logs_patient_idx ON audit_logs(patient_id);
CREATE INDEX IF NOT EXISTS audit_logs_action_type_idx ON audit_logs(action_type);
CREATE INDEX IF NOT EXISTS audit_logs_created_at_idx ON audit_logs(created_at);
CREATE INDEX IF NOT EXISTS audit_logs_resource_idx ON audit_logs(resource_type, resource_id);

-- RLS for audit logs (admin and clinicians can view)
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY audit_logs_select_policy ON audit_logs
  FOR SELECT
  USING (
    -- Admins can see all
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')
    OR
    -- Clinicians can see their own practice's logs
    EXISTS (
      SELECT 1 FROM users u
      JOIN clinicians c ON c.user_id = u.id
      WHERE u.id = auth.uid() AND u.role IN ('clinician', 'care_coordinator')
    )
    OR
    -- Patients can see their own logs
    (patient_id IN (SELECT p.id FROM patients p JOIN users u ON p.user_id = u.id WHERE u.id = auth.uid()))
  );

-- ============================================
-- PATIENT INTERACTION LOGS
-- ============================================

CREATE TABLE IF NOT EXISTS patient_interaction_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  interaction_type VARCHAR(50) NOT NULL, -- message, refill_request, vital_recording, appointment_request, etc.
  practice_open BOOLEAN DEFAULT true,
  copy_shown TEXT, -- What was shown to the patient
  action_taken VARCHAR(50), -- sent, deferred, blocked, redirected, etc.
  reason TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Indexes for patient interaction logs
CREATE INDEX IF NOT EXISTS patient_interaction_logs_patient_idx ON patient_interaction_logs(patient_id);
CREATE INDEX IF NOT EXISTS patient_interaction_logs_type_idx ON patient_interaction_logs(interaction_type);
CREATE INDEX IF NOT EXISTS patient_interaction_logs_created_at_idx ON patient_interaction_logs(created_at);

-- RLS for patient interaction logs
ALTER TABLE patient_interaction_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY patient_interaction_logs_select_policy ON patient_interaction_logs
  FOR SELECT
  USING (
    -- Admins and clinicians can see all
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('admin', 'clinician', 'care_coordinator'))
    OR
    -- Patients can see their own logs
    (patient_id IN (SELECT p.id FROM patients p JOIN users u ON p.user_id = u.id WHERE u.id = auth.uid()))
  );

-- ============================================
-- FUNCTION: Calculate SLA deadline based on priority
-- ============================================

CREATE OR REPLACE FUNCTION calculate_sla_deadline(
  p_priority message_priority,
  p_created_at TIMESTAMP,
  p_practice_opens_at TIMESTAMP DEFAULT NULL
)
RETURNS TIMESTAMP AS $$
DECLARE
  v_sla_start TIMESTAMP;
  v_deadline TIMESTAMP;
BEGIN
  -- If practice is closed, SLA starts when practice opens
  IF p_practice_opens_at IS NOT NULL AND p_practice_opens_at > p_created_at THEN
    v_sla_start := p_practice_opens_at;
  ELSE
    v_sla_start := p_created_at;
  END IF;

  -- Calculate deadline based on priority
  CASE p_priority
    WHEN 'emergency' THEN
      v_deadline := v_sla_start + INTERVAL '15 minutes'; -- 15 min initial response
    WHEN 'urgent' THEN
      v_deadline := v_sla_start + INTERVAL '15 minutes'; -- 15 min initial response
    WHEN 'normal' THEN
      v_deadline := v_sla_start + INTERVAL '24 hours'; -- 24 hours to respond and close
    ELSE
      v_deadline := v_sla_start + INTERVAL '72 hours'; -- 72 hours default
  END CASE;

  RETURN v_deadline;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- TRIGGER: Auto-calculate SLA on message thread creation
-- ============================================

CREATE OR REPLACE FUNCTION update_message_thread_sla()
RETURNS TRIGGER AS $$
DECLARE
  v_practice_opens_at TIMESTAMP;
  v_deadline TIMESTAMP;
BEGIN
  -- If SLA not already set, calculate it
  IF NEW.sla_deadline IS NULL AND NEW.priority IS NOT NULL THEN
    -- For now, assume practice opens at 8 AM (can be enhanced with practice hours)
    v_practice_opens_at := DATE_TRUNC('day', NEW.created_at) + INTERVAL '8 hours';
    IF v_practice_opens_at < NEW.created_at THEN
      v_practice_opens_at := v_practice_opens_at + INTERVAL '1 day';
    END IF;

    v_deadline := calculate_sla_deadline(NEW.priority, NEW.created_at, v_practice_opens_at);
    
    NEW.sla_started_at := COALESCE(v_practice_opens_at, NEW.created_at);
    NEW.sla_deadline := v_deadline;
    NEW.sla_status := CASE 
      WHEN v_practice_opens_at > NEW.created_at THEN 'pending'
      ELSE 'active'
    END;
  END IF;

  -- Update SLA status based on deadline
  IF NEW.sla_deadline IS NOT NULL THEN
    IF NEW.sla_completed_at IS NOT NULL THEN
      NEW.sla_status := 'completed';
    ELSIF NEW.sla_deadline < NOW() THEN
      NEW.sla_status := 'overdue';
    ELSIF NEW.sla_started_at IS NOT NULL AND NEW.sla_started_at <= NOW() THEN
      NEW.sla_status := 'active';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER message_thread_sla_trigger
  BEFORE INSERT OR UPDATE ON message_threads
  FOR EACH ROW
  EXECUTE FUNCTION update_message_thread_sla();

