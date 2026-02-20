-- Add pterodactyl_server_id column to server_requests
ALTER TABLE public.server_requests
ADD COLUMN IF NOT EXISTS pterodactyl_server_id integer NULL;

-- Add 'suspended' to request_status enum
ALTER TYPE public.request_status ADD VALUE IF NOT EXISTS 'suspended';