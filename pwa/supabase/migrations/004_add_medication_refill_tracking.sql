-- Add days_supply and next_refill_due_date to medications table for refill tracking
-- Run this AFTER 003_missing_tables.sql

-- Add days_supply column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'medications' AND column_name = 'days_supply'
    ) THEN
        ALTER TABLE medications ADD COLUMN days_supply INTEGER;
    END IF;
END $$;

-- Add next_refill_due_date column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'medications' AND column_name = 'next_refill_due_date'
    ) THEN
        ALTER TABLE medications ADD COLUMN next_refill_due_date DATE;
    END IF;
END $$;

-- Add solopractice_medication_id for tracking medications from Solopractice
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'medications' AND column_name = 'solopractice_medication_id'
    ) THEN
        ALTER TABLE medications ADD COLUMN solopractice_medication_id VARCHAR(255);
        CREATE INDEX medications_solopractice_id_idx ON medications(solopractice_medication_id);
    END IF;
END $$;

-- Add index for refill tracking queries
CREATE INDEX IF NOT EXISTS medications_refill_tracking_idx ON medications(patient_id, is_active, next_refill_due_date) WHERE is_active = true;

