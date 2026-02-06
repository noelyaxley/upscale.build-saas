-- Phase 9: Variations & Progress Claims

-- Variation status enum
CREATE TYPE variation_status AS ENUM (
  'draft',
  'submitted',
  'under_review',
  'approved',
  'rejected',
  'cancelled'
);

-- Progress claim status enum
CREATE TYPE claim_status AS ENUM (
  'draft',
  'submitted',
  'certified',
  'paid',
  'disputed'
);

-- Variations (Change Orders) table
CREATE TABLE variations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  variation_number INT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  reason TEXT,
  status variation_status NOT NULL DEFAULT 'draft',
  -- Cost impact (in cents)
  cost_impact BIGINT DEFAULT 0,
  -- Time impact (in days)
  time_impact INT DEFAULT 0,
  -- Related company (contractor submitting or affected)
  submitted_by_company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
  -- Approval tracking
  submitted_at TIMESTAMPTZ,
  approved_at TIMESTAMPTZ,
  approved_by_user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  rejection_reason TEXT,
  -- Audit
  created_by_user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Progress Claims table
CREATE TABLE progress_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  claim_number INT NOT NULL,
  -- Claim period
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  -- Amounts (in cents)
  claimed_amount BIGINT NOT NULL DEFAULT 0,
  certified_amount BIGINT,
  previous_claims_total BIGINT NOT NULL DEFAULT 0,
  -- Status tracking
  status claim_status NOT NULL DEFAULT 'draft',
  submitted_at TIMESTAMPTZ,
  certified_at TIMESTAMPTZ,
  certified_by_user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  paid_at TIMESTAMPTZ,
  -- Notes
  notes TEXT,
  certification_notes TEXT,
  -- Submitted by company
  submitted_by_company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
  -- Audit
  created_by_user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Claim line items (breakdown of what's being claimed)
CREATE TABLE claim_line_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  claim_id UUID NOT NULL REFERENCES progress_claims(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  contract_value BIGINT NOT NULL DEFAULT 0,
  previous_claimed BIGINT NOT NULL DEFAULT 0,
  this_claim BIGINT NOT NULL DEFAULT 0,
  total_claimed BIGINT NOT NULL DEFAULT 0,
  percent_complete DECIMAL(5,2) DEFAULT 0,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE variations ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE claim_line_items ENABLE ROW LEVEL SECURITY;

-- Variations policies
CREATE POLICY "variations_select" ON variations FOR SELECT
  USING (org_id = get_user_org_id());

CREATE POLICY "variations_insert" ON variations FOR INSERT
  WITH CHECK (org_id = get_user_org_id());

CREATE POLICY "variations_update" ON variations FOR UPDATE
  USING (org_id = get_user_org_id());

CREATE POLICY "variations_delete" ON variations FOR DELETE
  USING (org_id = get_user_org_id());

-- Progress claims policies
CREATE POLICY "claims_select" ON progress_claims FOR SELECT
  USING (org_id = get_user_org_id());

CREATE POLICY "claims_insert" ON progress_claims FOR INSERT
  WITH CHECK (org_id = get_user_org_id());

CREATE POLICY "claims_update" ON progress_claims FOR UPDATE
  USING (org_id = get_user_org_id());

CREATE POLICY "claims_delete" ON progress_claims FOR DELETE
  USING (org_id = get_user_org_id());

-- Claim line items policies (via claim's org)
CREATE POLICY "claim_items_select" ON claim_line_items FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM progress_claims c
    WHERE c.id = claim_line_items.claim_id
    AND c.org_id = get_user_org_id()
  ));

CREATE POLICY "claim_items_insert" ON claim_line_items FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM progress_claims c
    WHERE c.id = claim_line_items.claim_id
    AND c.org_id = get_user_org_id()
  ));

CREATE POLICY "claim_items_update" ON claim_line_items FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM progress_claims c
    WHERE c.id = claim_line_items.claim_id
    AND c.org_id = get_user_org_id()
  ));

CREATE POLICY "claim_items_delete" ON claim_line_items FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM progress_claims c
    WHERE c.id = claim_line_items.claim_id
    AND c.org_id = get_user_org_id()
  ));

-- Auto-increment variation number per project
CREATE OR REPLACE FUNCTION set_variation_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.variation_number IS NULL OR NEW.variation_number = 0 THEN
    SELECT COALESCE(MAX(variation_number), 0) + 1
    INTO NEW.variation_number
    FROM variations
    WHERE project_id = NEW.project_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_variation_number
  BEFORE INSERT ON variations
  FOR EACH ROW
  EXECUTE FUNCTION set_variation_number();

-- Auto-increment claim number per project
CREATE OR REPLACE FUNCTION set_claim_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.claim_number IS NULL OR NEW.claim_number = 0 THEN
    SELECT COALESCE(MAX(claim_number), 0) + 1
    INTO NEW.claim_number
    FROM progress_claims
    WHERE project_id = NEW.project_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_claim_number
  BEFORE INSERT ON progress_claims
  FOR EACH ROW
  EXECUTE FUNCTION set_claim_number();

-- Updated_at triggers
CREATE TRIGGER set_variations_updated_at
  BEFORE UPDATE ON variations
  FOR EACH ROW
  EXECUTE FUNCTION extensions.moddatetime(updated_at);

CREATE TRIGGER set_claims_updated_at
  BEFORE UPDATE ON progress_claims
  FOR EACH ROW
  EXECUTE FUNCTION extensions.moddatetime(updated_at);

-- Indexes
CREATE INDEX idx_variations_project ON variations(project_id);
CREATE INDEX idx_variations_status ON variations(status);
CREATE INDEX idx_claims_project ON progress_claims(project_id);
CREATE INDEX idx_claims_status ON progress_claims(status);
CREATE INDEX idx_claim_items_claim ON claim_line_items(claim_id);
