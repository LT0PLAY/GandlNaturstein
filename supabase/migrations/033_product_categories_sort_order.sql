-- Migration 033: Reihenfolge eines Produkts je zusätzlicher Kategorie
-- ============================================================
-- Ein Produkt kann über "Weitere Kategorien" in mehreren Kategorien erscheinen
-- (product_categories). Mit dieser Spalte lässt sich für jede dieser Zuordnungen
-- eine eigene Position festlegen. NULL = es gilt die allgemeine Reihenfolge
-- des Produkts (products.sort_order).

ALTER TABLE product_categories
  ADD COLUMN IF NOT EXISTS sort_order integer;

COMMENT ON COLUMN product_categories.sort_order IS 'Position des Produkts in dieser Kategorie (kleiner = weiter vorne); NULL = products.sort_order';
