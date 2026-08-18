-- Migration 017: Partner, Restposten, Ausstellungsguide
-- ============================================================

-- ── Partner (Logos + bis zu 10 PDFs pro Partner) ──────────────
CREATE TABLE IF NOT EXISTS partners (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  logo_url    text,
  website_url text,
  pdfs        jsonb       NOT NULL DEFAULT '[]',
  is_active   boolean     NOT NULL DEFAULT true,
  sort_order  int         NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER partners_updated_at
  BEFORE UPDATE ON partners
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX IF NOT EXISTS idx_partners_active     ON partners(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_partners_sort_order ON partners(sort_order);

ALTER TABLE partners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "partners_public_read"
  ON partners FOR SELECT
  USING (is_active = true);

CREATE POLICY "partners_team_read"
  ON partners FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM team_members WHERE user_id = auth.uid() AND is_active = true)
  );

CREATE POLICY "partners_team_write"
  ON partners FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE user_id = auth.uid() AND role IN ('admin', 'editor') AND is_active = true
    )
  );

-- ── Restposten (eigene Angebotskarten mit optionalem externem Link) ──
CREATE TABLE IF NOT EXISTS restposten (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title         text NOT NULL,
  description   text,
  price         numeric(10,2),
  images        text[]      NOT NULL DEFAULT '{}',
  external_link text,
  is_active     boolean     NOT NULL DEFAULT true,
  sort_order    int         NOT NULL DEFAULT 0,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER restposten_updated_at
  BEFORE UPDATE ON restposten
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX IF NOT EXISTS idx_restposten_active     ON restposten(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_restposten_sort_order ON restposten(sort_order);

ALTER TABLE restposten ENABLE ROW LEVEL SECURITY;

CREATE POLICY "restposten_public_read"
  ON restposten FOR SELECT
  USING (is_active = true);

CREATE POLICY "restposten_team_read"
  ON restposten FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM team_members WHERE user_id = auth.uid() AND is_active = true)
  );

CREATE POLICY "restposten_team_write"
  ON restposten FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE user_id = auth.uid() AND role IN ('admin', 'editor') AND is_active = true
    )
  );

-- ── Ausstellungsguide (nummerierte Einträge, unabhängig vom Produktkatalog) ──
CREATE TABLE IF NOT EXISTS guide_entries (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  number      int NOT NULL,
  name        text NOT NULL,
  description text,
  images      text[]      NOT NULL DEFAULT '{}',
  is_active   boolean     NOT NULL DEFAULT true,
  sort_order  int         NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (number)
);

CREATE TRIGGER guide_entries_updated_at
  BEFORE UPDATE ON guide_entries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX IF NOT EXISTS idx_guide_entries_active ON guide_entries(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_guide_entries_number  ON guide_entries(number);

ALTER TABLE guide_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "guide_entries_public_read"
  ON guide_entries FOR SELECT
  USING (is_active = true);

CREATE POLICY "guide_entries_team_read"
  ON guide_entries FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM team_members WHERE user_id = auth.uid() AND is_active = true)
  );

CREATE POLICY "guide_entries_team_write"
  ON guide_entries FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE user_id = auth.uid() AND role IN ('admin', 'editor') AND is_active = true
    )
  );
