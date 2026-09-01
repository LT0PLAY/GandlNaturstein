-- Migration 026: "Massivproduktion" umbenannt zu "Eigenproduktion"
-- ============================================================

-- Schritt 1: Constraints ÜBERGANGSWEISE erweitern, sodass sowohl der alte
-- als auch der neue Wert erlaubt sind (ADD CONSTRAINT prüft sofort ALLE
-- bestehenden Zeilen — die haben zu diesem Zeitpunkt noch 'massivproduktion').
ALTER TABLE categories DROP CONSTRAINT IF EXISTS categories_type_check;
ALTER TABLE categories ADD CONSTRAINT categories_type_check
  CHECK (type IN ('massivproduktion', 'eigenproduktion', 'sonderanfertigung', 'gartengestaltung', 'extras'));

ALTER TABLE products DROP CONSTRAINT IF EXISTS products_bereich_check;
ALTER TABLE products ADD CONSTRAINT products_bereich_check
  CHECK (bereich IN ('massivproduktion', 'eigenproduktion', 'sonderanfertigung', 'gartengestaltung', 'extras'));

-- Schritt 2: Bestehende Daten umschreiben
UPDATE categories SET type    = 'eigenproduktion' WHERE type    = 'massivproduktion';
UPDATE products    SET bereich = 'eigenproduktion' WHERE bereich = 'massivproduktion';

-- Schritt 3: Constraints final verengen — 'massivproduktion' nicht mehr erlaubt
ALTER TABLE categories DROP CONSTRAINT IF EXISTS categories_type_check;
ALTER TABLE categories ADD CONSTRAINT categories_type_check
  CHECK (type IN ('eigenproduktion', 'sonderanfertigung', 'gartengestaltung', 'extras'));

ALTER TABLE products DROP CONSTRAINT IF EXISTS products_bereich_check;
ALTER TABLE products ADD CONSTRAINT products_bereich_check
  CHECK (bereich IN ('eigenproduktion', 'sonderanfertigung', 'gartengestaltung', 'extras'));
