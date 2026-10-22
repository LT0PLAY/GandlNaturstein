# CLAUDE.md

Architektur, Befehle, Umgebungsvariablen und Sicherheitsmodell stehen in [README.md](README.md) — vor Änderungen lesen.

Kurzregeln:
- Alle Texte, Kommentare und Commit-Messages auf Deutsch.
- Jede schreibende Server Action beginnt mit `requireTeamMember()` bzw. `requireAdminMember()` (`lib/actions/authGuard.ts`).
- Schemaänderungen nur als neue Migration in `supabase/migrations/` (nächste Nummer: 037).
- Vor jedem Commit: `npx tsc --noEmit` und `npm run lint`.
