-- Migration 009: E-Mail direkt im change_log speichern
-- Damit steht immer wer eine Aktion ausgeführt hat, auch ohne team_members-Eintrag

ALTER TABLE change_log
  ADD COLUMN IF NOT EXISTS changed_by_email text;
