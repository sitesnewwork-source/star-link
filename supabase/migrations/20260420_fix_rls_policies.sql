-- Drop existing policies if exist
DROP POLICY IF EXISTS "Allow anon insert" ON visitors;
DROP POLICY IF EXISTS "Allow anon update" ON visitors;
DROP POLICY IF EXISTS "Allow anon select" ON visitors;
DROP POLICY IF EXISTS "Allow service_role all" ON visitors;
DROP POLICY IF EXISTS "anon_insert" ON visitors;
DROP POLICY IF EXISTS "anon_update" ON visitors;
DROP POLICY IF EXISTS "anon_select" ON visitors;

-- Enable RLS on visitors
ALTER TABLE visitors ENABLE ROW LEVEL SECURITY;

-- Allow anon to insert visitors
CREATE POLICY "anon_insert" ON visitors FOR INSERT TO anon WITH CHECK (true);

-- Allow anon to update visitors
CREATE POLICY "anon_update" ON visitors FOR UPDATE TO anon USING (true) WITH CHECK (true);

-- Allow anon to select visitors
CREATE POLICY "anon_select" ON visitors FOR SELECT TO anon USING (true);

-- Allow authenticated (admin) full access
CREATE POLICY "auth_all" ON visitors FOR ALL TO authenticated USING (true) WITH CHECK (true);