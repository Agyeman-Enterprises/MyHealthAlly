-- Migration: 012_oauth_states.sql
-- Purpose: Create oauth_states table for OAuth flow security

CREATE TABLE IF NOT EXISTS oauth_states (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  state VARCHAR(255) NOT NULL UNIQUE,
  provider VARCHAR(50) NOT NULL,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_oauth_states_state ON oauth_states(state);
CREATE INDEX IF NOT EXISTS idx_oauth_states_expires_at ON oauth_states(expires_at);

-- Cleanup expired states (run periodically)
CREATE OR REPLACE FUNCTION cleanup_expired_oauth_states()
RETURNS void AS $$
BEGIN
  DELETE FROM oauth_states WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- RLS Policies
ALTER TABLE oauth_states ENABLE ROW LEVEL SECURITY;

-- Users can view their own states
CREATE POLICY "Users can view own oauth states"
  ON oauth_states FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM patients
      WHERE patients.id = oauth_states.patient_id
      AND patients.user_id IN (
        SELECT id FROM users WHERE supabase_auth_id = auth.uid()
      )
    )
  );

-- Users can create their own states
CREATE POLICY "Users can create own oauth states"
  ON oauth_states FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM patients
      WHERE patients.id = oauth_states.patient_id
      AND patients.user_id IN (
        SELECT id FROM users WHERE supabase_auth_id = auth.uid()
      )
    )
  );

-- Users can delete their own states
CREATE POLICY "Users can delete own oauth states"
  ON oauth_states FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM patients
      WHERE patients.id = oauth_states.patient_id
      AND patients.user_id IN (
        SELECT id FROM users WHERE supabase_auth_id = auth.uid()
      )
    )
  );
