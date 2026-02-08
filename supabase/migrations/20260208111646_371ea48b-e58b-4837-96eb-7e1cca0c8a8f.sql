-- Add expires_at column to server_requests table
ALTER TABLE public.server_requests
ADD COLUMN expires_at timestamptz DEFAULT (now() + interval '15 days');

-- Backfill existing rows with expiration 15 days from now
UPDATE public.server_requests
SET expires_at = now() + interval '15 days'
WHERE expires_at IS NULL;

-- Make the column NOT NULL after backfill
ALTER TABLE public.server_requests
ALTER COLUMN expires_at SET NOT NULL;

-- Create RPC function to renew server lease
CREATE OR REPLACE FUNCTION public.renew_server_lease(request_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  updated_count integer;
BEGIN
  -- Update expires_at only for the user's own server request
  UPDATE public.server_requests
  SET expires_at = now() + interval '15 days',
      updated_at = now()
  WHERE id = request_id
    AND user_id = auth.uid()
    AND status = 'active';
  
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  
  -- Return true if a row was updated, false otherwise
  RETURN updated_count > 0;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.renew_server_lease(uuid) TO authenticated;