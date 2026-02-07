-- Phase: Contracts & Progress Claims Redesign
-- Adds contracts per project, schedule of items, and line-item claiming

-- Contract status enum
CREATE TYPE contract_status AS ENUM (
  'draft',
  'active',
  'completed',
  'terminated'
);

-- Contracts table
CREATE TABLE contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  contract_number INT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  contract_value BIGINT NOT NULL DEFAULT 0,
  company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
  status contract_status NOT NULL DEFAULT 'draft',
  contract_ref TEXT,
  created_by_user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Contract items (schedule of items)
CREATE TABLE contract_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id UUID NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES contract_items(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  contract_value BIGINT NOT NULL DEFAULT 0,
  sort_order INT NOT NULL DEFAULT 0,
  variation_id UUID REFERENCES variations(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add contract_id to variations
ALTER TABLE variations ADD COLUMN contract_id UUID REFERENCES contracts(id) ON DELETE SET NULL;

-- Add contract_id to progress_claims
ALTER TABLE progress_claims ADD COLUMN contract_id UUID REFERENCES contracts(id) ON DELETE SET NULL;

-- Add contract_item_id and certified_this_claim to claim_line_items
ALTER TABLE claim_line_items ADD COLUMN contract_item_id UUID REFERENCES contract_items(id) ON DELETE SET NULL;
ALTER TABLE claim_line_items ADD COLUMN certified_this_claim BIGINT NOT NULL DEFAULT 0;

-- Enable RLS
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE contract_items ENABLE ROW LEVEL SECURITY;

-- Contracts policies
CREATE POLICY "contracts_select" ON contracts FOR SELECT
  USING (org_id = get_user_org_id());

CREATE POLICY "contracts_insert" ON contracts FOR INSERT
  WITH CHECK (org_id = get_user_org_id());

CREATE POLICY "contracts_update" ON contracts FOR UPDATE
  USING (org_id = get_user_org_id());

CREATE POLICY "contracts_delete" ON contracts FOR DELETE
  USING (org_id = get_user_org_id());

-- Contract items policies (via parent contract's org)
CREATE POLICY "contract_items_select" ON contract_items FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM contracts c
    WHERE c.id = contract_items.contract_id
    AND c.org_id = get_user_org_id()
  ));

CREATE POLICY "contract_items_insert" ON contract_items FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM contracts c
    WHERE c.id = contract_items.contract_id
    AND c.org_id = get_user_org_id()
  ));

CREATE POLICY "contract_items_update" ON contract_items FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM contracts c
    WHERE c.id = contract_items.contract_id
    AND c.org_id = get_user_org_id()
  ));

CREATE POLICY "contract_items_delete" ON contract_items FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM contracts c
    WHERE c.id = contract_items.contract_id
    AND c.org_id = get_user_org_id()
  ));

-- Auto-increment contract number per project
CREATE OR REPLACE FUNCTION set_contract_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.contract_number IS NULL OR NEW.contract_number = 0 THEN
    SELECT COALESCE(MAX(contract_number), 0) + 1
    INTO NEW.contract_number
    FROM contracts
    WHERE project_id = NEW.project_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_contract_number
  BEFORE INSERT ON contracts
  FOR EACH ROW
  EXECUTE FUNCTION set_contract_number();

-- Updated_at triggers
CREATE TRIGGER set_contracts_updated_at
  BEFORE UPDATE ON contracts
  FOR EACH ROW
  EXECUTE FUNCTION extensions.moddatetime(updated_at);

CREATE TRIGGER set_contract_items_updated_at
  BEFORE UPDATE ON contract_items
  FOR EACH ROW
  EXECUTE FUNCTION extensions.moddatetime(updated_at);

-- Indexes
CREATE INDEX idx_contracts_project ON contracts(project_id);
CREATE INDEX idx_contracts_status ON contracts(status);
CREATE INDEX idx_contract_items_contract ON contract_items(contract_id);
CREATE INDEX idx_contract_items_parent ON contract_items(parent_id);
CREATE INDEX idx_variations_contract ON variations(contract_id);
CREATE INDEX idx_claims_contract ON progress_claims(contract_id);
CREATE INDEX idx_claim_items_contract_item ON claim_line_items(contract_item_id);
