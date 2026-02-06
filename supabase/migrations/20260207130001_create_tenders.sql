-- Phase 13: Contractor Tender

-- Tender status enum
CREATE TYPE tender_status AS ENUM (
  'draft',
  'open',
  'evaluation',
  'awarded',
  'cancelled'
);

-- Tenders table
CREATE TABLE tenders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  tender_number INT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  trade TEXT NOT NULL,
  -- Financials (in cents)
  estimated_value BIGINT DEFAULT 0,
  -- Timeline
  due_date DATE,
  -- Status
  status tender_status NOT NULL DEFAULT 'draft',
  -- Award tracking
  awarded_company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
  awarded_amount BIGINT,
  -- Notes
  notes TEXT,
  -- Audit
  created_by_user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tender submissions table
CREATE TABLE tender_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tender_id UUID NOT NULL REFERENCES tenders(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  -- Financials (in cents)
  amount BIGINT NOT NULL DEFAULT 0,
  notes TEXT,
  submitted_at TIMESTAMPTZ DEFAULT now(),
  is_awarded BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE tenders ENABLE ROW LEVEL SECURITY;
ALTER TABLE tender_submissions ENABLE ROW LEVEL SECURITY;

-- Tenders policies
CREATE POLICY "tenders_select" ON tenders FOR SELECT
  USING (org_id = get_user_org_id());

CREATE POLICY "tenders_insert" ON tenders FOR INSERT
  WITH CHECK (org_id = get_user_org_id());

CREATE POLICY "tenders_update" ON tenders FOR UPDATE
  USING (org_id = get_user_org_id());

CREATE POLICY "tenders_delete" ON tenders FOR DELETE
  USING (org_id = get_user_org_id());

-- Tender submissions policies (via tender's org)
CREATE POLICY "tender_submissions_select" ON tender_submissions FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM tenders t
    WHERE t.id = tender_submissions.tender_id
    AND t.org_id = get_user_org_id()
  ));

CREATE POLICY "tender_submissions_insert" ON tender_submissions FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM tenders t
    WHERE t.id = tender_submissions.tender_id
    AND t.org_id = get_user_org_id()
  ));

CREATE POLICY "tender_submissions_update" ON tender_submissions FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM tenders t
    WHERE t.id = tender_submissions.tender_id
    AND t.org_id = get_user_org_id()
  ));

CREATE POLICY "tender_submissions_delete" ON tender_submissions FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM tenders t
    WHERE t.id = tender_submissions.tender_id
    AND t.org_id = get_user_org_id()
  ));

-- Auto-increment tender number per project
CREATE OR REPLACE FUNCTION set_tender_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.tender_number IS NULL OR NEW.tender_number = 0 THEN
    SELECT COALESCE(MAX(tender_number), 0) + 1
    INTO NEW.tender_number
    FROM tenders
    WHERE project_id = NEW.project_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_tender_number
  BEFORE INSERT ON tenders
  FOR EACH ROW
  EXECUTE FUNCTION set_tender_number();

-- Updated_at triggers
CREATE TRIGGER set_tenders_updated_at
  BEFORE UPDATE ON tenders
  FOR EACH ROW
  EXECUTE FUNCTION extensions.moddatetime(updated_at);

CREATE TRIGGER set_tender_submissions_updated_at
  BEFORE UPDATE ON tender_submissions
  FOR EACH ROW
  EXECUTE FUNCTION extensions.moddatetime(updated_at);

-- Indexes
CREATE INDEX idx_tenders_project ON tenders(project_id);
CREATE INDEX idx_tenders_status ON tenders(status);
CREATE INDEX idx_tender_submissions_tender ON tender_submissions(tender_id);
