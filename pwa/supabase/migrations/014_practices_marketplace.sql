-- Migration: 014_practices_marketplace.sql
-- Purpose: Create practices table for marketplace where practices can register and patients can select them

-- First, update patients.practice_id to be VARCHAR to match practices.practice_id (string)
-- This allows both registered practices and custom practice IDs
-- Safe migration: only alter if column exists and is UUID type
DO $$
BEGIN
  -- Check if practice_id column exists and is UUID type
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'patients' 
    AND column_name = 'practice_id'
    AND data_type = 'uuid'
  ) THEN
    -- Convert UUID to text first, then to VARCHAR
    -- Handle existing UUID values by converting them to text
    ALTER TABLE patients
      ALTER COLUMN practice_id TYPE VARCHAR(255) USING practice_id::text;
    
    RAISE NOTICE 'Converted patients.practice_id from UUID to VARCHAR(255)';
  ELSIF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'patients' 
    AND column_name = 'practice_id'
    AND data_type = 'character varying'
  ) THEN
    -- Already VARCHAR, just ensure it's the right length
    ALTER TABLE patients
      ALTER COLUMN practice_id TYPE VARCHAR(255);
    
    RAISE NOTICE 'Updated patients.practice_id to VARCHAR(255)';
  ELSE
    -- Column doesn't exist, create it
    ALTER TABLE patients
      ADD COLUMN practice_id VARCHAR(255) NULL;
    
    RAISE NOTICE 'Created patients.practice_id as VARCHAR(255)';
  END IF;
END $$;

