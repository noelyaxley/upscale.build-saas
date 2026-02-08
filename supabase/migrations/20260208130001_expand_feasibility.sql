-- Expand Feasibility Module
-- Adds child tables for land lots, line items, sales units, debt facilities,
-- debt loans, and equity partners. Adds new columns to feasibility_scenarios.

-- 1a. ALTER feasibility_scenarios - add new columns
ALTER TABLE feasibility_scenarios
  ADD COLUMN IF NOT EXISTS development_type TEXT DEFAULT 'residential',
  ADD COLUMN IF NOT EXISTS project_length_months INT DEFAULT 24,
  ADD COLUMN IF NOT EXISTS project_lots INT DEFAULT 1,
  ADD COLUMN IF NOT EXISTS start_date DATE,
  ADD COLUMN IF NOT EXISTS state TEXT DEFAULT 'NSW';

-- 1b. feasibility_land_lots - multiple land parcels per scenario
CREATE TABLE feasibility_land_lots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scenario_id UUID NOT NULL REFERENCES feasibility_scenarios(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'Lot 1',
  land_size_m2 DECIMAL(12,2),
  address TEXT,
  suburb TEXT,
  state TEXT,
  postcode TEXT,
  entity_gst_registered BOOL DEFAULT false,
  land_purchase_gst_included BOOL DEFAULT false,
  margin_scheme_applied BOOL DEFAULT false,
  land_rate BIGINT DEFAULT 0,
  purchase_price BIGINT DEFAULT 0,
  deposit_amount BIGINT DEFAULT 0,
  deposit_pct DECIMAL(5,2) DEFAULT 10,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE feasibility_land_lots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "feasibility_land_lots_select" ON feasibility_land_lots FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM feasibility_scenarios s
    WHERE s.id = feasibility_land_lots.scenario_id
    AND s.org_id = get_user_org_id()
  ));

CREATE POLICY "feasibility_land_lots_insert" ON feasibility_land_lots FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM feasibility_scenarios s
    WHERE s.id = feasibility_land_lots.scenario_id
    AND s.org_id = get_user_org_id()
  ));

CREATE POLICY "feasibility_land_lots_update" ON feasibility_land_lots FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM feasibility_scenarios s
    WHERE s.id = feasibility_land_lots.scenario_id
    AND s.org_id = get_user_org_id()
  ));

CREATE POLICY "feasibility_land_lots_delete" ON feasibility_land_lots FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM feasibility_scenarios s
    WHERE s.id = feasibility_land_lots.scenario_id
    AND s.org_id = get_user_org_id()
  ));

CREATE TRIGGER set_feasibility_land_lots_updated_at
  BEFORE UPDATE ON feasibility_land_lots
  FOR EACH ROW
  EXECUTE FUNCTION extensions.moddatetime(updated_at);

CREATE INDEX idx_feasibility_land_lots_scenario ON feasibility_land_lots(scenario_id);

-- 1c. feasibility_line_items - shared table for ALL cost line items
CREATE TABLE feasibility_line_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scenario_id UUID NOT NULL REFERENCES feasibility_scenarios(id) ON DELETE CASCADE,
  section TEXT NOT NULL,
  tab_name TEXT NOT NULL DEFAULT 'Default',
  land_lot_id UUID REFERENCES feasibility_land_lots(id) ON DELETE CASCADE,
  parent_entity_id UUID,
  name TEXT NOT NULL DEFAULT 'New Item',
  quantity DECIMAL(12,4) DEFAULT 1,
  rate_type TEXT DEFAULT '$ Amount',
  rate BIGINT DEFAULT 0,
  gst_status TEXT DEFAULT 'exclusive',
  amount_ex_gst BIGINT DEFAULT 0,
  cashflow_start_month INT,
  cashflow_span_months INT DEFAULT 1,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE feasibility_line_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "feasibility_line_items_select" ON feasibility_line_items FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM feasibility_scenarios s
    WHERE s.id = feasibility_line_items.scenario_id
    AND s.org_id = get_user_org_id()
  ));

CREATE POLICY "feasibility_line_items_insert" ON feasibility_line_items FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM feasibility_scenarios s
    WHERE s.id = feasibility_line_items.scenario_id
    AND s.org_id = get_user_org_id()
  ));

