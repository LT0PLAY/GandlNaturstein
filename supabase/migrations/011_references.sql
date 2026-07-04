-- Migration 011: Referenzen (Portfolio-Projekte)
-- Tabellenname: project_references (references ist SQL-Keyword)
-- ============================================================

CREATE TABLE IF NOT EXISTS project_references (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug             text UNIQUE NOT NULL,
  title            text NOT NULL,
  subtitle         text,
  category_tags    text[]        DEFAULT '{}',
  year             int,
  description      text,
  cover_image      text,
  images           text[]        DEFAULT '{}',
  product_id       uuid REFERENCES products(id) ON DELETE SET NULL,
  spec_material    text,
  spec_surface     text,
  spec_scope       text,
  spec_location    text,
  meta_title       text,
  meta_description text,
  is_published     boolean       NOT NULL DEFAULT false,
  sort_order       int           NOT NULL DEFAULT 0,
  created_at       timestamptz   NOT NULL DEFAULT now(),
  updated_at       timestamptz   NOT NULL DEFAULT now()
);

CREATE TRIGGER project_references_updated_at
  BEFORE UPDATE ON project_references
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX IF NOT EXISTS idx_project_references_slug       ON project_references(slug);
CREATE INDEX IF NOT EXISTS idx_project_references_published  ON project_references(is_published) WHERE is_published = true;
CREATE INDEX IF NOT EXISTS idx_project_references_sort_order ON project_references(sort_order);

ALTER TABLE project_references ENABLE ROW LEVEL SECURITY;

CREATE POLICY "project_references_public_read"
  ON project_references FOR SELECT
  USING (is_published = true);

CREATE POLICY "project_references_team_read"
  ON project_references FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "project_references_team_write"
  ON project_references FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE user_id = auth.uid()
        AND role IN ('admin', 'editor')
        AND is_active = true
    )
  );
