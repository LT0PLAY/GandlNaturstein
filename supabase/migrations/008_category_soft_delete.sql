-- ============================================================
-- Migration 008: Soft-Delete für Kategorien
-- ============================================================

ALTER TABLE categories
  ADD COLUMN IF NOT EXISTS deleted_at  timestamptz,
  ADD COLUMN IF NOT EXISTS deleted_by  uuid REFERENCES team_members(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_categories_deleted_at ON categories (deleted_at);

-- Hinweis: Ausführen im Supabase SQL Editor
