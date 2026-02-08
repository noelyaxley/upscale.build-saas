-- Add name column to progress_claims
ALTER TABLE progress_claims ADD COLUMN name TEXT;

-- Create variation_comments table (mirrors submittal_comments pattern)
CREATE TABLE variation_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  variation_id UUID NOT NULL REFERENCES variations(id) ON DELETE CASCADE,
  author_user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE variation_comments ENABLE ROW LEVEL SECURITY;

-- RLS policies via parent variation's org_id
CREATE POLICY "variation_comments_select" ON variation_comments FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM variations v
    WHERE v.id = variation_comments.variation_id
    AND v.org_id = get_user_org_id()
  ));

CREATE POLICY "variation_comments_insert" ON variation_comments FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM variations v
    WHERE v.id = variation_comments.variation_id
    AND v.org_id = get_user_org_id()
  ));

CREATE POLICY "variation_comments_delete" ON variation_comments FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM variations v
    WHERE v.id = variation_comments.variation_id
    AND v.org_id = get_user_org_id()
  ));

CREATE INDEX idx_variation_comments_variation ON variation_comments(variation_id);
