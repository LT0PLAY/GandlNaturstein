-- Migration 012: Soft-Delete für project_references
ALTER TABLE project_references
  ADD COLUMN IF NOT EXISTS deleted_at  timestamptz,
  ADD COLUMN IF NOT EXISTS deleted_by  uuid REFERENCES team_members(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_project_references_deleted_at ON project_references(deleted_at);
