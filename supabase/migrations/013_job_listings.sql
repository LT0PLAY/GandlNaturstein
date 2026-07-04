-- Migration 013: Karriere / Stellenangebote
CREATE TABLE IF NOT EXISTS job_listings (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  title            text        NOT NULL,
  department       text,
  location         text,
  employment_type  text,                          -- Vollzeit, Teilzeit, Minijob, Praktikum …
  description      text,
  requirements     text,
  benefits         text,
  pdf_url          text,                          -- PDF zum Download
  linkedin_url     text,                          -- Stellenanzeige auf LinkedIn
  images           text[]      NOT NULL DEFAULT '{}',
  is_published     boolean     NOT NULL DEFAULT false,
  sort_order       int         NOT NULL DEFAULT 0,
  deleted_at       timestamptz,
  deleted_by       uuid        REFERENCES team_members(id) ON DELETE SET NULL,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);

-- Nur Admins dürfen lesen/schreiben (via admin client, kein public RLS nötig)
-- Public: nur veröffentlichte und nicht gelöschte Stellen
ALTER TABLE job_listings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public read published jobs" ON job_listings
  FOR SELECT USING (is_published = true AND deleted_at IS NULL);

CREATE POLICY "admin full access jobs" ON job_listings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM team_members tm
      WHERE tm.auth_user_id = auth.uid() AND tm.role = 'admin'
    )
  );

CREATE INDEX IF NOT EXISTS idx_job_listings_deleted_at   ON job_listings(deleted_at);
CREATE INDEX IF NOT EXISTS idx_job_listings_is_published ON job_listings(is_published);
