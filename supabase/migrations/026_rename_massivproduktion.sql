-- Migration 026: "Massivproduktion" umbenannt zu "Eigenproduktion"
-- ============================================================

-- Bestehende Daten umschreiben
UPDATE categories SET type    = 'eigenproduktion' WHERE type    = 'massivproduktion';
UPDATE products    SET bereich = 'eigenproduktion' WHERE bereich = 'massivproduktion';

-- CHECK-Constraints aktualisieren
ALTER TABLE categories DROP CONSTRAINT IF EXISTS categories_type_check;
ALTER TABLE categories ADD CONSTRAINT categories_type_check
  CHECK (type IN ('eigenproduktion', 'sonderanfertigung', 'gartengestaltung', 'extras'));

ALTER TABLE products DROP CONSTRAINT IF EXISTS products_bereich_check;
ALTER TABLE products ADD CONSTRAINT products_bereich_check
  CHECK (bereich IN ('eigenproduktion', 'sonderanfertigung', 'gartengestaltung', 'extras'));
