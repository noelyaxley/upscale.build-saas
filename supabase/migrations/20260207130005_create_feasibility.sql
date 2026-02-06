-- Feasibility Scenarios
-- Development appraisal calculator with save/load scenarios

CREATE TABLE feasibility_scenarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  -- Site
  site_area DECIMAL(12,2),
  fsr DECIMAL(5,2),
  max_height DECIMAL(8,2),
  zoning TEXT,
  -- Calculated areas
  gfa DECIMAL(12,2),
  nsa DECIMAL(12,2),
  efficiency DECIMAL(5,2) DEFAULT 80,
  -- Revenue (cents)
  sale_rate BIGINT DEFAULT 0,
  total_revenue BIGINT DEFAULT 0,
  -- Costs (cents)
  site_cost BIGINT DEFAULT 0,
  construction_cost BIGINT DEFAULT 0,
  professional_fees BIGINT DEFAULT 0,
  statutory_fees BIGINT DEFAULT 0,
  finance_costs BIGINT DEFAULT 0,
  marketing_costs BIGINT DEFAULT 0,
  contingency BIGINT DEFAULT 0,
  total_costs BIGINT DEFAULT 0,
  -- Output
  profit BIGINT DEFAULT 0,
  profit_on_cost DECIMAL(8,2) DEFAULT 0,
  notes TEXT,
  created_by_user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE feasibility_scenarios ENABLE ROW LEVEL SECURITY;

-- RLS policies (org-scoped)
CREATE POLICY "feasibility_scenarios_select" ON feasibility_scenarios FOR SELECT
  USING (org_id = get_user_org_id());

CREATE POLICY "feasibility_scenarios_insert" ON feasibility_scenarios FOR INSERT
  WITH CHECK (org_id = get_user_org_id());

CREATE POLICY "feasibility_scenarios_update" ON feasibility_scenarios FOR UPDATE
  USING (org_id = get_user_org_id());

CREATE POLICY "feasibility_scenarios_delete" ON feasibility_scenarios FOR DELETE
  USING (org_id = get_user_org_id());

-- Moddatetime trigger
CREATE TRIGGER set_feasibility_scenarios_updated_at
  BEFORE UPDATE ON feasibility_scenarios
  FOR EACH ROW
  EXECUTE FUNCTION extensions.moddatetime(updated_at);

-- Index
CREATE INDEX idx_feasibility_scenarios_project ON feasibility_scenarios(project_id);
