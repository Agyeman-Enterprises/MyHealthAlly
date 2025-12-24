-- Missing Tables: Medications, Labs, Care Plans, Encounters (SAFE VERSION)
-- This version checks if tables exist before creating them
-- Run this if you get "relation already exists" errors

-- ============================================
-- MEDICATIONS (Create only if not exists)
-- ============================================

DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'medications') THEN
        CREATE TABLE medications (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
          prescriber_id UUID REFERENCES clinicians(id),
          name VARCHAR(255) NOT NULL,
          generic_name VARCHAR(255),
          brand_name VARCHAR(255),
          ndc_code VARCHAR(20),
          dosage VARCHAR(100) NOT NULL,
          dosage_unit VARCHAR(50) NOT NULL,
          frequency VARCHAR(100) NOT NULL,
          route VARCHAR(50),
          schedule JSONB,
          start_date DATE,
          end_date DATE,
          is_active BOOLEAN DEFAULT true,
          is_prn BOOLEAN DEFAULT false,
          refills_remaining INTEGER,
          last_refill_date DATE,
          pharmacy VARCHAR(255),
          pharmacy_phone VARCHAR(20),
          instructions TEXT,
          instructions_language VARCHAR(5) DEFAULT 'en',
          indication TEXT,
          discontinued_at TIMESTAMP,
          discontinued_by_clinician_id UUID REFERENCES clinicians(id),
          discontinued_reason TEXT,
          clinician_notes TEXT,
          created_at TIMESTAMP NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMP NOT NULL DEFAULT NOW()
        );

        CREATE INDEX medications_patient_idx ON medications(patient_id);
        CREATE INDEX medications_active_idx ON medications(patient_id, is_active);
        
        ALTER TABLE medications ENABLE ROW LEVEL SECURITY;
        
        RAISE NOTICE 'Created medications table';
    ELSE
        RAISE NOTICE 'medications table already exists, skipping';
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'medication_adherence') THEN
        CREATE TABLE medication_adherence (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          medication_id UUID NOT NULL REFERENCES medications(id) ON DELETE CASCADE,
          patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
          scheduled_at TIMESTAMP NOT NULL,
          taken_at TIMESTAMP,
          taken BOOLEAN DEFAULT false,
          skipped BOOLEAN DEFAULT false,
          skip_reason VARCHAR(255),
          notes TEXT,
          created_at TIMESTAMP NOT NULL DEFAULT NOW()
        );

        CREATE INDEX medication_adherence_medication_idx ON medication_adherence(medication_id);
        CREATE INDEX medication_adherence_scheduled_idx ON medication_adherence(scheduled_at);
        
        ALTER TABLE medication_adherence ENABLE ROW LEVEL SECURITY;
        
        RAISE NOTICE 'Created medication_adherence table';
    ELSE
        RAISE NOTICE 'medication_adherence table already exists, skipping';
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'refill_requests') THEN
        CREATE TABLE refill_requests (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          medication_id UUID NOT NULL REFERENCES medications(id) ON DELETE CASCADE,
          patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
          requested_at TIMESTAMP NOT NULL DEFAULT NOW(),
          urgency VARCHAR(20) DEFAULT 'routine',
          notes TEXT,
          status VARCHAR(30) DEFAULT 'pending',
          responded_at TIMESTAMP,
          responded_by_clinician_id UUID REFERENCES clinicians(id),
          response_notes TEXT,
          created_at TIMESTAMP NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMP NOT NULL DEFAULT NOW()
        );

        CREATE INDEX refill_requests_patient_idx ON refill_requests(patient_id);
        CREATE INDEX refill_requests_status_idx ON refill_requests(status);
        
        ALTER TABLE refill_requests ENABLE ROW LEVEL SECURITY;
        
        RAISE NOTICE 'Created refill_requests table';
    ELSE
        RAISE NOTICE 'refill_requests table already exists, skipping';
    END IF;
END $$;

-- ============================================
-- LABS (Create only if not exists)
-- ============================================

DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'lab_orders') THEN
        CREATE TABLE lab_orders (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
          ordering_clinician_id UUID NOT NULL REFERENCES clinicians(id),
          order_number VARCHAR(50),
          ordered_at TIMESTAMP NOT NULL DEFAULT NOW(),
          lab_facility VARCHAR(255),
          lab_facility_address TEXT,
          status lab_status NOT NULL DEFAULT 'ordered',
          scheduled_date DATE,
          collection_date DATE,
          resulted_at TIMESTAMP,
          results_document_url VARCHAR(500),
          reviewed_by_clinician_id UUID REFERENCES clinicians(id),
          reviewed_at TIMESTAMP,
          review_notes TEXT,
          patient_notes TEXT,
          patient_notes_language VARCHAR(5) DEFAULT 'en',
          fasting_required BOOLEAN DEFAULT false,
          fasting_hours INTEGER,
          special_instructions TEXT,
          created_at TIMESTAMP NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMP NOT NULL DEFAULT NOW()
        );

        CREATE INDEX lab_orders_patient_idx ON lab_orders(patient_id);
        CREATE INDEX lab_orders_status_idx ON lab_orders(status);
        
        ALTER TABLE lab_orders ENABLE ROW LEVEL SECURITY;
        
        RAISE NOTICE 'Created lab_orders table';
    ELSE
        RAISE NOTICE 'lab_orders table already exists, skipping';
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'lab_tests') THEN
        CREATE TABLE lab_tests (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          lab_order_id UUID NOT NULL REFERENCES lab_orders(id) ON DELETE CASCADE,
          test_code VARCHAR(50) NOT NULL,
          test_name VARCHAR(255) NOT NULL,
          category VARCHAR(100),
          result_value VARCHAR(100),
          result_unit VARCHAR(50),
          result_numeric DECIMAL(15,5),
          reference_range_low DECIMAL(15,5),
          reference_range_high DECIMAL(15,5),
          reference_range_text VARCHAR(100),
          is_abnormal BOOLEAN DEFAULT false,
          abnormal_flag VARCHAR(10),
          is_critical BOOLEAN DEFAULT false,
          interpretation TEXT,
          interpretation_language VARCHAR(5) DEFAULT 'en',
          created_at TIMESTAMP NOT NULL DEFAULT NOW()
        );

        CREATE INDEX lab_tests_order_idx ON lab_tests(lab_order_id);
        
        ALTER TABLE lab_tests ENABLE ROW LEVEL SECURITY;
        
        RAISE NOTICE 'Created lab_tests table';
    ELSE
        RAISE NOTICE 'lab_tests table already exists, skipping';
    END IF;
END $$;

-- ============================================
-- CARE PLANS (Create only if not exists)
-- ============================================

DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'care_plans') THEN
        CREATE TABLE care_plans (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
          clinician_id UUID NOT NULL REFERENCES clinicians(id),
          title VARCHAR(255) NOT NULL,
          description TEXT,
          status care_plan_status NOT NULL DEFAULT 'draft',
          start_date DATE,
          end_date DATE,
          review_date DATE,
          version INTEGER NOT NULL DEFAULT 1,
          parent_plan_id UUID,
          primary_goals JSONB DEFAULT '[]'::jsonb,
          created_at TIMESTAMP NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
          activated_at TIMESTAMP,
          completed_at TIMESTAMP
        );

        CREATE INDEX care_plans_patient_idx ON care_plans(patient_id);
        CREATE INDEX care_plans_status_idx ON care_plans(status);
        
        ALTER TABLE care_plans ENABLE ROW LEVEL SECURITY;
        
        RAISE NOTICE 'Created care_plans table';
    ELSE
        RAISE NOTICE 'care_plans table already exists, skipping';
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'care_plan_sections') THEN
        CREATE TABLE care_plan_sections (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          care_plan_id UUID NOT NULL REFERENCES care_plans(id) ON DELETE CASCADE,
          type care_plan_section_type NOT NULL,
          title VARCHAR(255) NOT NULL,
          description TEXT,
          instructions TEXT,
          sort_order INTEGER NOT NULL DEFAULT 0,
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMP NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMP NOT NULL DEFAULT NOW()
        );

        CREATE INDEX care_plan_sections_plan_idx ON care_plan_sections(care_plan_id);
        
        ALTER TABLE care_plan_sections ENABLE ROW LEVEL SECURITY;
        
        RAISE NOTICE 'Created care_plan_sections table';
    ELSE
        RAISE NOTICE 'care_plan_sections table already exists, skipping';
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'care_plan_items') THEN
        CREATE TABLE care_plan_items (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          section_id UUID NOT NULL REFERENCES care_plan_sections(id) ON DELETE CASCADE,
          title VARCHAR(255) NOT NULL,
          description TEXT,
          frequency VARCHAR(50),
          schedule JSONB,
          dosage VARCHAR(100),
          dosage_unit VARCHAR(50),
          duration_weeks INTEGER,
          start_date DATE,
          end_date DATE,
          requires_tracking BOOLEAN DEFAULT false,
          tracking_type VARCHAR(50),
          sort_order INTEGER NOT NULL DEFAULT 0,
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMP NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMP NOT NULL DEFAULT NOW()
        );

        CREATE INDEX care_plan_items_section_idx ON care_plan_items(section_id);
        
        ALTER TABLE care_plan_items ENABLE ROW LEVEL SECURITY;
        
        RAISE NOTICE 'Created care_plan_items table';
    ELSE
        RAISE NOTICE 'care_plan_items table already exists, skipping';
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'care_plan_progress') THEN
        CREATE TABLE care_plan_progress (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          item_id UUID NOT NULL REFERENCES care_plan_items(id) ON DELETE CASCADE,
          patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
          completed_at TIMESTAMP NOT NULL,
          value VARCHAR(255),
          notes TEXT,
          photo_url VARCHAR(500),
          skipped BOOLEAN DEFAULT false,
          skip_reason VARCHAR(255),
          created_at TIMESTAMP NOT NULL DEFAULT NOW()
        );

        CREATE INDEX care_plan_progress_item_idx ON care_plan_progress(item_id);
        CREATE INDEX care_plan_progress_patient_idx ON care_plan_progress(patient_id);
        
        ALTER TABLE care_plan_progress ENABLE ROW LEVEL SECURITY;
        
        RAISE NOTICE 'Created care_plan_progress table';
    ELSE
        RAISE NOTICE 'care_plan_progress table already exists, skipping';
    END IF;
END $$;

-- ============================================
-- ENCOUNTERS (Create only if not exists)
-- ============================================

DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'encounters') THEN
        CREATE TABLE encounters (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
          clinician_id UUID NOT NULL REFERENCES clinicians(id),
          type encounter_type NOT NULL,
          status encounter_status NOT NULL DEFAULT 'scheduled',
          scheduled_at TIMESTAMP NOT NULL,
          scheduled_duration_minutes INTEGER NOT NULL DEFAULT 30,
          checked_in_at TIMESTAMP,
          started_at TIMESTAMP,
          ended_at TIMESTAMP,
          is_virtual BOOLEAN DEFAULT false,
          location VARCHAR(255),
          meeting_link VARCHAR(500),
          chief_complaint TEXT,
          reason_for_visit TEXT,
          subjective TEXT,
          objective TEXT,
          assessment TEXT,
          plan TEXT,
          additional_notes TEXT,
          patient_instructions TEXT,
          patient_instructions_language VARCHAR(5) DEFAULT 'en',
          follow_up_required BOOLEAN DEFAULT false,
          follow_up_weeks INTEGER,
          follow_up_notes TEXT,
          billing_codes JSONB DEFAULT '[]'::jsonb,
          ccm_time_seconds INTEGER DEFAULT 0,
          created_at TIMESTAMP NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMP NOT NULL DEFAULT NOW()
        );

        CREATE INDEX encounters_patient_idx ON encounters(patient_id);
        CREATE INDEX encounters_clinician_idx ON encounters(clinician_id);
        CREATE INDEX encounters_scheduled_idx ON encounters(scheduled_at);
        
        ALTER TABLE encounters ENABLE ROW LEVEL SECURITY;
        
        RAISE NOTICE 'Created encounters table';
    ELSE
        RAISE NOTICE 'encounters table already exists, skipping';
    END IF;
END $$;

-- ============================================
-- RLS POLICIES (Create only if not exists)
-- ============================================

DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_policies WHERE schemaname = 'public' AND tablename = 'medications' AND policyname = 'Patients can view own medications') THEN
        CREATE POLICY "Patients can view own medications" ON medications
          FOR SELECT USING (
            EXISTS (
              SELECT 1 FROM users
              WHERE users.id = (SELECT user_id FROM patients WHERE patients.id = medications.patient_id)
              AND users.supabase_auth_id = auth.uid()
            )
          );
        RAISE NOTICE 'Created medications RLS policy';
    ELSE
        RAISE NOTICE 'medications RLS policy already exists, skipping';
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_policies WHERE schemaname = 'public' AND tablename = 'medications' AND policyname = 'Clinicians can view patient medications') THEN
        CREATE POLICY "Clinicians can view patient medications" ON medications
          FOR SELECT USING (
            EXISTS (
              SELECT 1 FROM patients
              WHERE patients.id = medications.patient_id
              AND patients.primary_clinician_id IN (
                SELECT id FROM clinicians WHERE user_id IN (
                  SELECT id FROM users WHERE supabase_auth_id = auth.uid()
                )
              )
            )
          );
        RAISE NOTICE 'Created clinicians medications RLS policy';
    ELSE
        RAISE NOTICE 'clinicians medications RLS policy already exists, skipping';
    END IF;
END $$;

-- Similar policies for other tables (simplified)
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_policies WHERE schemaname = 'public' AND tablename = 'lab_orders' AND policyname = 'Patients can view own labs') THEN
        CREATE POLICY "Patients can view own labs" ON lab_orders
          FOR SELECT USING (
            EXISTS (
              SELECT 1 FROM users
              WHERE users.id = (SELECT user_id FROM patients WHERE patients.id = lab_orders.patient_id)
              AND users.supabase_auth_id = auth.uid()
            )
          );
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_policies WHERE schemaname = 'public' AND tablename = 'care_plans' AND policyname = 'Patients can view own care plans') THEN
        CREATE POLICY "Patients can view own care plans" ON care_plans
          FOR SELECT USING (
            EXISTS (
              SELECT 1 FROM users
              WHERE users.id = (SELECT user_id FROM patients WHERE patients.id = care_plans.patient_id)
              AND users.supabase_auth_id = auth.uid()
            )
          );
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_policies WHERE schemaname = 'public' AND tablename = 'encounters' AND policyname = 'Patients can view own encounters') THEN
        CREATE POLICY "Patients can view own encounters" ON encounters
          FOR SELECT USING (
            EXISTS (
              SELECT 1 FROM users
              WHERE users.id = (SELECT user_id FROM patients WHERE patients.id = encounters.patient_id)
              AND users.supabase_auth_id = auth.uid()
            )
          );
    END IF;
END $$;

-- ============================================
-- TRIGGERS (Create only if not exists)
-- ============================================

DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_trigger WHERE tgname = 'update_medications_updated_at') THEN
        CREATE TRIGGER update_medications_updated_at BEFORE UPDATE ON medications
          FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
        RAISE NOTICE 'Created medications trigger';
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_trigger WHERE tgname = 'update_refill_requests_updated_at') THEN
        CREATE TRIGGER update_refill_requests_updated_at BEFORE UPDATE ON refill_requests
          FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_trigger WHERE tgname = 'update_lab_orders_updated_at') THEN
        CREATE TRIGGER update_lab_orders_updated_at BEFORE UPDATE ON lab_orders
          FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_trigger WHERE tgname = 'update_care_plans_updated_at') THEN
        CREATE TRIGGER update_care_plans_updated_at BEFORE UPDATE ON care_plans
          FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_trigger WHERE tgname = 'update_care_plan_sections_updated_at') THEN
        CREATE TRIGGER update_care_plan_sections_updated_at BEFORE UPDATE ON care_plan_sections
          FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_trigger WHERE tgname = 'update_care_plan_items_updated_at') THEN
        CREATE TRIGGER update_care_plan_items_updated_at BEFORE UPDATE ON care_plan_items
          FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_trigger WHERE tgname = 'update_encounters_updated_at') THEN
        CREATE TRIGGER update_encounters_updated_at BEFORE UPDATE ON encounters
          FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

