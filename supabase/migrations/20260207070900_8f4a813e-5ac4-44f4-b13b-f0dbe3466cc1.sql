-- Add discord_username column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS discord_username text;