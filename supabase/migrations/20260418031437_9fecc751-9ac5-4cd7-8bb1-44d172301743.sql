ALTER TABLE public.cities REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.cities;