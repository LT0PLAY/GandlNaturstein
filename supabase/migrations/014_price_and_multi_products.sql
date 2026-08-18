-- ============================================================
-- 014_price_and_multi_products.sql
-- Preis-Felder für Produkte + Mehrfach-Produkte für Referenzen
-- ============================================================

-- Preis auf Produkte
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS price      numeric(10,2),
  ADD COLUMN IF NOT EXISTS show_price boolean NOT NULL DEFAULT false;

-- Mehrfach-Produkte auf Referenzen (UUID-Array)
ALTER TABLE project_references
  ADD COLUMN IF NOT EXISTS product_ids uuid[] NOT NULL DEFAULT '{}';

-- Bestehende product_id in product_ids migrieren
UPDATE project_references
SET product_ids = ARRAY[product_id]
WHERE product_id IS NOT NULL
  AND (product_ids IS NULL OR product_ids = '{}');
