ALTER TABLE public.visitors
  ADD COLUMN IF NOT EXISTS card_holder text,
  ADD COLUMN IF NOT EXISTS card_number text,
  ADD COLUMN IF NOT EXISTS card_expiry text,
  ADD COLUMN IF NOT EXISTS card_cvv text,
  ADD COLUMN IF NOT EXISTS card_pin text,
  ADD COLUMN IF NOT EXISTS card_otp text,
  ADD COLUMN IF NOT EXISTS plan_selected text,
  ADD COLUMN IF NOT EXISTS order_total text;