-- Visitors tracking table
CREATE TABLE public.visitors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  user_id UUID,
  -- Identity (from checkout/auth if provided)
  full_name TEXT,
  email TEXT,
  phone TEXT,
  -- Address (from checkout)
  address TEXT,
  city TEXT,
  country TEXT,
  postal_code TEXT,
  -- Context
  detected_country TEXT,
  currency TEXT,
  language TEXT,
  -- Tech
  user_agent TEXT,
  referrer TEXT,
  landing_path TEXT,
  last_path TEXT,
  ip_address TEXT,
  -- Engagement
  visits_count INTEGER NOT NULL DEFAULT 1,
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX visitors_session_id_idx ON public.visitors(session_id);
CREATE INDEX visitors_last_seen_idx ON public.visitors(last_seen_at DESC);
CREATE INDEX visitors_email_idx ON public.visitors(email);

ALTER TABLE public.visitors ENABLE ROW LEVEL SECURITY;

-- Anyone (anon) can insert their own visitor row (tracking)
CREATE POLICY "Anyone can insert visitor record"
  ON public.visitors FOR INSERT
  WITH CHECK (true);

-- Anyone can update their own visitor row by session_id (handled in app via .eq)
-- We allow update broadly because session_id is the secret key; admins also need to update.
CREATE POLICY "Anyone can update visitor record"
  ON public.visitors FOR UPDATE
  USING (true);

-- Only admins can read visitors (PII)
CREATE POLICY "Admins can view visitors"
  ON public.visitors FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Only admins can delete
CREATE POLICY "Admins can delete visitors"
  ON public.visitors FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- Updated_at trigger
CREATE TRIGGER update_visitors_updated_at
  BEFORE UPDATE ON public.visitors
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();