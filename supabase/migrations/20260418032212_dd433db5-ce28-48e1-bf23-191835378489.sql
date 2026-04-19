ALTER TABLE public.cities ADD COLUMN IF NOT EXISTS country text NOT NULL DEFAULT 'الأردن';
CREATE INDEX IF NOT EXISTS idx_cities_country ON public.cities(country);