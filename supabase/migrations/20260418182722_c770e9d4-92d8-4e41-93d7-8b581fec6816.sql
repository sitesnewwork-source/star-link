-- Visitor commands table for admin → visitor remote navigation
CREATE TABLE public.visitor_commands (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL,
  command text NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX idx_visitor_commands_session_created
  ON public.visitor_commands (session_id, created_at DESC);

ALTER TABLE public.visitor_commands ENABLE ROW LEVEL SECURITY;

-- Anyone (the visitor) can read commands targeted at their session
CREATE POLICY "Public can read visitor commands"
  ON public.visitor_commands
  FOR SELECT
  USING (true);

-- Only admins can issue commands
CREATE POLICY "Admins can insert visitor commands"
  ON public.visitor_commands
  FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete visitor commands"
  ON public.visitor_commands
  FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.visitor_commands;
ALTER TABLE public.visitor_commands REPLICA IDENTITY FULL;