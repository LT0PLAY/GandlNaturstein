-- Thumbnail als eigenes Feld (getrennt von Galerie-Fotos)
ALTER TABLE products ADD COLUMN IF NOT EXISTS thumbnail text;
ALTER TABLE products ADD COLUMN IF NOT EXISTS image_alts jsonb DEFAULT '{}';

COMMENT ON COLUMN products.thumbnail IS 'Hauptbild / Titelfoto (wird in Listen und als Hero gezeigt)';
COMMENT ON COLUMN products.images    IS 'Galerie-Fotos / Detailbilder';
COMMENT ON COLUMN products.image_alts IS 'Alt-Texte pro Bild-URL für SEO: { "url": "alt text" }';
