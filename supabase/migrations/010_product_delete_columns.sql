-- Migration 010: Fehlende Soft-Delete-Spalten für Produkte (falls 005 noch nicht vollständig lief)
-- Alle IF NOT EXISTS → sicher mehrfach ausführbar

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS delete_pending        boolean     NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS delete_requested_by   uuid        REFERENCES team_members(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS delete_requested_at   timestamptz,
  ADD COLUMN IF NOT EXISTS deleted_at            timestamptz,
  ADD COLUMN IF NOT EXISTS deleted_by            uuid        REFERENCES team_members(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_products_delete_pending ON products(delete_pending) WHERE delete_pending = true;
CREATE INDEX IF NOT EXISTS idx_products_deleted_at     ON products(deleted_at)     WHERE deleted_at IS NOT NULL;
