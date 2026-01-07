-- Migration: 011_ai_chat_conversations.sql
-- Purpose: Create table for persistent AI chat conversation history

CREATE TABLE IF NOT EXISTS ai_chat_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES patients(id) ON DELETE SET NULL,
  
  -- Conversation metadata
  title VARCHAR(255), -- Auto-generated from first message
  language VARCHAR(10) DEFAULT 'en', -- User's preferred language
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_message_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Messages within conversations
CREATE TABLE IF NOT EXISTS ai_chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES ai_chat_conversations(id) ON DELETE CASCADE,
  
  -- Message content
  role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  original_content TEXT, -- For translations: original text before translation
  content_language VARCHAR(10) DEFAULT 'en', -- Language of the content
  
  -- Metadata
  suggested_questions JSONB DEFAULT '[]'::jsonb, -- Suggested follow-up questions from AI
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_ai_chat_conversations_user_id ON ai_chat_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_chat_conversations_patient_id ON ai_chat_conversations(patient_id);
CREATE INDEX IF NOT EXISTS idx_ai_chat_conversations_updated_at ON ai_chat_conversations(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_chat_messages_conversation_id ON ai_chat_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_ai_chat_messages_created_at ON ai_chat_messages(created_at);

-- RLS Policies
ALTER TABLE ai_chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_chat_messages ENABLE ROW LEVEL SECURITY;

-- Users can view their own conversations
CREATE POLICY "Users can view own AI chat conversations"
  ON ai_chat_conversations FOR SELECT
  USING (auth.uid() IN (SELECT supabase_auth_id FROM users WHERE id = user_id));

-- Users can create their own conversations
CREATE POLICY "Users can create own AI chat conversations"
  ON ai_chat_conversations FOR INSERT
  WITH CHECK (auth.uid() IN (SELECT supabase_auth_id FROM users WHERE id = user_id));

-- Users can update their own conversations
CREATE POLICY "Users can update own AI chat conversations"
  ON ai_chat_conversations FOR UPDATE
  USING (auth.uid() IN (SELECT supabase_auth_id FROM users WHERE id = user_id));

-- Users can delete their own conversations
CREATE POLICY "Users can delete own AI chat conversations"
  ON ai_chat_conversations FOR DELETE
  USING (auth.uid() IN (SELECT supabase_auth_id FROM users WHERE id = user_id));

-- Users can view messages in their conversations
CREATE POLICY "Users can view own AI chat messages"
  ON ai_chat_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM ai_chat_conversations
      WHERE ai_chat_conversations.id = ai_chat_messages.conversation_id
      AND auth.uid() IN (SELECT supabase_auth_id FROM users WHERE id = ai_chat_conversations.user_id)
    )
  );

-- Users can create messages in their conversations
CREATE POLICY "Users can create own AI chat messages"
  ON ai_chat_messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM ai_chat_conversations
      WHERE ai_chat_conversations.id = ai_chat_messages.conversation_id
      AND auth.uid() IN (SELECT supabase_auth_id FROM users WHERE id = ai_chat_conversations.user_id)
    )
  );

-- Function to update conversation's updated_at and last_message_at
CREATE OR REPLACE FUNCTION update_ai_chat_conversation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE ai_chat_conversations
  SET updated_at = NOW(), last_message_at = NOW()
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update conversation timestamp when message is created
CREATE TRIGGER update_ai_chat_conversation_on_message
  AFTER INSERT ON ai_chat_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_ai_chat_conversation_timestamp();
