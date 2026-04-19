ALTER TABLE public.cities ADD COLUMN IF NOT EXISTS image_url text;

INSERT INTO storage.buckets (id, name, public)
VALUES ('city-images', 'city-images', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public can view city images"
ON storage.objects FOR SELECT
USING (bucket_id = 'city-images');

CREATE POLICY "Admins upload city images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'city-images' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins update city images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'city-images' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins delete city images"
ON storage.objects FOR DELETE
USING (bucket_id = 'city-images' AND public.has_role(auth.uid(), 'admin'));