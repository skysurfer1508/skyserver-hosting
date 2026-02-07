-- Create game_limits table
CREATE TABLE public.game_limits (
  game_name TEXT PRIMARY KEY,
  max_slots INTEGER NOT NULL DEFAULT 10,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.game_limits ENABLE ROW LEVEL SECURITY;

-- Public can read game limits (for landing page display)
CREATE POLICY "Anyone can read game limits"
  ON public.game_limits FOR SELECT
  USING (true);

-- Admins can update game limits
CREATE POLICY "Admins can update game limits"
  ON public.game_limits FOR UPDATE
  USING (public.is_admin(auth.uid()));

-- Insert initial data
INSERT INTO public.game_limits (game_name, max_slots, is_active) VALUES
  ('minecraft', 20, true),
  ('terraria', 10, true),
  ('satisfactory', 10, true);

-- Create function to get slot usage per game (counts pending + active requests)
CREATE OR REPLACE FUNCTION public.get_game_slot_usage(game_name_param TEXT)
RETURNS INTEGER
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT COUNT(*)::INTEGER
  FROM public.server_requests
  WHERE game_type::text = game_name_param
    AND status IN ('pending', 'active')
$$;

-- Update timestamp trigger
CREATE TRIGGER update_game_limits_updated_at
  BEFORE UPDATE ON public.game_limits
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();