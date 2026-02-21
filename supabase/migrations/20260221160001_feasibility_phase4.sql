-- Phase 4: Financial settings for after-tax P&L
ALTER TABLE feasibility_scenarios
  ADD COLUMN IF NOT EXISTS tax_rate numeric DEFAULT 30,
  ADD COLUMN IF NOT EXISTS discount_rate numeric DEFAULT 10;
