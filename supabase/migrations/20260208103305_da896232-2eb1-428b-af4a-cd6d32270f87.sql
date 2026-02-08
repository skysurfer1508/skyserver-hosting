-- Create platform_settings table for admin availability
CREATE TABLE public.platform_settings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    is_admin_online boolean NOT NULL DEFAULT true,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Insert initial row
INSERT INTO public.platform_settings (is_admin_online) VALUES (true);

-- Enable RLS
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read platform settings
CREATE POLICY "Anyone can read platform settings"
ON public.platform_settings
FOR SELECT
USING (true);

-- Only admins can update platform settings
CREATE POLICY "Admins can update platform settings"
ON public.platform_settings
FOR UPDATE
USING (public.is_admin(auth.uid()));

-- Add trigger for updated_at
CREATE TRIGGER update_platform_settings_updated_at
BEFORE UPDATE ON public.platform_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();