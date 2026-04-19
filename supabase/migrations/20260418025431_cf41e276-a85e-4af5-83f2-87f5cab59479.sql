-- Roles enum + user_roles table
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE POLICY "Users can view own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins manage roles"
  ON public.user_roles FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Cities table
CREATE TABLE public.cities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  lat double precision NOT NULL,
  lng double precision NOT NULL,
  speed text NOT NULL,
  status text NOT NULL DEFAULT 'متوفر',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.cities ENABLE ROW LEVEL SECURITY;

-- Public can read (coverage map is public)
CREATE POLICY "Cities readable by everyone"
  ON public.cities FOR SELECT
  USING (true);

CREATE POLICY "Admins insert cities"
  ON public.cities FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins update cities"
  ON public.cities FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins delete cities"
  ON public.cities FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- Status validation trigger (avoids CHECK constraint immutability issues if we evolve it)
CREATE OR REPLACE FUNCTION public.validate_city_status()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.status NOT IN ('متوفر', 'قريباً') THEN
    RAISE EXCEPTION 'Invalid status: %', NEW.status;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER cities_validate_status
  BEFORE INSERT OR UPDATE ON public.cities
  FOR EACH ROW EXECUTE FUNCTION public.validate_city_status();

CREATE TRIGGER cities_set_updated_at
  BEFORE UPDATE ON public.cities
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed initial cities
INSERT INTO public.cities (name, lat, lng, speed, status, sort_order) VALUES
  ('عمّان', 31.9539, 35.9106, '150-250 ميغابت/ث', 'متوفر', 1),
  ('إربد', 32.5556, 35.8500, '120-200 ميغابت/ث', 'متوفر', 2),
  ('الزرقاء', 32.0728, 36.0876, '130-220 ميغابت/ث', 'متوفر', 3),
  ('العقبة', 29.5320, 35.0063, '100-180 ميغابت/ث', 'متوفر', 4),
  ('الكرك', 31.1854, 35.7047, '90-160 ميغابت/ث', 'متوفر', 5),
  ('معان', 30.1962, 35.7340, '80-150 ميغابت/ث', 'متوفر', 6),
  ('وادي رم', 29.5733, 35.4206, '70-140 ميغابت/ث', 'متوفر', 7),
  ('البتراء', 30.3285, 35.4444, '85-150 ميغابت/ث', 'متوفر', 8),
  ('السلط', 32.0392, 35.7272, '120-200 ميغابت/ث', 'متوفر', 9),
  ('المفرق', 32.3437, 36.2080, '90-160 ميغابت/ث', 'متوفر', 10),
  ('الطفيلة', 30.8372, 35.6045, '85-150 ميغابت/ث', 'متوفر', 11),
  ('جرش', 32.2722, 35.8911, '100-180 ميغابت/ث', 'متوفر', 12),
  ('عجلون', 32.3326, 35.7517, '90-160 ميغابت/ث', 'متوفر', 13),
  ('مادبا', 31.7167, 35.7950, '110-180 ميغابت/ث', 'متوفر', 14);