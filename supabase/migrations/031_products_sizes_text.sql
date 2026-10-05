-- Migration 031: Durchsuchbare Textspalte für die Größen-/Maßvarianten
-- ============================================================
-- products.sizes ist ein JSON-Array ([{label, price, ...}]) und lässt sich in
-- der Suche (PostgREST ilike) nicht direkt durchsuchen. Diese generierte Spalte
-- enthält alle Größen-Bezeichnungen als Text (z. B. "2 cm 3 cm 30x60") und
-- wird automatisch aktuell gehalten. Der IMMUTABLE-Wrapper ist nötig, damit
-- Postgres die Spalte als GENERATED ... STORED akzeptiert.

CREATE OR REPLACE FUNCTION immutable_size_labels(jsonb)
RETURNS text
LANGUAGE sql
IMMUTABLE
PARALLEL SAFE
AS $$
  SELECT COALESCE(string_agg(e->>'label', ' '), '')
  FROM jsonb_array_elements(
    CASE WHEN jsonb_typeof($1) = 'array' THEN $1 ELSE '[]'::jsonb END
  ) AS e
$$;

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS sizes_text text
  GENERATED ALWAYS AS (immutable_size_labels(sizes::jsonb)) STORED;
