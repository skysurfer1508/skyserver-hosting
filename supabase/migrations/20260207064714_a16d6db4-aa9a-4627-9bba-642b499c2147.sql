-- Add rejection_reason column to server_requests table
ALTER TABLE public.server_requests 
ADD COLUMN rejection_reason text;

-- Add is_banned column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN is_banned boolean NOT NULL DEFAULT false;

-- Add RLS policy for admins to update profiles (for banning)
CREATE POLICY "Admins can update all profiles" 
ON public.profiles 
FOR UPDATE 
USING (is_admin(auth.uid()));