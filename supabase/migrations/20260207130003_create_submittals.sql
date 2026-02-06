-- Phase 15: Submittals Module

-- Submittal status enum
CREATE TYPE submittal_status AS ENUM (
  'draft',
  'submitted',
  'under_review',
  'approved',
  'approved_as_noted',
  'revise_resubmit',
  'rejected'
);

-- Submittals table
CREATE TABLE submittals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  submittal_number INT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  spec_section TEXT,
  submittal_type TEXT NOT NULL,
  status submittal_status NOT NULL DEFAULT 'draft',
  revision INT NOT NULL DEFAULT 0,
  -- People
  submitted_by_company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
  assigned_reviewer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  -- Dates
  date_submitted DATE,
  date_required DATE,
  date_returned DATE,
  -- Review
  reviewer_notes TEXT,
  -- Audit
  created_by_user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Submittal comments table
CREATE TABLE submittal_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submittal_id UUID NOT NULL REFERENCES submittals(id) ON DELETE CASCADE,
  author_user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE submittals ENABLE ROW LEVEL SECURITY;
ALTER TABLE submittal_comments ENABLE ROW LEVEL SECURITY;

-- Submittals policies
CREATE POLICY "submittals_select" ON submittals FOR SELECT
  USING (org_id = get_user_org_id());

CREATE POLICY "submittals_insert" ON submittals FOR INSERT
  WITH CHECK (org_id = get_user_org_id());

CREATE POLICY "submittals_update" ON submittals FOR UPDATE
  USING (org_id = get_user_org_id());

CREATE POLICY "submittals_delete" ON submittals FOR DELETE
  USING (org_id = get_user_org_id());

-- Submittal comments policies (via submittal's org)
CREATE POLICY "submittal_comments_select" ON submittal_comments FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM submittals s
    WHERE s.id = submittal_comments.submittal_id
    AND s.org_id = get_user_org_id()
  ));

CREATE POLICY "submittal_comments_insert" ON submittal_comments FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM submittals s
    WHERE s.id = submittal_comments.submittal_id
    AND s.org_id = get_user_org_id()
  ));

CREATE POLICY "submittal_comments_update" ON submittal_comments FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM submittals s
    WHERE s.id = submittal_comments.submittal_id
    AND s.org_id = get_user_org_id()
  ));

CREATE POLICY "submittal_comments_delete" ON submittal_comments FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM submittals s
    WHERE s.id = submittal_comments.submittal_id
    AND s.org_id = get_user_org_id()
  ));

-- Auto-increment submittal number per project
CREATE OR REPLACE FUNCTION set_submittal_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.submittal_number IS NULL OR NEW.submittal_number = 0 THEN
    SELECT COALESCE(MAX(submittal_number), 0) + 1
    INTO NEW.submittal_number
    FROM submittals
    WHERE project_id = NEW.project_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_submittal_number
  BEFORE INSERT ON submittals
  FOR EACH ROW
  EXECUTE FUNCTION set_submittal_number();

-- Updated_at trigger
CREATE TRIGGER set_submittals_updated_at
  BEFORE UPDATE ON submittals
  FOR EACH ROW
  EXECUTE FUNCTION extensions.moddatetime(updated_at);

-- Indexes
CREATE INDEX idx_submittals_project ON submittals(project_id);
CREATE INDEX idx_submittals_status ON submittals(status);
CREATE INDEX idx_submittal_comments_submittal ON submittal_comments(submittal_id);
