-- Phase 7: Per-cost-item funding source assignment
ALTER TABLE feasibility_line_items
  ADD COLUMN IF NOT EXISTS funding_facility_id uuid REFERENCES feasibility_debt_facilities(id) ON DELETE SET NULL;
