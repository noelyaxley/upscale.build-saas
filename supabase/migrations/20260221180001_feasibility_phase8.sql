-- Phase 8: Sales enrichment & GST reporting

-- Sales unit detail fields: area breakdown + buyer info
ALTER TABLE feasibility_sales_units
  ADD COLUMN IF NOT EXISTS internal_area_m2 numeric,
  ADD COLUMN IF NOT EXISTS external_area_m2 numeric,
  ADD COLUMN IF NOT EXISTS storage_area_m2 numeric,
  ADD COLUMN IF NOT EXISTS buyer_name text,
  ADD COLUMN IF NOT EXISTS buyer_email text,
  ADD COLUMN IF NOT EXISTS buyer_phone text,
  ADD COLUMN IF NOT EXISTS buyer_solicitor text,
  ADD COLUMN IF NOT EXISTS contract_date date,
  ADD COLUMN IF NOT EXISTS sunset_date date,
  ADD COLUMN IF NOT EXISTS deposit_received bigint DEFAULT 0;

-- Land lot multi-payment schedule (JSON array of {name, amount, month})
ALTER TABLE feasibility_land_lots
  ADD COLUMN IF NOT EXISTS payment_schedule jsonb DEFAULT '[]'::jsonb;
