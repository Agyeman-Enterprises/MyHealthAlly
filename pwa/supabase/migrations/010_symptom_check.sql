-- Symptom Check + Clinician handoff (AI-assisted, non-diagnostic)

-- Enums
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid WHERE t.typname = 'triage_level') THEN
    CREATE TYPE triage_level AS ENUM ('routine', 'urgent', 'emergent');
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid WHERE t.typname = 'symptom_check_status') THEN
    CREATE TYPE symptom_check_status AS ENUM ('draft', 'submitted');
  END IF;
END$$;

-- Extend task_category
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type t
    JOIN pg_enum e ON t.oid = e.enumtypid
    WHERE t.typname = 'task_category' AND e.enumlabel = 'symptom_check_review'
  ) THEN
    ALTER TYPE task_category ADD VALUE 'symptom_check_review';
  END IF;
END$$;

-- Table: symptom_checks
CREATE TABLE IF NOT EXISTS symptom_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  disclaimer_ack_at TIMESTAMP,
  chief_complaint_text TEXT NOT NULL,
  category TEXT,
  red_flags_selected JSONB DEFAULT '[]'::jsonb,
  triage_level triage_level NOT NULL DEFAULT 'routine',
  answers JSONB DEFAULT '[]'::jsonb,
  summary_patient_safe TEXT,
  summary_clinician TEXT,
  education_patient_general JSONB DEFAULT '[]'::jsonb,
  handoff_task_id UUID REFERENCES tasks(id),
  status symptom_check_status NOT NULL DEFAULT 'submitted'
);

CREATE INDEX IF NOT EXISTS symptom_checks_patient_idx ON symptom_checks(patient_id);
CREATE INDEX IF NOT EXISTS symptom_checks_created_idx ON symptom_checks(created_at);

ALTER TABLE symptom_checks ENABLE ROW LEVEL SECURITY;

-- RLS: patients can view/insert their own symptom checks
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Patients can view own symptom checks'
  ) THEN
    CREATE POLICY "Patients can view own symptom checks" ON symptom_checks
      FOR SELECT USING (
        EXISTS (
          SELECT 1 FROM users
          WHERE users.id = (SELECT user_id FROM patients WHERE patients.id = symptom_checks.patient_id)
          AND users.supabase_auth_id = auth.uid()
        )
      );
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Patients can insert symptom checks'
  ) THEN
    CREATE POLICY "Patients can insert symptom checks" ON symptom_checks
      FOR INSERT WITH CHECK (
        EXISTS (
          SELECT 1 FROM users
          WHERE users.id = (SELECT user_id FROM patients WHERE patients.id = symptom_checks.patient_id)
          AND users.supabase_auth_id = auth.uid()
        )
      );
  END IF;
END$$;

-- Trigger for updated_at (reuse if function exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_updated_at_column') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_symptom_checks_updated_at') THEN
      ALTER TABLE symptom_checks ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();
      CREATE TRIGGER update_symptom_checks_updated_at
        BEFORE UPDATE ON symptom_checks
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
  END IF;
END$$;
