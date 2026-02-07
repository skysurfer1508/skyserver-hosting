-- Create system_announcements table
CREATE TABLE public.system_announcements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('update', 'maintenance', 'info')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.system_announcements ENABLE ROW LEVEL SECURITY;

-- Anyone can read announcements (public news)
CREATE POLICY "Anyone can read announcements"
ON public.system_announcements
FOR SELECT
USING (true);

-- Only admins can insert announcements
CREATE POLICY "Admins can insert announcements"
ON public.system_announcements
FOR INSERT
WITH CHECK (is_admin(auth.uid()));

-- Only admins can delete announcements
CREATE POLICY "Admins can delete announcements"
ON public.system_announcements
FOR DELETE
USING (is_admin(auth.uid()));

-- Only admins can update announcements
CREATE POLICY "Admins can update announcements"
ON public.system_announcements
FOR UPDATE
USING (is_admin(auth.uid()));