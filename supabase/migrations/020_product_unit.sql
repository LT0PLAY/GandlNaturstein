-- Migration 020: Wählbare Einheit pro Produkt (Stück / Laufmeter / QM / Gewicht)
-- ============================================================

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS unit text NOT NULL DEFAULT 'qm'
  CHECK (unit IN ('stueck', 'laufmeter', 'qm', 'gewicht'));

COMMENT ON COLUMN products.unit IS 'Einheit für Preis/Anfragekorb: stueck | laufmeter | qm | gewicht';
