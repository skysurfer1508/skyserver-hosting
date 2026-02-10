
-- Step 1: Change default duration from 15 days to 7 days
ALTER TABLE public.server_requests 
  ALTER COLUMN expires_at SET DEFAULT (now() + '7 days'::interval);

-- Step 2: Allow NULL values for expires_at (permanent servers)
ALTER TABLE public.server_requests 
  ALTER COLUMN expires_at DROP NOT NULL;

-- Step 3: Update renew_server_lease RPC to use 7 days
CREATE OR REPLACE FUNCTION public.renew_server_lease(request_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  updated_count integer;
BEGIN
  UPDATE public.server_requests
  SET expires_at = now() + interval '7 days',
      updated_at = now()
  WHERE id = request_id
    AND user_id = auth.uid()
    AND status = 'active'
    AND expires_at IS NOT NULL;
  
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  
  RETURN updated_count > 0;
END;
$function$;

-- Step 4: Admin function to toggle permanent server
CREATE OR REPLACE FUNCTION public.toggle_permanent_server(target_request_id uuid, make_permanent boolean)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  updated_count integer;
BEGIN
  -- Only admins can call this
  IF NOT public.is_admin(auth.uid()) THEN
    RETURN false;
  END IF;

  IF make_permanent THEN
    UPDATE public.server_requests
    SET expires_at = NULL,
        updated_at = now()
    WHERE id = target_request_id
      AND status = 'active';
  ELSE
    UPDATE public.server_requests
    SET expires_at = now() + interval '7 days',
        updated_at = now()
    WHERE id = target_request_id
      AND status = 'active';
  END IF;
  
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count > 0;
END;
$function$;
