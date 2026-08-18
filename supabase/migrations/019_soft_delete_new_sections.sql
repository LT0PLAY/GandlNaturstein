-- Migration 019: Soft-Delete (Papierkorb) für Partner, Restposten, Ausstellungsguide
-- ============================================================

ALTER TABLE partners       ADD COLUMN IF NOT EXISTS deleted_at timestamptz;
ALTER TABLE restposten     ADD COLUMN IF NOT EXISTS deleted_at timestamptz;
ALTER TABLE guide_entries  ADD COLUMN IF NOT EXISTS deleted_at timestamptz;

CREATE INDEX IF NOT EXISTS idx_partners_deleted_at      ON partners(deleted_at)      WHERE deleted_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_restposten_deleted_at    ON restposten(deleted_at)    WHERE deleted_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_guide_entries_deleted_at ON guide_entries(deleted_at) WHERE deleted_at IS NOT NULL;
