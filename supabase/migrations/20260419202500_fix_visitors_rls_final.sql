-- Fix visitors RLS: drop all old policies and recreate correctly
-- INSERT/UPDATE: open to anon + authenticated (no role restriction)
-- SELECT: admin-only
-- DELETE: admin-only

-- Drop ALL existing policies on visitors
DO $$
DECLARE
  pol record;
BEGIN
  FOR pol IN
    SELECT polname FROM pg_policy
    WHERE polrelid = 'public.visitors'::regclass
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.visitors', pol.polname);
  END LOOP;
END;
$$;

-- Ensure RLS is enabled
ALTER TABLE public.visitors ENABLE ROW LEVEL SECURITY;

-- Grant explicit privileges to anon and authenticated
GRANT INSERT,ON TABLE public.visitors TO anon;
GRANT UPDATE ON TABLE public.visitors TO anon;
GRANT INSERT,UPDATE ON TABLE public.visitors TO authenticated;
GRANT SELECT,DELETE ON TABLE public.visitors TO authenticated;

-- INSERT: open to everyone (no TO clause = applies to all roles)
CREATE POLICY "Anyone can insert visitor record"
  ON public.visitors
  FOR INSERT
  WITH CHECK (true);

-- UPDATE: open to everyone
CREATE POLICY "Anyone can update visitor record"
  ON public.visitors
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- SELECT: admin-only
CREATE POLICY "Admins can view visitors"
  ON public.visitors
  FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- DELETE: admin-only
CREATE POLICY "Admins can delete visitors"
  ON public.visitors
  FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));