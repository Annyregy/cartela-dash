ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS scheduled_for date;
UPDATE public.orders SET scheduled_for = (created_at AT TIME ZONE 'America/Sao_Paulo')::date WHERE scheduled_for IS NULL;