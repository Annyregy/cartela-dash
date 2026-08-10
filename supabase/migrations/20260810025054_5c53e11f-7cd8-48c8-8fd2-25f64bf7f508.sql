ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS place text NOT NULL DEFAULT '';
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS map_address text NOT NULL DEFAULT '';