-- Consent Signatures Table
-- Tracks patient consent form signatures with digital signatures

-- ============================================
-- CONSENT TYPES ENUM
-- ============================================

CREATE TYPE consent_type AS ENUM (
  'hipaa',
  'telehealth',
  'financial',
  'treatment',
  'research',
  'marketing'
);

-- ============================================
-- CONSENT SIGNATURES TABLE
-- ============================================

CREATE TABLE consent_signatures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  
  -- Consent information
  consent_type consent_type NOT NULL,
  consent_version VARCHAR(50), -- Version of the consent document
  
  -- Signature
  signature_url VARCHAR(500) NOT NULL, -- URL to signature image in storage
  signature_hash VARCHAR(64), -- SHA-256 hash of signature for integrity
  
  -- Metadata
  ip_address VARCHAR(45),
  user_agent TEXT,
  device_info JSONB,
  
  -- Status
  is_active BOOLEAN DEFAULT true, -- Can be revoked
  revoked_at TIMESTAMP,
  revoked_reason TEXT,
  
  -- Timestamps
  signed_at TIMESTAMP NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX consent_signatures_patient_idx ON consent_signatures(patient_id);
CREATE INDEX consent_signatures_type_idx ON consent_signatures(consent_type);
CREATE INDEX consent_signatures_active_idx ON consent_signatures(patient_id, consent_type, is_active);
CREATE INDEX consent_signatures_signed_at_idx ON consent_signatures(signed_at);

-- Unique constraint: One active signature per consent type per patient
CREATE UNIQUE INDEX consent_signatures_unique_active 
  ON consent_signatures(patient_id, consent_type) 
  WHERE is_active = true;

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE consent_signatures ENABLE ROW LEVEL SECURITY;

-- Patients can view their own consent signatures
CREATE POLICY "Patients can view own consent signatures" ON consent_signatures
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = (SELECT user_id FROM patients WHERE patients.id = consent_signatures.patient_id)
      AND users.supabase_auth_id = auth.uid()::text
    )
  );

-- Patients can insert their own consent signatures
CREATE POLICY "Patients can insert own consent signatures" ON consent_signatures
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = (SELECT user_id FROM patients WHERE patients.id = consent_signatures.patient_id)
      AND users.supabase_auth_id = auth.uid()::text
    )
  );

-- Clinicians can view patient consent signatures
CREATE POLICY "Clinicians can view patient consent signatures" ON consent_signatures
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM clinicians
      JOIN users ON users.id = clinicians.user_id
      WHERE users.supabase_auth_id = auth.uid()::text
    )
  );

-- ============================================
-- STORAGE BUCKET FOR SIGNATURES
-- ============================================

-- Note: Storage bucket creation should be done via Supabase Dashboard or API
-- This is a reference for what bucket should exist:
-- Bucket name: 'consent-signatures'
-- Public: false (private bucket)
-- Allowed MIME types: image/png, image/jpeg
-- Max file size: 1MB

-- ============================================
-- TRIGGERS
-- ============================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_consent_signatures_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_consent_signatures_updated_at
  BEFORE UPDATE ON consent_signatures
  FOR EACH ROW
  EXECUTE FUNCTION update_consent_signatures_updated_at();

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Check if patient has signed a specific consent type
CREATE OR REPLACE FUNCTION has_consent_signed(
  p_patient_id UUID,
  p_consent_type consent_type
)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM consent_signatures
    WHERE patient_id = p_patient_id
      AND consent_type = p_consent_type
      AND is_active = true
  );
END;
$$ LANGUAGE plpgsql;

-- Get all required consents for a patient
CREATE OR REPLACE FUNCTION get_required_consents_status(
  p_patient_id UUID
)
RETURNS TABLE (
  consent_type consent_type,
  is_signed BOOLEAN,
  signed_at TIMESTAMP,
  signature_url VARCHAR(500)
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cs.consent_type,
    COALESCE(cs.is_active, false) as is_signed,
    cs.signed_at,
    cs.signature_url
  FROM (
    SELECT unnest(ARRAY['hipaa', 'telehealth', 'financial', 'treatment']::consent_type[]) as consent_type
  ) required
  LEFT JOIN consent_signatures cs ON 
    cs.patient_id = p_patient_id 
    AND cs.consent_type = required.consent_type
    AND cs.is_active = true
  ORDER BY required.consent_type;
END;
$$ LANGUAGE plpgsql;
