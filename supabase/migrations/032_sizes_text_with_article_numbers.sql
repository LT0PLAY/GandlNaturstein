-- Migration 032: Größen-Suchspalte enthält jetzt auch die Artikelnummern der Varianten
-- ============================================================
-- Bisher (Migration 031) enthielt products.sizes_text nur die Größen-Bezeichnungen.
-- Damit die Suche ein Produkt auch über die Artikelnummer einer Größenvariante
-- findet (z. B. "FST331"), werden diese jetzt mit aufgenommen.

ALTER TABLE products DROP COLUMN IF EXISTS sizes_text;

CREATE OR REPLACE FUNCTION immutable_size_labels(jsonb)
RETURNS text
LANGUAGE sql
IMMUTABLE
PARALLEL SAFE
AS $$
  SELECT COALESCE(
    string_agg(concat_ws(' ', e->>'label', e->>'article_number'), ' '),
    ''
  )
  FROM jsonb_array_elements(
    CASE WHEN jsonb_typeof($1) = 'array' THEN $1 ELSE '[]'::jsonb END
  ) AS e
$$;

ALTER TABLE products
  ADD COLUMN sizes_text text
  GENERATED ALWAYS AS (immutable_size_labels(sizes::jsonb)) STORED;
