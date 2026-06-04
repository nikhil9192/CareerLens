-- Run in Supabase SQL Editor for Module 7: AI Career Counsellor

CREATE TABLE IF NOT EXISTS ai_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ai_conversations_student_id
  ON ai_conversations(student_id);

CREATE INDEX IF NOT EXISTS idx_ai_conversations_student_created
  ON ai_conversations(student_id, created_at DESC);

ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow service role full access on ai_conversations" ON ai_conversations;
CREATE POLICY "Allow service role full access on ai_conversations"
  ON ai_conversations FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);
