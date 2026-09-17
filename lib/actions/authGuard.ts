import { createSupabaseServerClient } from '@/lib/supabase-server'

// ── Gemeinsamer Autorisierungs-Check für schreibende Server Actions ──
//
// WICHTIG: Server Actions sind eigene HTTP-Endpunkte (aufrufbar per POST +
// Next-Action-Header) und NICHT automatisch durch proxy.ts geschützt, nur
// weil sie aus einer /admin-Seite heraus aufgerufen werden — proxy.ts
// schützt zuverlässig nur die Seiten-NAVIGATION. Jede schreibende Aktion
// muss ihre Berechtigung deshalb selbst prüfen, bevor sie mit dem
// Service-Role-Key (der RLS umgeht) auf die Datenbank zugreift.

export type AuthGuardResult =
  | { ok: true;  memberId: string }
  | { ok: false; error: string }

/** Muss ein eingeloggter UND aktiver Team-Mitarbeiter sein (jede Rolle). */
export async function requireTeamMember(): Promise<AuthGuardResult> {
  try {
    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { ok: false, error: 'Nicht eingeloggt.' }

    const { data: member } = await supabase
      .from('team_members')
      .select('id, is_active')
      .eq('user_id', user.id)
      .maybeSingle()

    if (!member || !member.is_active) return { ok: false, error: 'Kein Zugriff.' }
    return { ok: true, memberId: member.id }
  } catch {
    return { ok: false, error: 'Kein Zugriff.' }
  }
}

/** Muss ein eingeloggter UND aktiver Team-Mitarbeiter MIT Admin-Rolle sein. */
export async function requireAdminMember(): Promise<AuthGuardResult> {
  try {
    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { ok: false, error: 'Nicht eingeloggt.' }

    const { data: member } = await supabase
      .from('team_members')
      .select('id, is_active, role')
      .eq('user_id', user.id)
      .maybeSingle()

    if (!member || !member.is_active || member.role !== 'admin') {
      return { ok: false, error: 'Nur der Admin darf das.' }
    }
    return { ok: true, memberId: member.id }
  } catch {
    return { ok: false, error: 'Kein Zugriff.' }
  }
}
