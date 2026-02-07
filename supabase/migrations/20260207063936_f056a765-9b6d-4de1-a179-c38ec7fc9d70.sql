-- Add server credential columns to server_requests table
ALTER TABLE public.server_requests
ADD COLUMN assigned_ip text,
ADD COLUMN panel_url text,
ADD COLUMN panel_username text,
ADD COLUMN panel_password text;

-- Add comment for documentation
COMMENT ON COLUMN public.server_requests.assigned_ip IS 'The IP address and port of the assigned game server';
COMMENT ON COLUMN public.server_requests.panel_url IS 'URL to the server management panel';
COMMENT ON COLUMN public.server_requests.panel_username IS 'Login username for the panel';
COMMENT ON COLUMN public.server_requests.panel_password IS 'Initial password for the panel';