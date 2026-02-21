-- Phase 2: Cashflow timing fields
-- Land lots: control when deposit and settlement costs hit the cashflow
ALTER TABLE feasibility_land_lots
  ADD COLUMN IF NOT EXISTS deposit_month integer DEFAULT 1,
  ADD COLUMN IF NOT EXISTS settlement_month integer DEFAULT 1;

-- Sales units: control when revenue hits the cashflow (instead of hardcoded last month)
ALTER TABLE feasibility_sales_units
  ADD COLUMN IF NOT EXISTS settlement_month integer;
