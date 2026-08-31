-- Migration 022: Titelbilder (Hero-Banner) für einzelne, feste Seiten
-- (Partner, Restposten, Ausstellungsguide, Karriere, Referenzen).
-- Analog zum bereits vorhandenen Titelbild bei Kategorien (categories.image_url),
-- aber pro fester Seite statt pro Kategorie — daher eigene Key-Value-Tabelle.
-- ============================================================

CREATE TABLE IF NOT EXISTS page_heroes (
  page_key    text PRIMARY KEY,
  image_url   text,
  updated_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE page_heroes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "page_heroes_public_read"
  ON page_heroes FOR SELECT
  USING (true);

CREATE POLICY "page_heroes_team_write"
  ON page_heroes FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE user_id = auth.uid() AND role IN ('admin', 'editor') AND is_active = true
    )
  );
