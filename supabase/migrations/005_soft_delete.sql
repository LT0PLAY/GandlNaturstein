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

-- Monitoring-Tabelle: Retention-Feld (Einträge werden nach 365 Tagen gelöscht)
-- (Automatisch via pg_cron oder manuell durch Admin-Action)
-- Eintrag für Aufbewahrungsdauer in Tagen
ALTER TABLE change_log
  ADD COLUMN IF NOT EXISTS expires_at timestamptz GENERATED ALWAYS AS (created_at + INTERVAL '365 days') STORED;

-- Index für Retention-Abfragen
CREATE INDEX IF NOT EXISTS idx_changelog_expires_at ON change_log(expires_at);

-- Helper: Funktion zum Löschen abgelaufener Log-Einträge (Admin ruft manuell auf)
CREATE OR REPLACE FUNCTION purge_expired_logs()
RETURNS integer
LANGUAGE plpgsql
AS $$
DECLARE
  deleted_count integer;
BEGIN
  DELETE FROM change_log WHERE expires_at < now();
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;
