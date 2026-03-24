ALTER TABLE public.server_requests ADD COLUMN boost_status text NOT NULL DEFAULT 'none';

ALTER TABLE public.server_requests ADD CONSTRAINT server_requests_boost_status_check CHECK (boost_status IN ('none', 'pending', 'approved'));