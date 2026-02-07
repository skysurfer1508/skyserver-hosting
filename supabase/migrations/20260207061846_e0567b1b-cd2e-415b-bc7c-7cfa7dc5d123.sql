-- Add new columns to server_requests
ALTER TABLE public.server_requests 
ADD COLUMN discord_username TEXT,
ADD COLUMN description TEXT,
ADD COLUMN server_config JSONB;

-- Make discord_username NOT NULL with a default for existing rows
UPDATE public.server_requests SET discord_username = 'unknown' WHERE discord_username IS NULL;
ALTER TABLE public.server_requests ALTER COLUMN discord_username SET NOT NULL;

-- Create unique partial index for one-server policy
CREATE UNIQUE INDEX one_active_request_per_user 
ON public.server_requests (user_id) 
WHERE status IN ('pending', 'active');

-- Update game_type enum (remove valheim and ark)
-- Create new enum
CREATE TYPE public.game_type_new AS ENUM ('minecraft', 'terraria', 'satisfactory');

-- Update existing rows (change valheim/ark to minecraft as fallback)
UPDATE public.server_requests 
SET game_type = 'minecraft' 
WHERE game_type::text IN ('valheim', 'ark');

-- Alter column to use new enum
ALTER TABLE public.server_requests 
ALTER COLUMN game_type TYPE public.game_type_new 
USING (game_type::text::public.game_type_new);

-- Drop old enum and rename new
DROP TYPE public.game_type;
ALTER TYPE public.game_type_new RENAME TO game_type;