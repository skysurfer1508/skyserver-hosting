-- Add full_name column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS full_name text;

-- Update the handle_new_user function to accept full_name from metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
    user_count INTEGER;
    user_full_name TEXT;
BEGIN
    -- Get full_name from user metadata if provided
    user_full_name := NEW.raw_user_meta_data->>'full_name';
    
    -- Create profile
    INSERT INTO public.profiles (id, email, username, full_name)
    VALUES (NEW.id, NEW.email, SPLIT_PART(NEW.email, '@', 1), user_full_name);
    
    -- Count existing users to determine if this is the first user
    SELECT COUNT(*) INTO user_count FROM public.profiles;
    
    -- If this is the first user, make them admin
    IF user_count = 1 THEN
        INSERT INTO public.user_roles (user_id, role)
        VALUES (NEW.id, 'admin');
    ELSE
        -- Otherwise, assign regular user role
        INSERT INTO public.user_roles (user_id, role)
        VALUES (NEW.id, 'user');
    END IF;
    
    RETURN NEW;
END;
$function$;