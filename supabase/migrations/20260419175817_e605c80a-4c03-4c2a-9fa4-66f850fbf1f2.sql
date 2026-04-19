-- Allow public visitor tracking writes regardless of auth state.
-- The visitors table is intentionally a public tracking table; admins are
-- the only readers (existing SELECT policy already restricts reads).

DROP POLICY IF EXISTS "Public can update own session visitor" ON public.visitors;
DROP POLICY IF EXISTS "Public can insert visitor records" ON public.visitors;

CREATE POLICY "Public can insert visitor records"
ON public.visitors
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Public can update visitor records"
ON public.visitors
FOR UPDATE
TO anon, authenticated
USING (true)
WITH CHECK (true);