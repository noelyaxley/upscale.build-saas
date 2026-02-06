-- Client Portal Links
-- Token-based shareable links for external client read-only access

CREATE TABLE client_portal_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  token UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
  name TEXT NOT NULL DEFAULT 'Client Access',
  is_active BOOLEAN NOT NULL DEFAULT true,
  expires_at TIMESTAMPTZ,
  created_by_user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE client_portal_links ENABLE ROW LEVEL SECURITY;

-- RLS policies (org-scoped for internal management)
CREATE POLICY "client_portal_links_select" ON client_portal_links FOR SELECT
  USING (org_id = get_user_org_id());

CREATE POLICY "client_portal_links_insert" ON client_portal_links FOR INSERT
  WITH CHECK (org_id = get_user_org_id());

CREATE POLICY "client_portal_links_update" ON client_portal_links FOR UPDATE
  USING (org_id = get_user_org_id());

CREATE POLICY "client_portal_links_delete" ON client_portal_links FOR DELETE
  USING (org_id = get_user_org_id());

-- Moddatetime trigger
CREATE TRIGGER set_client_portal_links_updated_at
  BEFORE UPDATE ON client_portal_links
  FOR EACH ROW
  EXECUTE FUNCTION extensions.moddatetime(updated_at);

-- Indexes
CREATE INDEX idx_client_portal_links_token ON client_portal_links(token);
CREATE INDEX idx_client_portal_links_project ON client_portal_links(project_id);
