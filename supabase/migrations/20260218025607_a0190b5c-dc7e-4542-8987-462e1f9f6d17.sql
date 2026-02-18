
CREATE TABLE public.panel_stats_cache (
  id integer PRIMARY KEY DEFAULT 1,
  total_servers integer NOT NULL DEFAULT 0,
  total_users integer NOT NULL DEFAULT 0,
  total_ram_mb bigint NOT NULL DEFAULT 0,
  nodes_online integer NOT NULL DEFAULT 0,
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Single-row constraint
ALTER TABLE public.panel_stats_cache ADD CONSTRAINT panel_stats_cache_single_row CHECK (id = 1);

-- Seed the row
INSERT INTO public.panel_stats_cache (id) VALUES (1);

-- Enable RLS
ALTER TABLE public.panel_stats_cache ENABLE ROW LEVEL SECURITY;

-- Public read only
CREATE POLICY "Anyone can read panel stats"
  ON public.panel_stats_cache
  FOR SELECT
  USING (true);
