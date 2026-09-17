-- Migration 029: Brute-Force-Schutz für den BtoB-Login
-- ============================================================
-- customerLogin() hatte bisher kein Rate-Limiting — das gemeinsame Passwort
-- (Mindestlänge nur 6 Zeichen) ließ sich unbegrenzt oft per Skript ausprobieren.
-- Jetzt: nach 10 falschen Versuchen in Folge wird der Zugang für 15 Minuten
-- gesperrt (automatische Entsperrung danach, kein Admin-Eingriff nötig).

ALTER TABLE customer_access
  ADD COLUMN IF NOT EXISTS failed_attempts int NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS locked_until    timestamptz;
