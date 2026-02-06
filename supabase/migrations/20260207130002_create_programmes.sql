-- Phase 14: Programmes (Gantt) Module

-- Programme tasks table
CREATE TABLE programme_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  progress INT NOT NULL DEFAULT 0,
  parent_id UUID REFERENCES programme_tasks(id) ON DELETE CASCADE,
  sort_order INT NOT NULL DEFAULT 0,
  notes TEXT,
  color TEXT,
  created_by_user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT programme_tasks_dates_check CHECK (end_date >= start_date),
  CONSTRAINT programme_tasks_progress_check CHECK (progress >= 0 AND progress <= 100)
);

-- Programme dependencies table
CREATE TABLE programme_dependencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  predecessor_id UUID NOT NULL REFERENCES programme_tasks(id) ON DELETE CASCADE,
  successor_id UUID NOT NULL REFERENCES programme_tasks(id) ON DELETE CASCADE,
  dependency_type TEXT NOT NULL DEFAULT 'finish_to_start',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT programme_deps_unique UNIQUE (predecessor_id, successor_id),
  CONSTRAINT programme_deps_no_self CHECK (predecessor_id != successor_id)
);

-- Enable RLS
ALTER TABLE programme_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE programme_dependencies ENABLE ROW LEVEL SECURITY;

-- Programme tasks policies (org-scoped)
CREATE POLICY "programme_tasks_select" ON programme_tasks FOR SELECT
  USING (org_id = get_user_org_id());

CREATE POLICY "programme_tasks_insert" ON programme_tasks FOR INSERT
  WITH CHECK (org_id = get_user_org_id());

CREATE POLICY "programme_tasks_update" ON programme_tasks FOR UPDATE
  USING (org_id = get_user_org_id());

CREATE POLICY "programme_tasks_delete" ON programme_tasks FOR DELETE
  USING (org_id = get_user_org_id());

-- Programme dependencies policies (via predecessor's org)
CREATE POLICY "programme_deps_select" ON programme_dependencies FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM programme_tasks t
    WHERE t.id = programme_dependencies.predecessor_id
    AND t.org_id = get_user_org_id()
  ));

CREATE POLICY "programme_deps_insert" ON programme_dependencies FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM programme_tasks t
    WHERE t.id = programme_dependencies.predecessor_id
    AND t.org_id = get_user_org_id()
  ));

CREATE POLICY "programme_deps_update" ON programme_dependencies FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM programme_tasks t
    WHERE t.id = programme_dependencies.predecessor_id
    AND t.org_id = get_user_org_id()
  ));

CREATE POLICY "programme_deps_delete" ON programme_dependencies FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM programme_tasks t
    WHERE t.id = programme_dependencies.predecessor_id
    AND t.org_id = get_user_org_id()
  ));

-- Updated_at trigger
CREATE TRIGGER set_programme_tasks_updated_at
  BEFORE UPDATE ON programme_tasks
  FOR EACH ROW
  EXECUTE FUNCTION extensions.moddatetime(updated_at);

-- Indexes
CREATE INDEX idx_programme_tasks_project ON programme_tasks(project_id);
CREATE INDEX idx_programme_tasks_parent ON programme_tasks(parent_id);
CREATE INDEX idx_programme_deps_predecessor ON programme_dependencies(predecessor_id);
CREATE INDEX idx_programme_deps_successor ON programme_dependencies(successor_id);
