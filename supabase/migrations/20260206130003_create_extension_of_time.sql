-- Phase 11: Extension of Time (EOT)

-- EOT status enum
CREATE TYPE eot_status AS ENUM (
  'draft',
  'submitted',
  'under_review',
  'approved',
  'rejected',
  'withdrawn'
);

-- Extension of Time table
CREATE TABLE extension_of_time (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  eot_number INT NOT NULL DEFAULT 1,
  title TEXT NOT NULL,
  description TEXT,
  reason TEXT,
  -- Time impact
  days_claimed INT NOT NULL DEFAULT 0,
  days_approved INT,
  -- Dates
  delay_start_date DATE,
  delay_end_date DATE,
  original_completion_date DATE,
  new_completion_date DATE,
  -- Status workflow
  status eot_status NOT NULL DEFAULT 'draft',
  -- Submission details
  submitted_by_company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
  submitted_at TIMESTAMPTZ,
  -- Approval details
  approved_at TIMESTAMPTZ,
  approved_by_user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  rejection_reason TEXT,
  -- Supporting documents (array of URLs)
  attachments TEXT[],
  -- Audit
  created_by_user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- Unique EOT number per project
  UNIQUE(project_id, eot_number)
);

-- Enable RLS
ALTER TABLE extension_of_time ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "eot_select" ON extension_of_time FOR SELECT
  USING (org_id = get_user_org_id());

CREATE POLICY "eot_insert" ON extension_of_time FOR INSERT
  WITH CHECK (org_id = get_user_org_id());

CREATE POLICY "eot_update" ON extension_of_time FOR UPDATE
  USING (org_id = get_user_org_id());

CREATE POLICY "eot_delete" ON extension_of_time FOR DELETE
  USING (org_id = get_user_org_id());

-- Auto-increment EOT number per project
CREATE OR REPLACE FUNCTION set_eot_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.eot_number IS NULL OR NEW.eot_number = 1 THEN
    SELECT COALESCE(MAX(eot_number), 0) + 1
    INTO NEW.eot_number
    FROM extension_of_time
    WHERE project_id = NEW.project_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_eot_number
  BEFORE INSERT ON extension_of_time
  FOR EACH ROW
  EXECUTE FUNCTION set_eot_number();

-- Updated_at trigger
CREATE TRIGGER set_eot_updated_at
  BEFORE UPDATE ON extension_of_time
  FOR EACH ROW
  EXECUTE FUNCTION extensions.moddatetime(updated_at);

-- Indexes
CREATE INDEX idx_eot_project ON extension_of_time(project_id);
CREATE INDEX idx_eot_status ON extension_of_time(status);
CREATE INDEX idx_eot_org ON extension_of_time(org_id);