-- Practices table - stores registered practices that can be selected by patients
CREATE TABLE IF NOT EXISTS practices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Practice identification
  practice_id VARCHAR(255) UNIQUE NOT NULL, -- External practice ID (e.g., from SoloPractice)
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE, -- URL-friendly identifier
  
  -- Practice information
  description TEXT,
  specialty VARCHAR(255), -- e.g., "Primary Care", "Functional Medicine", "Pharmacy"
  website_url VARCHAR(500),
  phone VARCHAR(20),
  email VARCHAR(255),
  address JSONB, -- { street1, street2, city, state, zipCode, country }
  
  -- Practice details
  logo_url VARCHAR(500),
  cover_image_url VARCHAR(500),
  languages_supported JSONB DEFAULT '["en"]'::jsonb,
  services_offered JSONB DEFAULT '[]'::jsonb, -- e.g., ["telehealth", "in-person", "medication management"]
  
  -- Status and visibility
  status VARCHAR(50) DEFAULT 'pending', -- pending, approved, active, inactive, suspended
  is_featured BOOLEAN DEFAULT false, -- Featured practices shown first
  is_public BOOLEAN DEFAULT true, -- Public practices visible to all patients
  is_predefined BOOLEAN DEFAULT false, -- Predefined practices (Ohimaa, MedRx, BookADoc2U)
  
  -- Registration information
  registered_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL, -- User who registered this practice
  registered_at TIMESTAMPTZ DEFAULT NOW(),
  approved_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL, -- Admin who approved
  approved_at TIMESTAMPTZ,
  
  -- Metadata
  patient_count INTEGER DEFAULT 0, -- Number of patients attached (updated via trigger)
  metadata JSONB DEFAULT '{}'::jsonb, -- Additional practice-specific data
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_practices_status ON practices(status);
CREATE INDEX IF NOT EXISTS idx_practices_is_public ON practices(is_public) WHERE is_public = true;
CREATE INDEX IF NOT EXISTS idx_practices_is_featured ON practices(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_practices_slug ON practices(slug);
CREATE INDEX IF NOT EXISTS idx_practices_practice_id ON practices(practice_id);

-- Function to update practice patient count
CREATE OR REPLACE FUNCTION update_practice_patient_count()
RETURNS TRIGGER AS $$
BEGIN
  -- Update patient count when patient attachment changes
  IF TG_OP = 'INSERT' AND NEW.practice_id IS NOT NULL THEN
    UPDATE practices
    SET patient_count = (
      SELECT COUNT(*) FROM patients WHERE practice_id = NEW.practice_id AND attachment_status = 'ATTACHED'
    )
    WHERE id = NEW.practice_id;
  ELSIF TG_OP = 'UPDATE' THEN
    -- If practice_id changed
    IF OLD.practice_id IS DISTINCT FROM NEW.practice_id THEN
      -- Update old practice count
      IF OLD.practice_id IS NOT NULL THEN
        UPDATE practices
        SET patient_count = (
          SELECT COUNT(*) FROM patients WHERE practice_id = OLD.practice_id AND attachment_status = 'ATTACHED'
        )
        WHERE id = OLD.practice_id;
      END IF;
      -- Update new practice count
      IF NEW.practice_id IS NOT NULL THEN
        UPDATE practices
        SET patient_count = (
          SELECT COUNT(*) FROM patients WHERE practice_id = NEW.practice_id AND attachment_status = 'ATTACHED'
        )
        WHERE id = NEW.practice_id;
      END IF;
    ELSIF OLD.attachment_status IS DISTINCT FROM NEW.attachment_status THEN
      -- Attachment status changed, update count
      IF NEW.practice_id IS NOT NULL THEN
        UPDATE practices
        SET patient_count = (
          SELECT COUNT(*) FROM patients WHERE practice_id = NEW.practice_id AND attachment_status = 'ATTACHED'
        )
        WHERE id = NEW.practice_id;
      END IF;
    END IF;
  ELSIF TG_OP = 'DELETE' AND OLD.practice_id IS NOT NULL THEN
    UPDATE practices
    SET patient_count = (
      SELECT COUNT(*) FROM patients WHERE practice_id = OLD.practice_id AND attachment_status = 'ATTACHED'
    )
    WHERE id = OLD.practice_id;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger to update patient count
DROP TRIGGER IF EXISTS trigger_update_practice_patient_count ON patients;
CREATE TRIGGER trigger_update_practice_patient_count
  AFTER INSERT OR UPDATE OR DELETE ON patients
  FOR EACH ROW
  EXECUTE FUNCTION update_practice_patient_count();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_practices_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at
DROP TRIGGER IF EXISTS trigger_update_practices_updated_at ON practices;
CREATE TRIGGER trigger_update_practices_updated_at
  BEFORE UPDATE ON practices
  FOR EACH ROW
  EXECUTE FUNCTION update_practices_updated_at();

-- Enable RLS
ALTER TABLE practices ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Anyone can view public, approved practices
CREATE POLICY "Anyone can view public approved practices"
  ON practices FOR SELECT
  USING (is_public = true AND status = 'approved');

-- Admins can view all practices
CREATE POLICY "Admins can view all practices"
  ON practices FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Practice registrants can view their own practice
CREATE POLICY "Practice registrants can view own practice"
  ON practices FOR SELECT
  USING (
    registered_by_user_id IN (
      SELECT id FROM users WHERE supabase_auth_id = auth.uid()
    )
  );

-- Admins can insert/update/delete practices
CREATE POLICY "Admins can manage practices"
  ON practices FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Users can register new practices (insert only, status = 'pending')
CREATE POLICY "Users can register practices"
  ON practices FOR INSERT
  WITH CHECK (
    status = 'pending'
    AND registered_by_user_id IN (
      SELECT id FROM users WHERE supabase_auth_id = auth.uid()
    )
  );

-- Insert predefined practices (Ohimaa, MedRx, BookADoc2U)
INSERT INTO practices (practice_id, name, slug, description, specialty, is_predefined, is_featured, status, is_public)
VALUES
  ('ohimaa-practice-id', 'Ohimaa GU Functional Medicine', 'ohimaa', 'Primary care and functional medicine', 'Primary Care / Functional Medicine', true, true, 'approved', true),
  ('medrx-practice-id', 'MedRx', 'medrx', 'Pharmacy and medication management', 'Pharmacy', true, true, 'approved', true),
  ('bookadoc2u-practice-id', 'BookADoc2U', 'bookadoc2u', 'Healthcare services and appointments', 'Healthcare Services', true, true, 'approved', true)
ON CONFLICT (practice_id) DO NOTHING;
