-- Phase 10: Site Diary

-- Weather condition enum
CREATE TYPE weather_condition AS ENUM (
  'sunny',
  'partly_cloudy',
  'cloudy',
  'light_rain',
  'heavy_rain',
  'storm',
  'windy',
  'hot',
  'cold'
);

-- Site diary entries table
CREATE TABLE site_diary_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  entry_date DATE NOT NULL,
  -- Weather
  weather_condition weather_condition,
  temperature_high INT,
  temperature_low INT,
  weather_notes TEXT,
  -- Work summary
  work_summary TEXT,
  -- Safety
  safety_incidents INT DEFAULT 0,
  safety_notes TEXT,
  -- Delays
  delays_hours DECIMAL(5,2) DEFAULT 0,
  delay_reason TEXT,
  -- General notes
  notes TEXT,
  -- Photos (array of URLs)
  photos TEXT[],
  -- Audit
  created_by_user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- Unique constraint: one entry per project per date
  UNIQUE(project_id, entry_date)
);

-- Labor entries (workers on site)
CREATE TABLE diary_labor_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  diary_entry_id UUID NOT NULL REFERENCES site_diary_entries(id) ON DELETE CASCADE,
  company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
  trade TEXT NOT NULL,
  worker_count INT NOT NULL DEFAULT 0,
  hours_worked DECIMAL(5,2) NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Equipment entries (equipment on site)
CREATE TABLE diary_equipment_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  diary_entry_id UUID NOT NULL REFERENCES site_diary_entries(id) ON DELETE CASCADE,
  equipment_name TEXT NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  hours_used DECIMAL(5,2) DEFAULT 0,
  company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Visitor log
CREATE TABLE diary_visitors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  diary_entry_id UUID NOT NULL REFERENCES site_diary_entries(id) ON DELETE CASCADE,
  visitor_name TEXT NOT NULL,
  company TEXT,
  purpose TEXT,
  time_in TIME,
  time_out TIME,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE site_diary_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE diary_labor_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE diary_equipment_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE diary_visitors ENABLE ROW LEVEL SECURITY;

-- Site diary policies
CREATE POLICY "diary_select" ON site_diary_entries FOR SELECT
  USING (org_id = get_user_org_id());

CREATE POLICY "diary_insert" ON site_diary_entries FOR INSERT
  WITH CHECK (org_id = get_user_org_id());

CREATE POLICY "diary_update" ON site_diary_entries FOR UPDATE
  USING (org_id = get_user_org_id());

CREATE POLICY "diary_delete" ON site_diary_entries FOR DELETE
  USING (org_id = get_user_org_id());

-- Labor entries policies (via diary entry's org)
CREATE POLICY "labor_select" ON diary_labor_entries FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM site_diary_entries d
    WHERE d.id = diary_labor_entries.diary_entry_id
    AND d.org_id = get_user_org_id()
  ));

CREATE POLICY "labor_insert" ON diary_labor_entries FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM site_diary_entries d
    WHERE d.id = diary_labor_entries.diary_entry_id
    AND d.org_id = get_user_org_id()
  ));

CREATE POLICY "labor_update" ON diary_labor_entries FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM site_diary_entries d
    WHERE d.id = diary_labor_entries.diary_entry_id
    AND d.org_id = get_user_org_id()
  ));

CREATE POLICY "labor_delete" ON diary_labor_entries FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM site_diary_entries d
    WHERE d.id = diary_labor_entries.diary_entry_id
    AND d.org_id = get_user_org_id()
  ));

-- Equipment entries policies
CREATE POLICY "equipment_select" ON diary_equipment_entries FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM site_diary_entries d
    WHERE d.id = diary_equipment_entries.diary_entry_id
    AND d.org_id = get_user_org_id()
  ));

CREATE POLICY "equipment_insert" ON diary_equipment_entries FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM site_diary_entries d
    WHERE d.id = diary_equipment_entries.diary_entry_id
    AND d.org_id = get_user_org_id()
  ));

CREATE POLICY "equipment_update" ON diary_equipment_entries FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM site_diary_entries d
    WHERE d.id = diary_equipment_entries.diary_entry_id
    AND d.org_id = get_user_org_id()
  ));

CREATE POLICY "equipment_delete" ON diary_equipment_entries FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM site_diary_entries d
    WHERE d.id = diary_equipment_entries.diary_entry_id
    AND d.org_id = get_user_org_id()
  ));

-- Visitors policies
CREATE POLICY "visitors_select" ON diary_visitors FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM site_diary_entries d
    WHERE d.id = diary_visitors.diary_entry_id
    AND d.org_id = get_user_org_id()
  ));

CREATE POLICY "visitors_insert" ON diary_visitors FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM site_diary_entries d
    WHERE d.id = diary_visitors.diary_entry_id
    AND d.org_id = get_user_org_id()
  ));

CREATE POLICY "visitors_update" ON diary_visitors FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM site_diary_entries d
    WHERE d.id = diary_visitors.diary_entry_id
    AND d.org_id = get_user_org_id()
  ));

CREATE POLICY "visitors_delete" ON diary_visitors FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM site_diary_entries d
    WHERE d.id = diary_visitors.diary_entry_id
    AND d.org_id = get_user_org_id()
  ));

-- Updated_at trigger
CREATE TRIGGER set_diary_updated_at
  BEFORE UPDATE ON site_diary_entries
  FOR EACH ROW
  EXECUTE FUNCTION extensions.moddatetime(updated_at);

-- Indexes
CREATE INDEX idx_diary_project ON site_diary_entries(project_id);
CREATE INDEX idx_diary_date ON site_diary_entries(entry_date);
CREATE INDEX idx_diary_labor_entry ON diary_labor_entries(diary_entry_id);
CREATE INDEX idx_diary_equipment_entry ON diary_equipment_entries(diary_entry_id);
CREATE INDEX idx_diary_visitors_entry ON diary_visitors(diary_entry_id);