CREATE POLICY "feasibility_line_items_update" ON feasibility_line_items FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM feasibility_scenarios s
    WHERE s.id = feasibility_line_items.scenario_id
    AND s.org_id = get_user_org_id()
  ));

CREATE POLICY "feasibility_line_items_delete" ON feasibility_line_items FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM feasibility_scenarios s
    WHERE s.id = feasibility_line_items.scenario_id
    AND s.org_id = get_user_org_id()
  ));

CREATE TRIGGER set_feasibility_line_items_updated_at
  BEFORE UPDATE ON feasibility_line_items
  FOR EACH ROW
  EXECUTE FUNCTION extensions.moddatetime(updated_at);

CREATE INDEX idx_feasibility_line_items_scenario ON feasibility_line_items(scenario_id);

-- 1d. feasibility_sales_units - revenue units
CREATE TABLE feasibility_sales_units (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scenario_id UUID NOT NULL REFERENCES feasibility_scenarios(id) ON DELETE CASCADE,
  tab_name TEXT NOT NULL DEFAULT 'Residential',
  name TEXT NOT NULL DEFAULT 'Unit 1',
  status TEXT DEFAULT 'unsold',
  bedrooms INT DEFAULT 0,
  bathrooms INT DEFAULT 0,
  car_spaces INT DEFAULT 0,
  area_m2 DECIMAL(12,2),
  sale_price BIGINT DEFAULT 0,
  gst_status TEXT DEFAULT 'exclusive',
  amount_ex_gst BIGINT DEFAULT 0,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE feasibility_sales_units ENABLE ROW LEVEL SECURITY;

CREATE POLICY "feasibility_sales_units_select" ON feasibility_sales_units FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM feasibility_scenarios s
    WHERE s.id = feasibility_sales_units.scenario_id
    AND s.org_id = get_user_org_id()
  ));

CREATE POLICY "feasibility_sales_units_insert" ON feasibility_sales_units FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM feasibility_scenarios s
    WHERE s.id = feasibility_sales_units.scenario_id
    AND s.org_id = get_user_org_id()
  ));

CREATE POLICY "feasibility_sales_units_update" ON feasibility_sales_units FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM feasibility_scenarios s
    WHERE s.id = feasibility_sales_units.scenario_id
    AND s.org_id = get_user_org_id()
  ));

CREATE POLICY "feasibility_sales_units_delete" ON feasibility_sales_units FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM feasibility_scenarios s
    WHERE s.id = feasibility_sales_units.scenario_id
    AND s.org_id = get_user_org_id()
  ));

CREATE TRIGGER set_feasibility_sales_units_updated_at
  BEFORE UPDATE ON feasibility_sales_units
  FOR EACH ROW
  EXECUTE FUNCTION extensions.moddatetime(updated_at);

CREATE INDEX idx_feasibility_sales_units_scenario ON feasibility_sales_units(scenario_id);

-- 1e. feasibility_debt_facilities
CREATE TABLE feasibility_debt_facilities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scenario_id UUID NOT NULL REFERENCES feasibility_scenarios(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'Senior Debt',
  priority TEXT DEFAULT 'senior',
  calculation_type TEXT DEFAULT 'manual',
  term_months INT DEFAULT 24,
  lvr_method TEXT DEFAULT 'tdc',
  lvr_pct DECIMAL(5,2) DEFAULT 65,
  interest_rate DECIMAL(5,4) DEFAULT 0,
  total_facility BIGINT DEFAULT 0,
  interest_provision BIGINT DEFAULT 0,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE feasibility_debt_facilities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "feasibility_debt_facilities_select" ON feasibility_debt_facilities FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM feasibility_scenarios s
    WHERE s.id = feasibility_debt_facilities.scenario_id
    AND s.org_id = get_user_org_id()
  ));

CREATE POLICY "feasibility_debt_facilities_insert" ON feasibility_debt_facilities FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM feasibility_scenarios s
    WHERE s.id = feasibility_debt_facilities.scenario_id
    AND s.org_id = get_user_org_id()
  ));

CREATE POLICY "feasibility_debt_facilities_update" ON feasibility_debt_facilities FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM feasibility_scenarios s
    WHERE s.id = feasibility_debt_facilities.scenario_id
    AND s.org_id = get_user_org_id()
  ));

