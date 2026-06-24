-- Run in the Supabase SQL Editor for the AI Literacy module.
-- Safe to re-run: uses IF NOT EXISTS / DROP POLICY IF EXISTS guards.
-- Does NOT touch students, careers, interest_responses, or any existing table.

-- ============================================================
-- 1. LEVELS
-- ============================================================
CREATE TABLE IF NOT EXISTS ai_literacy_levels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  level_number INT NOT NULL,
  title TEXT NOT NULL,
  title_hi TEXT,
  description TEXT,
  description_hi TEXT,
  is_published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_ai_literacy_levels_number
  ON ai_literacy_levels(level_number);

-- ============================================================
-- 2. CONTENT ITEMS (reading / quiz / task)
-- ============================================================
CREATE TABLE IF NOT EXISTS ai_literacy_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  level_id UUID NOT NULL REFERENCES ai_literacy_levels(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('reading', 'quiz', 'task')),
  title TEXT NOT NULL,
  title_hi TEXT,
  body TEXT,
  body_hi TEXT,
  position INT NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ai_literacy_content_level
  ON ai_literacy_content(level_id, position);

-- ============================================================
-- 3. QUIZ QUESTIONS (belong to a content item of type 'quiz')
-- ============================================================
CREATE TABLE IF NOT EXISTS ai_literacy_quiz_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id UUID NOT NULL REFERENCES ai_literacy_content(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_text_hi TEXT,
  option_a TEXT NOT NULL,
  option_a_hi TEXT,
  option_b TEXT NOT NULL,
  option_b_hi TEXT,
  option_c TEXT NOT NULL,
  option_c_hi TEXT,
  option_d TEXT NOT NULL,
  option_d_hi TEXT,
  correct_answer TEXT NOT NULL CHECK (correct_answer IN ('A', 'B', 'C', 'D')),
  explanation TEXT,
  explanation_hi TEXT,
  position INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ai_literacy_quiz_content
  ON ai_literacy_quiz_questions(content_id, position);

-- ============================================================
-- 4. STUDENT PROGRESS (one row per student per content item)
-- ============================================================
CREATE TABLE IF NOT EXISTS ai_literacy_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  content_id UUID NOT NULL REFERENCES ai_literacy_content(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('in_progress', 'completed')),
  score INT,
  total_questions INT,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (student_id, content_id)
);

CREATE INDEX IF NOT EXISTS idx_ai_literacy_progress_student
  ON ai_literacy_progress(student_id);

CREATE INDEX IF NOT EXISTS idx_ai_literacy_progress_content
  ON ai_literacy_progress(content_id);

-- ============================================================
-- 5. ROW LEVEL SECURITY
-- Auth is enforced in the API layer (JWT / ADMIN_SECRET), matching the
-- existing ai_conversations pattern. Permissive policy for the API key.
-- ============================================================
ALTER TABLE ai_literacy_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_literacy_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_literacy_quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_literacy_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow API full access on ai_literacy_levels" ON ai_literacy_levels;
CREATE POLICY "Allow API full access on ai_literacy_levels"
  ON ai_literacy_levels FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow API full access on ai_literacy_content" ON ai_literacy_content;
CREATE POLICY "Allow API full access on ai_literacy_content"
  ON ai_literacy_content FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow API full access on ai_literacy_quiz_questions" ON ai_literacy_quiz_questions;
CREATE POLICY "Allow API full access on ai_literacy_quiz_questions"
  ON ai_literacy_quiz_questions FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow API full access on ai_literacy_progress" ON ai_literacy_progress;
CREATE POLICY "Allow API full access on ai_literacy_progress"
  ON ai_literacy_progress FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);
