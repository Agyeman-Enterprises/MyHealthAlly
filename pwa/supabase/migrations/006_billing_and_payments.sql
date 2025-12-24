-- Billing and Payment Tables
-- Run this AFTER 001_initial_schema.sql and 003_missing_tables.sql

-- ============================================
-- PATIENT BILLING (Invoices)
-- ============================================

CREATE TABLE patient_billing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  invoice_number VARCHAR(50) UNIQUE,
  description TEXT,
  total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  amount_paid DECIMAL(10,2) NOT NULL DEFAULT 0,
  amount_due DECIMAL(10,2) NOT NULL DEFAULT 0,
  status VARCHAR(20) NOT NULL DEFAULT 'pending', -- pending, paid, overdue, cancelled
  due_date DATE,
  paid_at TIMESTAMP,
  invoice_pdf_url VARCHAR(500),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX patient_billing_patient_idx ON patient_billing(patient_id);
CREATE INDEX patient_billing_status_idx ON patient_billing(status);
CREATE INDEX patient_billing_due_date_idx ON patient_billing(due_date);

-- ============================================
-- PATIENT PAYMENTS
-- ============================================

CREATE TABLE patient_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'USD',
  payment_method VARCHAR(50) NOT NULL, -- stripe, cash, check, etc.
  stripe_payment_intent_id VARCHAR(255),
  status VARCHAR(20) NOT NULL DEFAULT 'pending', -- pending, completed, failed, refunded
  source VARCHAR(20) DEFAULT 'mha', -- mha payment indicator
  metadata JSONB DEFAULT '{}'::jsonb,
  paid_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX patient_payments_patient_idx ON patient_payments(patient_id);
CREATE INDEX patient_payments_status_idx ON patient_payments(status);
CREATE INDEX patient_payments_stripe_intent_idx ON patient_payments(stripe_payment_intent_id);

-- ============================================
-- RLS POLICIES
-- ============================================

ALTER TABLE patient_billing ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_payments ENABLE ROW LEVEL SECURITY;

-- Patients can view own billing
CREATE POLICY "Patients can view own billing" ON patient_billing
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = (SELECT user_id FROM patients WHERE patients.id = patient_billing.patient_id)
      AND users.supabase_auth_id = auth.uid()
    )
  );

-- Clinicians can view patient billing
CREATE POLICY "Clinicians can view patient billing" ON patient_billing
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users
      JOIN clinicians ON clinicians.user_id = users.id
      JOIN patients ON patients.primary_clinician_id = clinicians.id
      WHERE users.supabase_auth_id = auth.uid()
      AND patients.id = patient_billing.patient_id
    )
  );

-- Patients can view own payments
CREATE POLICY "Patients can view own payments" ON patient_payments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = (SELECT user_id FROM patients WHERE patients.id = patient_payments.patient_id)
      AND users.supabase_auth_id = auth.uid()
    )
  );

-- Patients can insert own payments
CREATE POLICY "Patients can insert own payments" ON patient_payments
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = (SELECT user_id FROM patients WHERE patients.id = patient_payments.patient_id)
      AND users.supabase_auth_id = auth.uid()
    )
  );

-- Clinicians can view patient payments
CREATE POLICY "Clinicians can view patient payments" ON patient_payments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users
      JOIN clinicians ON clinicians.user_id = users.id
      JOIN patients ON patients.primary_clinician_id = clinicians.id
      WHERE users.supabase_auth_id = auth.uid()
      AND patients.id = patient_payments.patient_id
    )
  );

-- ============================================
-- TRIGGERS
-- ============================================

CREATE TRIGGER update_patient_billing_updated_at BEFORE UPDATE ON patient_billing
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_patient_payments_updated_at BEFORE UPDATE ON patient_payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

