-- Migration 024: Mehrere Oberflächen-Varianten pro Produkt + neue Einheit "Größe"
-- ============================================================
-- Analog zu den bereits vorhandenen Größenvarianten (products.sizes) können
-- Produkte jetzt zusätzlich mehrere wählbare Oberflächen anbieten (z.B.
-- Poliert, Geflammt, Rau). Das bestehende einzelne "surface"-Textfeld bleibt
-- für Filter/Suche/SEO erhalten und wird beim Speichern automatisch aus dem
-- ersten Eintrag von "surfaces" befüllt.

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS surfaces text[] NOT NULL DEFAULT '{}';

COMMENT ON COLUMN products.surfaces IS 'Wählbare Oberflächen-Varianten, z.B. {"Poliert","Geflammt","Rau"}';

-- "Größe / Maße" als eigene Einheit ergänzen (bisher: stueck, laufmeter, qm, gewicht).
-- Der bestehende CHECK-Constraint-Name kann je nach Postgres-Version variieren,
-- daher wird er dynamisch über den Katalog gesucht statt hart kodiert.
DO $$
DECLARE
  c record;
BEGIN
  FOR c IN
    SELECT con.conname
    FROM pg_constraint con
    JOIN pg_class rel ON rel.oid = con.conrelid
    WHERE rel.relname = 'products'
      AND con.contype = 'c'
      AND pg_get_constraintdef(con.oid) ILIKE '%unit%stueck%'
  LOOP
    EXECUTE format('ALTER TABLE products DROP CONSTRAINT %I', c.conname);
  END LOOP;
END $$;

ALTER TABLE products
  ADD CONSTRAINT products_unit_check
  CHECK (unit IN ('stueck', 'laufmeter', 'qm', 'gewicht', 'groesse'));
