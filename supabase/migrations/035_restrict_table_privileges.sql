-- Migration 035: Tabellenrechte für anon/authenticated einschränken
-- ============================================================
-- Supabase vergibt standardmäßig alle Rechte (auch TRUNCATE, TRIGGER, REFERENCES)
-- an anon und authenticated; geschützt waren die Tabellen nur durch RLS.
-- Die App nutzt den öffentlichen Key (anon) nie zum Schreiben — öffentliche Seiten
-- und Formulare laufen über den Service-Role-Client, die Mitarbeiter-Session nutzt
-- anon/authenticated nur für Login und team_members.
--
-- Rollback (falls nötig): GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;

-- Der öffentliche Key darf nur noch lesen (weiterhin durch RLS begrenzt).
REVOKE INSERT, UPDATE, DELETE, TRUNCATE, TRIGGER, REFERENCES
  ON ALL TABLES IN SCHEMA public FROM anon;

-- Eingeloggte Mitarbeiter: kein TRUNCATE/TRIGGER/REFERENCES; Lesen/Schreiben bleibt (RLS).
REVOKE TRUNCATE, TRIGGER, REFERENCES
  ON ALL TABLES IN SCHEMA public FROM authenticated;

-- Passwort-Hash und Kundendokumente: kein Zugriff über den öffentlichen API-Pfad.
REVOKE ALL ON customer_access, customer_documents FROM anon, authenticated;

-- Künftige Tabellen bekommen die weiten Rechte nicht mehr automatisch.
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE TRUNCATE, TRIGGER, REFERENCES ON TABLES FROM anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE INSERT, UPDATE, DELETE ON TABLES FROM anon;