CREATE POLICY "feasibility_debt_facilities_delete" ON feasibility_debt_facilities FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM feasibility_scenarios s
    WHERE s.id = feasibility_debt_facilities.scenario_id
    AND s.org_id = get_user_org_id()
  ));

CREATE TRIGGER set_feasibility_debt_facilities_updated_at
  BEFORE UPDATE ON feasibility_debt_facilities
  FOR EACH ROW
  EXECUTE FUNCTION extensions.moddatetime(updated_at);

CREATE INDEX idx_feasibility_debt_facilities_scenario ON feasibility_debt_facilities(scenario_id);

-- 1f. feasibility_debt_loans
CREATE TABLE feasibility_debt_loans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scenario_id UUID NOT NULL REFERENCES feasibility_scenarios(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'Land Loan',
  principal_amount BIGINT DEFAULT 0,
  interest_rate DECIMAL(5,4) DEFAULT 0,
  payment_period TEXT DEFAULT 'monthly',
  term_months INT DEFAULT 12,
  loan_type TEXT DEFAULT 'interest_only',
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE feasibility_debt_loans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "feasibility_debt_loans_select" ON feasibility_debt_loans FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM feasibility_scenarios s
    WHERE s.id = feasibility_debt_loans.scenario_id
    AND s.org_id = get_user_org_id()
  ));

CREATE POLICY "feasibility_debt_loans_insert" ON feasibility_debt_loans FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM feasibility_scenarios s
    WHERE s.id = feasibility_debt_loans.scenario_id
    AND s.org_id = get_user_org_id()
  ));

CREATE POLICY "feasibility_debt_loans_update" ON feasibility_debt_loans FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM feasibility_scenarios s
    WHERE s.id = feasibility_debt_loans.scenario_id
    AND s.org_id = get_user_org_id()
  ));

CREATE POLICY "feasibility_debt_loans_delete" ON feasibility_debt_loans FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM feasibility_scenarios s
    WHERE s.id = feasibility_debt_loans.scenario_id
    AND s.org_id = get_user_org_id()
  ));

CREATE TRIGGER set_feasibility_debt_loans_updated_at
  BEFORE UPDATE ON feasibility_debt_loans
  FOR EACH ROW
  EXECUTE FUNCTION extensions.moddatetime(updated_at);

CREATE INDEX idx_feasibility_debt_loans_scenario ON feasibility_debt_loans(scenario_id);

-- 1g. feasibility_equity_partners
CREATE TABLE feasibility_equity_partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scenario_id UUID NOT NULL REFERENCES feasibility_scenarios(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'Developer Equity',
  is_developer_equity BOOL DEFAULT false,
  distribution_type TEXT DEFAULT 'proportional',
  equity_amount BIGINT DEFAULT 0,
  return_percentage DECIMAL(5,2) DEFAULT 0,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE feasibility_equity_partners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "feasibility_equity_partners_select" ON feasibility_equity_partners FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM feasibility_scenarios s
    WHERE s.id = feasibility_equity_partners.scenario_id
    AND s.org_id = get_user_org_id()
  ));

CREATE POLICY "feasibility_equity_partners_insert" ON feasibility_equity_partners FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM feasibility_scenarios s
    WHERE s.id = feasibility_equity_partners.scenario_id
    AND s.org_id = get_user_org_id()
  ));

CREATE POLICY "feasibility_equity_partners_update" ON feasibility_equity_partners FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM feasibility_scenarios s
    WHERE s.id = feasibility_equity_partners.scenario_id
    AND s.org_id = get_user_org_id()
  ));

CREATE POLICY "feasibility_equity_partners_delete" ON feasibility_equity_partners FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM feasibility_scenarios s
    WHERE s.id = feasibility_equity_partners.scenario_id
    AND s.org_id = get_user_org_id()
  ));

CREATE TRIGGER set_feasibility_equity_partners_updated_at
  BEFORE UPDATE ON feasibility_equity_partners
  FOR EACH ROW
  EXECUTE FUNCTION extensions.moddatetime(updated_at);

CREATE INDEX idx_feasibility_equity_partners_scenario ON feasibility_equity_partners(scenario_id);
