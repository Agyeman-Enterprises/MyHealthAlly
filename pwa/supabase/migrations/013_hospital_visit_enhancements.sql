-- Migration: 013_hospital_visit_enhancements.sql
-- Purpose: Enhance hospital visit tracking, medication reconciliation, and follow-up reminders

-- Enhance hospital_admissions table with additional fields for visit history
ALTER TABLE hospital_admissions 
  ADD COLUMN IF NOT EXISTS visit_type VARCHAR(50) DEFAULT 'inpatient', -- emergency, inpatient, observation, outpatient
  ADD COLUMN IF NOT EXISTS discharge_diagnosis TEXT,
  ADD COLUMN IF NOT EXISTS medications_prescribed JSONB DEFAULT '[]'::jsonb, -- Medications prescribed during visit
  ADD COLUMN IF NOT EXISTS medications_reconciled BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS medications_reconciled_at TIMESTAMP,
  ADD COLUMN IF NOT EXISTS follow_up_required BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS follow_up_days INTEGER, -- Days after discharge for follow-up
  ADD COLUMN IF NOT EXISTS follow_up_reminder_sent BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS follow_up_reminder_sent_at TIMESTAMP;

-- Create index for visit type
CREATE INDEX IF NOT EXISTS hospital_admissions_visit_type_idx ON hospital_admissions(visit_type);

-- Create index for follow-up tracking
CREATE INDEX IF NOT EXISTS hospital_admissions_follow_up_idx ON hospital_admissions(follow_up_required, discharge_date) 
  WHERE follow_up_required = true AND discharge_date IS NOT NULL;

-- Create medication_reconciliation table for tracking medication changes from hospital visits
CREATE TABLE IF NOT EXISTS medication_reconciliation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hospital_admission_id UUID REFERENCES hospital_admissions(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  
  -- Medication details
  medication_name VARCHAR(255) NOT NULL,
  dosage VARCHAR(100),
  frequency VARCHAR(100),
  route VARCHAR(50),
  instructions TEXT,
  
  -- Reconciliation action
  action VARCHAR(50) NOT NULL, -- added, modified, discontinued, unchanged
  previous_medication_id UUID REFERENCES medications(id) ON DELETE SET NULL, -- If modifying existing
  
  -- Status
  applied BOOLEAN DEFAULT false, -- Whether changes have been applied to medication list
  applied_at TIMESTAMP,
  applied_by UUID REFERENCES users(id) ON DELETE SET NULL,
  
  -- Notes
  notes TEXT,
  
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS medication_reconciliation_admission_idx ON medication_reconciliation(hospital_admission_id);
CREATE INDEX IF NOT EXISTS medication_reconciliation_patient_idx ON medication_reconciliation(patient_id);
CREATE INDEX IF NOT EXISTS medication_reconciliation_applied_idx ON medication_reconciliation(applied);

-- Enable RLS
ALTER TABLE medication_reconciliation ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Patients can view their own medication reconciliations
CREATE POLICY "Patients can view own medication reconciliations"
  ON medication_reconciliation FOR SELECT
  USING (
    patient_id IN (SELECT id FROM patients WHERE user_id IN (SELECT id FROM users WHERE supabase_auth_id = auth.uid()))
  );

-- RLS Policy: System can create medication reconciliations (via service role)
-- Note: This would typically be done server-side with service role key

-- Create follow_up_reminders table
CREATE TABLE IF NOT EXISTS follow_up_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hospital_admission_id UUID REFERENCES hospital_admissions(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  
  -- Reminder details
  reminder_type VARCHAR(50) NOT NULL, -- follow_up_appointment, medication_review, lab_follow_up, etc.
  reminder_date DATE NOT NULL, -- When the reminder should be sent
  reminder_message TEXT,
  
  -- Status
  sent BOOLEAN DEFAULT false,
  sent_at TIMESTAMP,
  acknowledged BOOLEAN DEFAULT false,
  acknowledged_at TIMESTAMP,
  
  -- Scheduling
  scheduled_appointment_id UUID, -- If reminder is for scheduling an appointment
  
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS follow_up_reminders_admission_idx ON follow_up_reminders(hospital_admission_id);
CREATE INDEX IF NOT EXISTS follow_up_reminders_patient_idx ON follow_up_reminders(patient_id);
CREATE INDEX IF NOT EXISTS follow_up_reminders_date_idx ON follow_up_reminders(reminder_date) WHERE sent = false;

-- Enable RLS
ALTER TABLE follow_up_reminders ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Patients can view their own follow-up reminders
CREATE POLICY "Patients can view own follow-up reminders"
  ON follow_up_reminders FOR SELECT
  USING (
    patient_id IN (SELECT id FROM patients WHERE user_id IN (SELECT id FROM users WHERE supabase_auth_id = auth.uid()))
  );

-- Function to automatically create follow-up reminder when hospital admission is discharged
CREATE OR REPLACE FUNCTION create_follow_up_reminder_on_discharge()
RETURNS TRIGGER AS $$
BEGIN
  -- If discharge date is set and follow-up is required
  IF NEW.discharge_date IS NOT NULL 
     AND NEW.follow_up_required = true 
     AND NEW.follow_up_days IS NOT NULL
     AND OLD.discharge_date IS NULL THEN
    
    INSERT INTO follow_up_reminders (
      hospital_admission_id,
      patient_id,
      reminder_type,
      reminder_date,
      reminder_message
    ) VALUES (
      NEW.id,
      NEW.patient_id,
      'follow_up_appointment',
      NEW.discharge_date + (NEW.follow_up_days || ' days')::interval,
      'Follow-up appointment recommended ' || NEW.follow_up_days || ' days after discharge from ' || NEW.hospital_name
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to create follow-up reminder on discharge
DROP TRIGGER IF EXISTS trigger_create_follow_up_on_discharge ON hospital_admissions;
CREATE TRIGGER trigger_create_follow_up_on_discharge
  AFTER UPDATE OF discharge_date ON hospital_admissions
  FOR EACH ROW
  WHEN (NEW.discharge_date IS NOT NULL AND OLD.discharge_date IS NULL)
  EXECUTE FUNCTION create_follow_up_reminder_on_discharge();
