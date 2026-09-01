-- Migration 026: "Massivproduktion" umbenannt zu "Eigenproduktion"
-- ============================================================

-- CHECK-Constraints ZUERST aktualisieren (müssen den neuen Wert erlauben,
-- bevor die folgenden UPDATEs ihn in bestehende Zeilen schreiben)
ALTER TABLE categories DROP CONSTRAINT IF EXISTS categories_type_check;
ALTER TABLE categories ADD CONSTRAINT categories_type_check
  CHECK (type IN ('eigenproduktion', 'sonderanfertigung', 'gartengestaltung', 'extras'));

ALTER TABLE products DROP CONSTRAINT IF EXISTS products_bereich_check;
ALTER TABLE products ADD CONSTRAINT products_bereich_check
  CHECK (bereich IN ('eigenproduktion', 'sonderanfertigung', 'gartengestaltung', 'extras'));

-- Jetzt erst die bestehenden Daten umschreiben
UPDATE categories SET type    = 'eigenproduktion' WHERE type    = 'massivproduktion';
UPDATE products    SET bereich = 'eigenproduktion' WHERE bereich = 'massivproduktion';
