-- Add is_verified column to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_verified boolean NOT NULL DEFAULT false;

-- Update existing profiles based on current auth.users status
UPDATE public.profiles p
SET is_verified = (
  SELECT (u.email_confirmed_at IS NOT NULL)
  FROM auth.users u
  WHERE u.id = p.id
);

-- Create function to sync verification status from auth.users to profiles
CREATE OR REPLACE FUNCTION public.handle_verification_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Update the profiles table when email_confirmed_at changes
  UPDATE public.profiles
  SET is_verified = (NEW.email_confirmed_at IS NOT NULL),
      updated_at = now()
  WHERE id = NEW.id;
  
  RETURN NEW;
END;
$$;

-- Create trigger on auth.users to sync verification status
DROP TRIGGER IF EXISTS on_auth_user_verification_update ON auth.users;
CREATE TRIGGER on_auth_user_verification_update
  AFTER UPDATE OF email_confirmed_at ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_verification_update();

-- Update the handle_new_user function to set is_verified on insert
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    user_count INTEGER;
    user_full_name TEXT;
BEGIN
    -- Get full_name from user metadata if provided
    user_full_name := NEW.raw_user_meta_data->>'full_name';
    
    -- Create profile with is_verified based on email_confirmed_at
    INSERT INTO public.profiles (id, email, username, full_name, is_verified)
    VALUES (
      NEW.id, 
      NEW.email, 
      SPLIT_PART(NEW.email, '@', 1), 
      user_full_name,
      (NEW.email_confirmed_at IS NOT NULL)
    );
    
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
$$;