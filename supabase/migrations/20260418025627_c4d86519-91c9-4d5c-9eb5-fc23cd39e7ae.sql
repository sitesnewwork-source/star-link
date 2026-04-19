ALTER TABLE public.cities
  ADD COLUMN services text[] NOT NULL DEFAULT ARRAY['residential','roam','business']::text[];

UPDATE public.cities SET services = ARRAY['residential','roam','business']::text[];

CREATE OR REPLACE FUNCTION public.validate_city_services()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE s text;
BEGIN
  IF array_length(NEW.services, 1) IS NULL OR array_length(NEW.services, 1) = 0 THEN
    RAISE EXCEPTION 'At least one service is required';
  END IF;
  FOREACH s IN ARRAY NEW.services LOOP
    IF s NOT IN ('residential','roam','business') THEN
      RAISE EXCEPTION 'Invalid service: %', s;
    END IF;
  END LOOP;
  RETURN NEW;
END;
$$;

CREATE TRIGGER cities_validate_services
  BEFORE INSERT OR UPDATE ON public.cities
  FOR EACH ROW EXECUTE FUNCTION public.validate_city_services();