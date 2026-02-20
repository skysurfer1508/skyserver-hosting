-- Update get_game_slot_usage to include suspended in count
CREATE OR REPLACE FUNCTION public.get_game_slot_usage(game_name_param text)
 RETURNS integer
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT COUNT(*)::INTEGER
  FROM public.server_requests
  WHERE game_type::text = game_name_param
    AND status IN ('pending', 'active', 'suspended')
$function$;