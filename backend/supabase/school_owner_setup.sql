-- ─────────────────────────────────────────────────────────────────────────────
-- School Owner Dashboard — database migration
-- Run this ONCE in Supabase SQL Editor before deploying.
-- All statements are idempotent (IF NOT EXISTS / DO NOTHING).
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Add new columns to the schools table (safe to re-run)
ALTER TABLE schools ADD COLUMN IF NOT EXISTS logo_url        TEXT;
ALTER TABLE schools ADD COLUMN IF NOT EXISTS name_hindi      TEXT;
ALTER TABLE schools ADD COLUMN IF NOT EXISTS tagline         TEXT;
ALTER TABLE schools ADD COLUMN IF NOT EXISTS principal_name  TEXT;
ALTER TABLE schools ADD COLUMN IF NOT EXISTS principal_mobile TEXT;

-- 2. Create the 'school-logos' storage bucket (public read, service-key write)
--    Run this in Supabase Dashboard → Storage → New bucket, OR via the API.
--    If already exists, this is a no-op.
INSERT INTO storage.buckets (id, name, public)
VALUES ('school-logos', 'school-logos', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Storage RLS policy — allow service role to upload
--    (The backend uses the service key so this policy is for completeness)
CREATE POLICY IF NOT EXISTS "service-role-upload"
ON storage.objects FOR INSERT
TO service_role
WITH CHECK (bucket_id = 'school-logos');

-- 4. Storage RLS policy — allow public read
CREATE POLICY IF NOT EXISTS "public-read"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (bucket_id = 'school-logos');
