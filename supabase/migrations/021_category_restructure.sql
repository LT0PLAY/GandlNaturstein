-- Migration 021: Kategorie-Restrukturierung
-- Ersetzt den festen Außen/Innen-Split durch frei anlegbare Kategorien pro Bereich.
-- ============================================================

-- Produkte bekommen einen eigenen "bereich"-Wert, damit sie auch OHNE
-- Kategorie direkt einem Hauptbereich zugeordnet werden können
-- (z.B. Gartengestaltung-Produkte ohne Unterkategorie).
ALTER TABLE products ADD COLUMN IF NOT EXISTS bereich text
  CHECK (bereich IN ('massivproduktion','sonderanfertigung','gartengestaltung','extras'));

-- Bestehende Produkte: bereich aus der bisherigen Kategorie übernehmen
UPDATE products p
SET bereich = c.type
FROM categories c
WHERE p.category_id = c.id AND p.bereich IS NULL;

-- Neue Produktfelder: Icon-Overlay, Einsatzbereich, Farbe
ALTER TABLE products ADD COLUMN IF NOT EXISTS icon_url text;
ALTER TABLE products ADD COLUMN IF NOT EXISTS einsatzbereich text;
ALTER TABLE products ADD COLUMN IF NOT EXISTS farbe text;

-- Kategorien bekommen ein Titelbild (Hero-Banner auf der Kategorie-Seite)
ALTER TABLE categories ADD COLUMN IF NOT EXISTS image_url text;

-- Die alte Außen/Innen-Spalte wird nicht mehr verwendet.
-- Sie bleibt zunächst bestehen (keine Datenverluste), wird aber von der
-- Anwendung nicht mehr gelesen oder geschrieben.
COMMENT ON COLUMN categories.location IS 'DEPRECATED – nicht mehr verwendet seit der Kategorie-Restrukturierung (Migration 021). Kann nach Prüfung mit "ALTER TABLE categories DROP COLUMN location;" entfernt werden.';

COMMENT ON COLUMN products.bereich IS 'Hauptbereich direkt am Produkt (massivproduktion | sonderanfertigung | gartengestaltung | extras) – unabhängig von category_id, damit ein Produkt auch ohne Kategorie im Bereich stehen kann.';
COMMENT ON COLUMN products.icon_url IS 'Kleines PNG-Icon, wird als Overlay unten rechts im Produktbild angezeigt.';
COMMENT ON COLUMN categories.image_url IS 'Titelbild / Hero-Banner der Kategorie-Seite.';
