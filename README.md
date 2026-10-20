# Gandl Natursteine

Website, Anfrage-Korb, BtoB-Kundenbereich und Admin-Bereich für Gandl Natursteine.

**Stack:** Next.js 16 (App Router), React 19, Supabase (Auth, Postgres, Storage), Resend (E-Mails), Vercel (Hosting, Analytics).

## Entwicklung

```bash
npm install
npm run dev      # http://localhost:3000
npm run lint
npx tsc --noEmit
npm run build
```

### Umgebungsvariablen (`.env.local`, nicht im Repository)

| Variable | Zweck |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase-Projekt-URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Öffentlicher Supabase-Key (unterliegt RLS) |
| `SUPABASE_SERVICE_ROLE_KEY` | Service-Role-Key, nur serverseitig. Umgeht RLS und signiert die BtoB-Kundensession |
| `RESEND_API_KEY`, `RESEND_FROM_EMAIL` | E-Mail-Versand (Anfragen, Einladungen) |
| `NEXT_PUBLIC_SITE_URL` | Basis-URL für Canonicals, Sitemap, JSON-LD (Standard: `https://gandl-natursteine.de`) |

Ohne Supabase-Konfiguration ist der Admin lokal frei zugänglich (nur `NODE_ENV=development`); in Produktion bleibt er gesperrt.

## Aufbau

- `app/(public)` – öffentliche Seiten. Bereiche: `eigenproduktion`, `gartengestaltung`, `sonderanfertigung`, `extras`, je mit `kategorie/[slug]` und `[slug]`. Dazu Referenzen, Restposten, Ausstellungsguide, Karriere, Kontakt u. a.
- `app/(public)/btob` – Kundenbereich mit eigenem Cookie-Login (`lib/customerSession.ts`), getrennt vom Mitarbeiter-Login.
- `app/(admin)/admin` – Admin-Bereich (Produkte, Kategorien, Referenzen, Team, Anfragen, Popups, Papierkorb, Monitoring).
- `lib/actions` – Server Actions (Schreibzugriffe). `lib/queries` – Lesezugriffe.
- `components/public`, `components/admin` – UI-Bausteine.
- `proxy.ts` – Next.js-16-Proxy (früher Middleware): schützt `/admin` und `/btob`, fail-closed.
- `supabase/migrations` – nummerierte SQL-Migrationen (001–033), in Reihenfolge im Supabase-SQL-Editor einzuspielen. Stand Produktiv-DB (20.10.2026): alles bis 033 eingespielt, außer 015 (ungenutzte Tabelle `product_slug_redirects`) und dem Retention-Teil von 005 (`change_log.expires_at`, `purge_expired_logs()`).

## Sicherheitsmodell

- `proxy.ts` schützt nur die **Seitennavigation**. Server Actions sind eigene HTTP-Endpunkte: Jede schreibende Action muss `requireTeamMember()` / `requireAdminMember()` aus `lib/actions/authGuard.ts` aufrufen, bevor sie den Service-Role-Client nutzt.
- Deaktivierte Mitarbeiter (`team_members.is_active = false`) werden im Proxy und im Login ausgesperrt. Die Selbstfreischaltung nach einer Einladung hängt am serverseitigen Marker `app_metadata.pending_invite` (gesetzt in `createTeamMember`).
- JSON-LD immer über `jsonLdScript()` (`lib/seo.ts`) ausgeben, nie direkt `JSON.stringify`.

## Konventionen

- Texte, Kommentare und Commit-Messages auf Deutsch.
- Löschen ist ein Soft-Delete (Papierkorb); endgültiges Löschen nur über `/admin/papierkorb`.
- Neue Datenbankfelder brauchen eine neue Migration; vor dem Deploy auf Supabase einspielen.
- Die Labels im Design wie `// Anfrage` sind gewollt (sichtbarer Text, kein Kommentar).
