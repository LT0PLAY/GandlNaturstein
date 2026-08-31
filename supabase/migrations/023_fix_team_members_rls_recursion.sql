-- Migration 023: Fix "infinite recursion" in der team_members-RLS-Policy
-- ============================================================
-- Problem: Die bisherige Policy "team_members_admin_only" prüft, ob der
-- eingeloggte User Admin ist, indem sie NOCHMAL auf team_members selbst
-- zugreift (select 1 from team_members where user_id = auth.uid() ...).
-- Postgres wendet die RLS-Policy auch auf diese innere Abfrage an — das
-- ist eine Selbstreferenz, die Postgres als "infinite recursion detected
-- in policy for relation team_members" abbricht bzw. leer zurückgibt.
--
-- Effekt in der App: Jede Abfrage auf team_members über den normalen
-- (RLS-gebundenen) Server-Client liefert kein Ergebnis mehr — auch für
-- den echten Hauptadmin. Das führte u.a. zur fälschlichen Fehlermeldung
-- "Nur der Hauptadmin darf das Team verwalten." beim Mitarbeiter einladen.
--
-- Lösung: Eine SECURITY DEFINER-Funktion prüft die Rolle mit vollen
-- Rechten (umgeht RLS für genau diese eine Prüfung) — dadurch entsteht
-- keine Rekursion mehr. Zusätzlich darf jeder eingeloggte Mitarbeiter
-- seine EIGENE Zeile lesen (nötig, damit z.B. Editor/Viewer sich selbst
-- korrekt einloggen können).
-- ============================================================

CREATE OR REPLACE FUNCTION public.is_team_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM team_members
    WHERE user_id = auth.uid() AND role = 'admin' AND is_active = true
  );
$$;

DROP POLICY IF EXISTS "team_members_admin_only" ON team_members;

CREATE POLICY "team_members_self_read"
  ON team_members FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "team_members_admin_all"
  ON team_members FOR ALL
  USING (public.is_team_admin())
  WITH CHECK (public.is_team_admin());
