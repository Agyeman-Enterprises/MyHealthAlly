-- Migration: 009_user_patient_preferences.sql
-- Purpose:
-- - Add preference fields to existing users/patients tables (per Canon: no stubs)
-- - Expand notification settings structure
-- - Add appearance preferences
-- - Enable patients to record care plan progress
-- - Add RLS policies to allow patients to update their own settings and progress

-- ============================
-- Users: preference fields
-- ============================
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS appearance_preferences JSONB
    DEFAULT '{"theme": "system", "textSize": "medium", "highContrast": false, "reduceMotion": false}'::jsonb;

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS two_factor_enabled BOOLEAN DEFAULT false;

-- Expand notification_settings default to include categories and channels
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'users_notification_settings_default_marker'
  ) THEN
    -- marker constraint to avoid re-running
    ALTER TABLE users ADD CONSTRAINT users_notification_settings_default_marker CHECK (true);
  END IF;

  UPDATE users
  SET notification_settings = jsonb_build_object(
    'channels', jsonb_build_object(
      'push', coalesce(notification_settings->'push', 'true'::jsonb),
      'sms', coalesce(notification_settings->'sms', 'true'::jsonb),
      'email', coalesce(notification_settings->'email', 'true'::jsonb)
    ),
    'categories', jsonb_build_object(
      'messages', coalesce(notification_settings->'messages', 'true'::jsonb),
      'appointments', 'true',
      'labResults', 'true',
      'medications', 'true',
      'billing', 'false'
    )
  )
  WHERE notification_settings IS NULL OR notification_settings ? 'push' = false;
END $$;

ALTER TABLE users
  ALTER COLUMN notification_settings SET DEFAULT
    '{
      "channels": { "push": true, "sms": true, "email": true },
      "categories": { "messages": true, "appointments": true, "labResults": true, "medications": true, "billing": false }
    }'::jsonb;

-- ============================
-- Patients: reminder fields (already present, ensure defaults)
-- ============================
ALTER TABLE patients
  ALTER COLUMN appointment_reminders SET DEFAULT true,
  ALTER COLUMN medication_reminders SET DEFAULT true;

-- ============================
-- Care plan progress policies
-- ============================
-- Allow patients to view/insert/update/delete their own care plan progress
CREATE POLICY "Patients can view own care plan progress" ON care_plan_progress
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = (SELECT user_id FROM patients WHERE patients.id = care_plan_progress.patient_id)
      AND users.supabase_auth_id = auth.uid()
    )
  );

CREATE POLICY "Patients can insert care plan progress" ON care_plan_progress
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = (SELECT user_id FROM patients WHERE patients.id = care_plan_progress.patient_id)
      AND users.supabase_auth_id = auth.uid()
    )
  );

CREATE POLICY "Patients can update care plan progress" ON care_plan_progress
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = (SELECT user_id FROM patients WHERE patients.id = care_plan_progress.patient_id)
      AND users.supabase_auth_id = auth.uid()
    )
  );

CREATE POLICY "Patients can delete care plan progress" ON care_plan_progress
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = (SELECT user_id FROM patients WHERE patients.id = care_plan_progress.patient_id)
      AND users.supabase_auth_id = auth.uid()
    )
  );

-- ============================
-- User/Patient update policies
-- ============================
-- Allow a signed-in user to update their own user record
CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid() = supabase_auth_id)
  WITH CHECK (auth.uid() = supabase_auth_id);

-- Allow a patient to update their own patient record
CREATE POLICY "Patients can update own data" ON patients
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = patients.user_id
      AND users.supabase_auth_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = patients.user_id
      AND users.supabase_auth_id = auth.uid()
    )
  );

-- ============================
-- Triggers (appearance_preferences + notification_settings + care_plan_progress)
-- ============================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_care_plan_progress_updated_at'
  ) THEN
    CREATE TRIGGER update_care_plan_progress_updated_at
      BEFORE UPDATE ON care_plan_progress
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;
