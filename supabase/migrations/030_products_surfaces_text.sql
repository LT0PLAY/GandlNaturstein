-- Migration 030: Durchsuchbare Textspalte für die Oberflächen-Varianten
-- ============================================================
-- products.surfaces ist ein text[] und lässt sich in der Suche (PostgREST
-- ilike) nicht direkt durchsuchen. Diese generierte Spalte spiegelt das Array
-- als Text (z. B. "poliert geflammt satiniert") und wird automatisch aktuell
-- gehalten. array_to_string ist nur STABLE, daher der IMMUTABLE-Wrapper — nötig,
-- damit Postgres die Spalte als GENERATED ... STORED akzeptiert.

CREATE OR REPLACE FUNCTION immutable_array_to_text(text[])
RETURNS text
LANGUAGE sql
IMMUTABLE
PARALLEL SAFE
AS $$ SELECT array_to_string($1, ' ') $$;

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS surfaces_text text
  GENERATED ALWAYS AS (immutable_array_to_text(surfaces)) STORED;
