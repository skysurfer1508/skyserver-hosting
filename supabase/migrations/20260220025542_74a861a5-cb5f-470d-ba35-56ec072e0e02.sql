-- Change pterodactyl_server_id from integer to text to support formatted multi-server strings
ALTER TABLE public.server_requests 
ALTER COLUMN pterodactyl_server_id TYPE text 
USING pterodactyl_server_id::text;