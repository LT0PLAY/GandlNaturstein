-- Migration 025: Popup-Format (Standard / Poster im DIN-A5-Hochformat)
-- ============================================================
ALTER TABLE popups
  ADD COLUMN IF NOT EXISTS layout text NOT NULL DEFAULT 'standard';

ALTER TABLE popups DROP CONSTRAINT IF EXISTS popups_layout_check;
ALTER TABLE popups
  ADD CONSTRAINT popups_layout_check CHECK (layout IN ('standard', 'din_a5'));

COMMENT ON COLUMN popups.layout IS 'standard = Bild oben + Text darunter, din_a5 = ganzflächiges Poster im Hochformat (148x210mm-Verhältnis)';
