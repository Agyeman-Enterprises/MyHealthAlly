-- Migration: 011_connected_devices.sql
-- Purpose: Create connected_devices table for health device integrations

CREATE TABLE IF NOT EXISTS connected_devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  
  device_type VARCHAR(50) NOT NULL CHECK (device_type IN ('apple_health', 'fitbit', 'google_fit', 'garmin', 'withings', 'dexcom', 'omron', 'other')),
  device_name VARCHAR(100),
  device_model VARCHAR(100),
  
  is_connected BOOLEAN DEFAULT true,
  connected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  disconnected_at TIMESTAMPTZ,
  
  -- OAuth tokens
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMPTZ,
  
  -- Sync settings
  sync_enabled BOOLEAN DEFAULT true,
  last_sync_at TIMESTAMPTZ,
  last_sync_status VARCHAR(30) CHECK (last_sync_status IN ('success', 'failed', 'pending')),
  last_sync_error TEXT,
  
  -- What data to sync
  sync_settings JSONB DEFAULT '{
    "heartRate": true,
    "hrv": true,
    "steps": true,
    "sleep": true,
    "weight": true,
    "bloodPressure": true,
    "glucose": false,
    "spo2": false
  }'::jsonb,
  
  -- Device metadata
  device_metadata JSONB,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_connected_devices_patient_id ON connected_devices(patient_id);
CREATE INDEX IF NOT EXISTS idx_connected_devices_device_type ON connected_devices(device_type);
CREATE INDEX IF NOT EXISTS idx_connected_devices_is_connected ON connected_devices(is_connected);
CREATE INDEX IF NOT EXISTS idx_connected_devices_last_sync_at ON connected_devices(last_sync_at DESC);

-- RLS Policies
ALTER TABLE connected_devices ENABLE ROW LEVEL SECURITY;

-- Patients can view their own devices
CREATE POLICY "Patients can view own devices"
  ON connected_devices FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM patients
      WHERE patients.id = connected_devices.patient_id
      AND patients.user_id IN (
        SELECT id FROM users WHERE supabase_auth_id = auth.uid()
      )
    )
  );

-- Patients can insert their own devices
CREATE POLICY "Patients can insert own devices"
  ON connected_devices FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM patients
      WHERE patients.id = connected_devices.patient_id
      AND patients.user_id IN (
        SELECT id FROM users WHERE supabase_auth_id = auth.uid()
      )
    )
  );

-- Patients can update their own devices
CREATE POLICY "Patients can update own devices"
  ON connected_devices FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM patients
      WHERE patients.id = connected_devices.patient_id
      AND patients.user_id IN (
        SELECT id FROM users WHERE supabase_auth_id = auth.uid()
      )
    )
  );

-- Patients can delete their own devices
CREATE POLICY "Patients can delete own devices"
  ON connected_devices FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM patients
      WHERE patients.id = connected_devices.patient_id
      AND patients.user_id IN (
        SELECT id FROM users WHERE supabase_auth_id = auth.uid()
      )
    )
  );

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_connected_devices_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER connected_devices_updated_at
  BEFORE UPDATE ON connected_devices
  FOR EACH ROW
  EXECUTE FUNCTION update_connected_devices_updated_at();
