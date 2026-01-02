-- 002_practice_attachment.sql
-- Adds practice attachment fields to patients and migrates existing patients to ATTACHED (preserve current behavior)

BEGIN;

-- 1) Add columns (non-breaking, nullable where appropriate)
ALTER TABLE public.patients
  ADD COLUMN IF NOT EXISTS practice_id uuid NULL,
  ADD COLUMN IF NOT EXISTS attachment_status text NOT NULL DEFAULT 'UNATTACHED',
  ADD COLUMN IF NOT EXISTS sp_patient_id text NULL,
  ADD COLUMN IF NOT EXISTS attachment_requested_at timestamptz NULL,
  ADD COLUMN IF NOT EXISTS attached_at timestamptz NULL;

-- 2) Constrain attachment_status to allowed values
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'patients_attachment_status_check'
  ) THEN
    ALTER TABLE public.patients
      ADD CONSTRAINT patients_attachment_status_check
      CHECK (attachment_status IN ('UNATTACHED', 'REQUESTED', 'ATTACHED'));
  END IF;
END $$;

-- 3) Indexes (safe + useful)
CREATE INDEX IF NOT EXISTS idx_patients_attachment_status ON public.patients (attachment_status);
CREATE INDEX IF NOT EXISTS idx_patients_practice_id ON public.patients (practice_id);
CREATE INDEX IF NOT EXISTS idx_patients_sp_patient_id ON public.patients (sp_patient_id);

-- 4) Data migration:
-- Preserve current behavior: all existing patients become ATTACHED.
-- Note: practice_id remains NULL for now (you can populate later).
UPDATE public.patients
SET
  attachment_status = 'ATTACHED',
  attached_at = COALESCE(attached_at, NOW())
WHERE
  attachment_status IS DISTINCT FROM 'ATTACHED';

COMMIT;

