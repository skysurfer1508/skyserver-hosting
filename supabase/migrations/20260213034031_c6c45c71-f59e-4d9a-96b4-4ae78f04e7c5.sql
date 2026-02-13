ALTER TYPE public.game_type ADD VALUE IF NOT EXISTS 'rust';

INSERT INTO public.game_limits (game_name, max_slots, is_active)
VALUES ('rust', 10, true)
ON CONFLICT DO NOTHING;