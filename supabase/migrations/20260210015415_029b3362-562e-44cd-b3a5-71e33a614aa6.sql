
-- Add boost columns to server_requests
ALTER TABLE public.server_requests
  ADD COLUMN cpu_boost integer NOT NULL DEFAULT 0,
  ADD COLUMN ram_boost integer NOT NULL DEFAULT 0,
  ADD COLUMN stripe_subscription_id text;

-- Add stripe_customer_id to profiles
ALTER TABLE public.profiles
  ADD COLUMN stripe_customer_id text UNIQUE;
