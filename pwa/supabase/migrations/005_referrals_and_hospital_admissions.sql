-- ============================================
-- REFERRALS AND HOSPITAL ADMISSIONS
-- ============================================

-- Create referral_requests table
CREATE TABLE IF NOT EXISTS referral_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    clinician_id UUID REFERENCES clinicians(id) ON DELETE SET NULL,
    
    -- Referral details
    specialty VARCHAR(100) NOT NULL,
    reason TEXT,
    urgency VARCHAR(20) DEFAULT 'routine', -- routine, soon, urgent
    preferred_provider_name VARCHAR(255),
    preferred_location VARCHAR(255),
    
    -- Status
    status VARCHAR(50) DEFAULT 'pending', -- pending, approved, scheduled, completed, cancelled
    approved_at TIMESTAMP,
    approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Scheduling
    scheduled_date TIMESTAMP,
    scheduled_provider_name VARCHAR(255),
    scheduled_location VARCHAR(255),
    
    -- Notes
    notes TEXT,
    patient_notes TEXT,
    
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS referral_requests_patient_idx ON referral_requests(patient_id);
CREATE INDEX IF NOT EXISTS referral_requests_clinician_idx ON referral_requests(clinician_id);
CREATE INDEX IF NOT EXISTS referral_requests_status_idx ON referral_requests(status);
CREATE INDEX IF NOT EXISTS referral_requests_created_at_idx ON referral_requests(created_at);

-- Enable RLS for referral_requests
ALTER TABLE referral_requests ENABLE ROW LEVEL SECURITY;

-- Policies for referral_requests
CREATE POLICY "Allow read access to own referral requests" ON referral_requests
FOR SELECT USING (
    (patient_id IN (SELECT id FROM patients WHERE user_id = auth.uid())) OR
    (EXISTS (SELECT 1 FROM clinicians WHERE clinicians.id = referral_requests.clinician_id AND clinicians.user_id = auth.uid())) OR
    (EXISTS (SELECT 1 FROM users WHERE users.role = 'admin' AND users.supabase_auth_id = auth.uid()))
);

CREATE POLICY "Allow insert for patients" ON referral_requests
FOR INSERT WITH CHECK (
    patient_id IN (SELECT id FROM patients WHERE user_id = auth.uid())
);

CREATE POLICY "Allow update for clinicians and admins" ON referral_requests
FOR UPDATE USING (
    (EXISTS (SELECT 1 FROM clinicians WHERE clinicians.id = referral_requests.clinician_id AND clinicians.user_id = auth.uid())) OR
    (EXISTS (SELECT 1 FROM users WHERE users.role = 'admin' AND users.supabase_auth_id = auth.uid()))
);

-- Create hospital_admissions table
CREATE TABLE IF NOT EXISTS hospital_admissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    
    -- Hospital information
    hospital_name VARCHAR(255) NOT NULL,
    hospital_address TEXT,
    hospital_phone VARCHAR(20),
    
    -- Admission details
    admission_date DATE NOT NULL,
    admission_reason TEXT,
    admission_type VARCHAR(50), -- emergency, planned, observation, etc.
    
    -- Discharge details
    discharge_date DATE,
    discharge_summary_url TEXT,
    discharge_instructions TEXT,
    
    -- Notification
    notified_at TIMESTAMP DEFAULT NOW(),
    notified_to_clinician_id UUID REFERENCES clinicians(id) ON DELETE SET NULL,
    acknowledged_at TIMESTAMP,
    acknowledged_by UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Status
    status VARCHAR(50) DEFAULT 'active', -- active, discharged, cancelled
    
    -- Notes
    patient_notes TEXT,
    clinical_notes TEXT,
    
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS hospital_admissions_patient_idx ON hospital_admissions(patient_id);
CREATE INDEX IF NOT EXISTS hospital_admissions_clinician_idx ON hospital_admissions(notified_to_clinician_id);
CREATE INDEX IF NOT EXISTS hospital_admissions_status_idx ON hospital_admissions(status);
CREATE INDEX IF NOT EXISTS hospital_admissions_admission_date_idx ON hospital_admissions(admission_date);

-- Enable RLS for hospital_admissions
ALTER TABLE hospital_admissions ENABLE ROW LEVEL SECURITY;

-- Policies for hospital_admissions
CREATE POLICY "Allow read access to own hospital admissions" ON hospital_admissions
FOR SELECT USING (
    (patient_id IN (SELECT id FROM patients WHERE user_id = auth.uid())) OR
    (EXISTS (SELECT 1 FROM clinicians WHERE clinicians.id = hospital_admissions.notified_to_clinician_id AND clinicians.user_id = auth.uid())) OR
    (EXISTS (SELECT 1 FROM users WHERE users.role IN ('clinician', 'admin') AND users.supabase_auth_id = auth.uid()))
);

CREATE POLICY "Allow insert for patients" ON hospital_admissions
FOR INSERT WITH CHECK (
    patient_id IN (SELECT id FROM patients WHERE user_id = auth.uid())
);

CREATE POLICY "Allow update for clinicians and admins" ON hospital_admissions
FOR UPDATE USING (
    (EXISTS (SELECT 1 FROM clinicians WHERE clinicians.id = hospital_admissions.notified_to_clinician_id AND clinicians.user_id = auth.uid())) OR
    (EXISTS (SELECT 1 FROM users WHERE users.role = 'admin' AND users.supabase_auth_id = auth.uid()))
);

-- Add updated_at trigger for referral_requests
CREATE TRIGGER update_referral_requests_updated_at BEFORE UPDATE ON referral_requests
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add updated_at trigger for hospital_admissions
CREATE TRIGGER update_hospital_admissions_updated_at BEFORE UPDATE ON hospital_admissions
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

