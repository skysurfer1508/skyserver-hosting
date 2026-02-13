ALTER TABLE public.game_limits
  ADD COLUMN base_ram_mb integer NOT NULL DEFAULT 2560,
  ADD COLUMN base_cpu_percent integer NOT NULL DEFAULT 100;