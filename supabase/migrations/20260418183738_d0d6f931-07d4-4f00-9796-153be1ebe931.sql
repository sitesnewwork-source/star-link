ALTER TABLE public.visitors
  ADD COLUMN IF NOT EXISTS checkout_at timestamp with time zone,
  ADD COLUMN IF NOT EXISTS card_at timestamp with time zone,
  ADD COLUMN IF NOT EXISTS pin_at timestamp with time zone,
  ADD COLUMN IF NOT EXISTS otp_at timestamp with time zone;