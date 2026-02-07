-- Dropbox Connections
-- Per-project Dropbox OAuth connections for live file browsing

CREATE TABLE dropbox_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  access_token_encrypted TEXT NOT NULL,
  refresh_token_encrypted TEXT NOT NULL,
  token_expires_at TIMESTAMPTZ NOT NULL,
  dropbox_account_id TEXT NOT NULL,
  dropbox_folder_id TEXT,
  dropbox_folder_path TEXT,
  connected_by_user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(project_id)
);

-- Enable RLS
ALTER TABLE dropbox_connections ENABLE ROW LEVEL SECURITY;

-- RLS policies (org-scoped)
CREATE POLICY "dropbox_connections_select" ON dropbox_connections FOR SELECT
  USING (org_id = get_user_org_id());

CREATE POLICY "dropbox_connections_insert" ON dropbox_connections FOR INSERT
  WITH CHECK (org_id = get_user_org_id());

CREATE POLICY "dropbox_connections_update" ON dropbox_connections FOR UPDATE
  USING (org_id = get_user_org_id());

CREATE POLICY "dropbox_connections_delete" ON dropbox_connections FOR DELETE
  USING (org_id = get_user_org_id());

-- Moddatetime trigger
CREATE TRIGGER set_dropbox_connections_updated_at
  BEFORE UPDATE ON dropbox_connections
  FOR EACH ROW
  EXECUTE FUNCTION extensions.moddatetime(updated_at);

-- Indexes
CREATE INDEX idx_dropbox_connections_project ON dropbox_connections(project_id);
