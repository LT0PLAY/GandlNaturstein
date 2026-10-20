-- ============================================================
-- 005_soft_delete.sql
-- Soft-Delete Workflow für Produkte
-- Editor → delete_pending → Admin genehmigt → deleted_at (Papierkorb)
-- ============================================================

-- Soft-Delete Felder
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS delete_pending        boolean     NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS delete_requested_by   uuid        REFERENCES team_members(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS delete_requested_at   timestamptz,
  ADD COLUMN IF NOT EXISTS deleted_at            timestamptz,
  ADD COLUMN IF NOT EXISTS deleted_by            uuid        REFERENCES team_members(id) ON DELETE SET NULL;

-- Index für effiziente Abfragen
CREATE INDEX IF NOT EXISTS idx_products_delete_pending ON products(delete_pending) WHERE delete_pending = true;
CREATE INDEX IF NOT EXISTS idx_products_deleted_at     ON products(deleted_at)     WHERE deleted_at IS NOT NULL;

-- Monitoring-Tabelle: Aufbewahrung 365 Tage
-- (Eine generierte Spalte created_at + INTERVAL '365 days' ist bei timestamptz nicht
-- immutable und scheitert mit Fehler 42P17 — daher direkt in der Funktion gerechnet.)
-- Helper: Funktion zum Löschen abgelaufener Log-Einträge (Admin ruft manuell auf)
CREATE OR REPLACE FUNCTION purge_expired_logs()
RETURNS integer
LANGUAGE plpgsql
AS $$
DECLARE
  deleted_count integer;
BEGIN
  DELETE FROM change_log WHERE created_at < now() - INTERVAL '365 days';
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;

-- Nur der Service-Role-Key darf die Funktion aufrufen, nicht der öffentliche Key
REVOKE EXECUTE ON FUNCTION purge_expired_logs() FROM PUBLIC, anon, authenticated;
