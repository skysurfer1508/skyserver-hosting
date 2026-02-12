-- Add new enum values
ALTER TYPE public.game_type ADD VALUE IF NOT EXISTS 'cs2';
ALTER TYPE public.game_type ADD VALUE IF NOT EXISTS 'factorio';

-- Add game limit rows
INSERT INTO public.game_limits (game_name, max_slots, is_active)
VALUES ('cs2', 10, true), ('factorio', 10, true)
ON CONFLICT DO NOTHING;