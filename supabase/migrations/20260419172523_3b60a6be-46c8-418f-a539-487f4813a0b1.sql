ALTER TABLE public.visitors REPLICA IDENTITY FULL;
ALTER TABLE public.visitor_commands REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.visitors;
ALTER PUBLICATION supabase_realtime ADD TABLE public.visitor_commands;