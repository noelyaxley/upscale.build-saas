-- Phase 12: Consultants / Procurement

-- Consultant status enum
CREATE TYPE consultant_status AS ENUM (
  'draft',
  'engaged',
  'completed',
  'terminated'
);

-- Consultant phase status enum
CREATE TYPE phase_status AS ENUM (
  'pending',
  'in_progress',
  'completed'
);

-- Consultants table
CREATE TABLE consultants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  consultant_number INT NOT NULL,
  company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
  discipline TEXT NOT NULL,
  contract_ref TEXT,
  status consultant_status NOT NULL DEFAULT 'draft',
  -- Financials (in cents)
  budget BIGINT DEFAULT 0,
  contract_value BIGINT DEFAULT 0,
  notes TEXT,
  -- Audit
  created_by_user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Consultant phases table
CREATE TABLE consultant_phases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  consultant_id UUID NOT NULL REFERENCES consultants(id) ON DELETE CASCADE,
  phase_name TEXT NOT NULL,
  -- Financials (in cents)
  fee BIGINT NOT NULL DEFAULT 0,
  variations BIGINT NOT NULL DEFAULT 0,
  disbursements BIGINT NOT NULL DEFAULT 0,
  amount_paid BIGINT NOT NULL DEFAULT 0,
  sort_order INT DEFAULT 0,
  status phase_status NOT NULL DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE consultants ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultant_phases ENABLE ROW LEVEL SECURITY;

-- Consultants policies
CREATE POLICY "consultants_select" ON consultants FOR SELECT
  USING (org_id = get_user_org_id());

CREATE POLICY "consultants_insert" ON consultants FOR INSERT
  WITH CHECK (org_id = get_user_org_id());

CREATE POLICY "consultants_update" ON consultants FOR UPDATE
  USING (org_id = get_user_org_id());

CREATE POLICY "consultants_delete" ON consultants FOR DELETE
  USING (org_id = get_user_org_id());

-- Consultant phases policies (via consultant's org)
CREATE POLICY "consultant_phases_select" ON consultant_phases FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM consultants c
    WHERE c.id = consultant_phases.consultant_id
    AND c.org_id = get_user_org_id()
  ));

CREATE POLICY "consultant_phases_insert" ON consultant_phases FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM consultants c
    WHERE c.id = consultant_phases.consultant_id
    AND c.org_id = get_user_org_id()
  ));

CREATE POLICY "consultant_phases_update" ON consultant_phases FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM consultants c
    WHERE c.id = consultant_phases.consultant_id
    AND c.org_id = get_user_org_id()
  ));

CREATE POLICY "consultant_phases_delete" ON consultant_phases FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM consultants c
    WHERE c.id = consultant_phases.consultant_id
    AND c.org_id = get_user_org_id()
  ));

-- Auto-increment consultant number per project
CREATE OR REPLACE FUNCTION set_consultant_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.consultant_number IS NULL OR NEW.consultant_number = 0 THEN
    SELECT COALESCE(MAX(consultant_number), 0) + 1
    INTO NEW.consultant_number
    FROM consultants
    WHERE project_id = NEW.project_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_consultant_number
  BEFORE INSERT ON consultants
  FOR EACH ROW
  EXECUTE FUNCTION set_consultant_number();

-- Updated_at triggers
CREATE TRIGGER set_consultants_updated_at
  BEFORE UPDATE ON consultants
  FOR EACH ROW
  EXECUTE FUNCTION extensions.moddatetime(updated_at);

CREATE TRIGGER set_consultant_phases_updated_at
  BEFORE UPDATE ON consultant_phases
  FOR EACH ROW
  EXECUTE FUNCTION extensions.moddatetime(updated_at);

-- Indexes
CREATE INDEX idx_consultants_project ON consultants(project_id);
CREATE INDEX idx_consultants_status ON consultants(status);
CREATE INDEX idx_consultant_phases_consultant ON consultant_phases(consultant_id);
