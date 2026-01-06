-- Migration: 010_contact_messages.sql
-- Purpose: Create contact_messages table for support inquiries

CREATE TABLE IF NOT EXISTS contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES patients(id) ON DELETE SET NULL,
  subject VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'resolved', 'closed')),
  response TEXT,
  responded_at TIMESTAMPTZ,
  responded_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_contact_messages_user_id ON contact_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_contact_messages_patient_id ON contact_messages(patient_id);
CREATE INDEX IF NOT EXISTS idx_contact_messages_status ON contact_messages(status);
CREATE INDEX IF NOT EXISTS idx_contact_messages_created_at ON contact_messages(created_at DESC);

-- RLS Policies
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- Users can view their own messages
CREATE POLICY "Users can view own contact messages"
  ON contact_messages FOR SELECT
  USING (auth.uid() IN (SELECT supabase_auth_id FROM users WHERE id = user_id));

-- Users can create their own messages
CREATE POLICY "Users can create own contact messages"
  ON contact_messages FOR INSERT
  WITH CHECK (auth.uid() IN (SELECT supabase_auth_id FROM users WHERE id = user_id));

-- Admins can view all messages
CREATE POLICY "Admins can view all contact messages"
  ON contact_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.supabase_auth_id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Admins can update messages
CREATE POLICY "Admins can update contact messages"
  ON contact_messages FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.supabase_auth_id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_contact_messages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER contact_messages_updated_at
  BEFORE UPDATE ON contact_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_contact_messages_updated_at();
