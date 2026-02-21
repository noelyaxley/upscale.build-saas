-- Phase 1: Calculation accuracy foundation
-- Add target margin % for RLV calculation
ALTER TABLE feasibility_scenarios
  ADD COLUMN IF NOT EXISTS target_margin_pct numeric DEFAULT 20;

-- Add frequency for recurring holding costs (monthly, quarterly, etc.)
ALTER TABLE feasibility_line_items
  ADD COLUMN IF NOT EXISTS frequency text DEFAULT 'once';
