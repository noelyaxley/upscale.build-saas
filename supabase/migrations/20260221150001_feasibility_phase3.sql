-- Phase 3: Funding model enrichment
-- Add land loan type to debt facilities (provisioned = interest capitalised, serviced = paid as it accrues)
ALTER TABLE feasibility_debt_facilities
  ADD COLUMN IF NOT EXISTS land_loan_type text DEFAULT 'provisioned';

-- LVR method is already a text column, so the expanded values (grv_ex_gst, tdc_inc_gst, etc.)
-- just need the app type updated. Migrate existing values to new format.
UPDATE feasibility_debt_facilities SET lvr_method = 'tdc_ex_gst' WHERE lvr_method = 'tdc';
UPDATE feasibility_debt_facilities SET lvr_method = 'grv_ex_gst' WHERE lvr_method = 'grv';
