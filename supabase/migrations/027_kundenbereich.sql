-- Migration 027: Kundenbereich (privater Login-Bereich für Geschäftskunden)
-- ============================================================
-- Ein einzelner, vom Admin festgelegter Zugang (Benutzername + Passwort),
-- über den der Kunde sich einloggen und private PDFs ansehen/herunterladen
-- kann. Bewusst KEIN Supabase-Auth-Konto (das ist nur für Mitarbeiter/Admins
-- gedacht) — stattdessen ein eigenes, simples Zugangsdaten-Paar in dieser
-- Tabelle, das über eine eigene, signierte Session-Cookie geprüft wird.

-- Singleton-Tabelle: es gibt bewusst nur genau EINE Zeile (id = 'default').
CREATE TABLE IF NOT EXISTS customer_access (
  id            text PRIMARY KEY DEFAULT 'default',
  username      text NOT NULL,
  password_hash text NOT NULL,
  password_salt text NOT NULL,
  updated_at    timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT customer_access_singleton CHECK (id = 'default')
);

-- Private Dokumente (PDFs) für den Kundenbereich.
CREATE TABLE IF NOT EXISTS customer_documents (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title       text NOT NULL,
  info_text   text,
  thumbnail   text,
  pdf_url     text NOT NULL,
  sort_order  int NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- RLS: nur der Server (Service-Role-Key in den Server Actions) darf lesen/
-- schreiben — kein anonymer/clientseitiger Zugriff, weder lesend noch
-- schreibend. Genau wie bei den anderen Admin-verwalteten Tabellen.
ALTER TABLE customer_access    ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_documents ENABLE ROW LEVEL SECURITY;
