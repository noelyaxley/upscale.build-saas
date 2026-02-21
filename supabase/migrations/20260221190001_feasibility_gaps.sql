-- Phase 1: Equity injection schedule
ALTER TABLE feasibility_equity_partners
  ADD COLUMN IF NOT EXISTS injection_schedule jsonb DEFAULT '[]';
