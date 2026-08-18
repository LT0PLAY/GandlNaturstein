-- Migration 018: Ausstellungsguide – optionale Verknüpfung mit einem Produkt
-- ============================================================

ALTER TABLE guide_entries
  ADD COLUMN IF NOT EXISTS product_id uuid REFERENCES products(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_guide_entries_product_id ON guide_entries(product_id);
