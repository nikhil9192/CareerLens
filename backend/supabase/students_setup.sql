-- Run this in the Supabase SQL Editor if registration fails.

-- Add school_name if the column is missing
ALTER TABLE students
  ADD COLUMN IF NOT EXISTS school_name TEXT;

-- Allow the API (anon key) to insert and read students
ALTER TABLE students ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public insert on students" ON students;
CREATE POLICY "Allow public insert on students"
  ON students FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public select on students" ON students;
CREATE POLICY "Allow public select on students"
  ON students FOR SELECT
  TO anon, authenticated
  USING (true);
