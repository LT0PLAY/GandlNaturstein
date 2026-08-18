-- ============================================================
-- Migration 007: Kategorie-Hierarchie erweitern
-- Massivproduktion / Sonderanfertigung / Gartengestaltung
-- jeweils mit Außen / Innen als Standort
-- ============================================================

-- 1. Neue Spalte: location (aussen | innen | NULL für Extras)
ALTER TABLE categories
  ADD COLUMN IF NOT EXISTS location text
  CHECK (location IN ('aussen', 'innen'));

-- 2. Bestehende Daten migrieren (best-effort, Admin kann nachjustieren)
--    type='aussen'  → bereich=gartengestaltung, location=aussen
--    type='innen'   → bereich=massivproduktion, location=innen
--    sonderanfertigung + extras bleiben als type, location=NULL
UPDATE categories SET type = 'gartengestaltung', location = 'aussen' WHERE type = 'aussen';
UPDATE categories SET type = 'massivproduktion', location = 'innen'  WHERE type = 'innen';
-- sonderanfertigung: location bleibt NULL (hat eigene Seite, kein Außen/Innen-Split nötig)
-- extras: location bleibt NULL

-- 3. CHECK constraint aktualisieren
ALTER TABLE categories DROP CONSTRAINT IF EXISTS categories_type_check;
ALTER TABLE categories ADD CONSTRAINT categories_type_check
  CHECK (type IN ('massivproduktion', 'sonderanfertigung', 'gartengestaltung', 'extras'));

-- 4. Sonderanfertigung bekommt auch Außen/Innen-Unterstützung
--    (bestehende Sonderanfertigung-Kategorien bekommen location=NULL, ist ok)
--    Neue können mit location angelegt werden.

-- 5. Index für schnelle Filterung
CREATE INDEX IF NOT EXISTS idx_categories_type_location
  ON categories (type, location);

-- Hinweis: Ausführen im Supabase SQL Editor
-- Danach ggf. bestehende Kategorien im Admin-Bereich nachjustieren
-- (welcher Bereich ist wirklich Massivproduktion, welcher Gartengestaltung)
