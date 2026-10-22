-- Migration 036: Anfragen mit strukturierten Positionen und Notiz-Verlauf
-- ============================================================
-- items: die angefragten Produkte einer Korb-Anfrage als Liste
--        ([{productId, name, quantity, unit, sourceType, articleNumber, size, surface, path, thumbnail}]).
--        Bisher wurde pro Position eine eigene Anfrage-Zeile mit demselben Text gespeichert;
--        künftig gibt es pro Korb genau eine Zeile.
-- notes: interne Team-Notizen als Chat-Verlauf
--        ([{id, authorId, author, text, at}]). Die bisherige Einzel-Notiz (internal_note)
--        bleibt erhalten und wird als ältere Notiz angezeigt.

ALTER TABLE inquiries
  ADD COLUMN IF NOT EXISTS items jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS notes jsonb NOT NULL DEFAULT '[]'::jsonb;
