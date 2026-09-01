'use server'

import { revalidatePath } from 'next/cache'
import { createSupabaseAdminClient } from '@/lib/supabase'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { logChange } from '@/lib/utils/changelog'
import type { TeamRole } from '@/lib/types'

export type TeamActionState = {
  error:   string | null
  success: boolean
  /** Link zum manuellen Weiterleiten an den Mitarbeiter — E-Mail-Versand ist
   *  bewusst deaktiviert, der Admin teilt den Link persönlich (WhatsApp, o.ä.). */
  inviteLink?:    string | null
}

// ── Hilfsfunktion: Prüft ob aktueller User Admin ist ──────────────
async function requireAdmin() {
  const serverClient = await createSupabaseServerClient()
  const { data: { user } } = await serverClient.auth.getUser()
  if (!user) return { error: 'Nicht eingeloggt.', ok: false }

  const { data: member } = await serverClient
    .from('team_members')
    .select('role')
    .eq('user_id', user.id)
    .single()

  if (!member || member.role !== 'admin') {
    return { error: 'Nur der Hauptadmin darf das Team verwalten.', ok: false }
  }
  return { error: null, ok: true }
}

// ── Mitarbeiter einladen ───────────────────────────────────────────
export async function createTeamMember(
  _prevState: TeamActionState,
  formData: FormData
): Promise<TeamActionState> {
  const auth = await requireAdmin()
  if (!auth.ok) return { error: auth.error, success: false }

  const supabase = createSupabaseAdminClient()
  const email = formData.get('email') as string
  const name  = formData.get('name')  as string
  const role  = formData.get('role')  as TeamRole

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

  // Einladungslink über Supabase erzeugen — OHNE dass Supabase selbst eine E-Mail
  // verschickt (das übernehmen wir gleich unten selbst, mit eigenem Design/Absender).
  const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
    type:  'invite',
    email,
    options: {
      data:       { name, role },
      redirectTo: `${siteUrl}/admin/passwort-neu-setzen`,
    },
  })
  if (linkError) return { error: linkError.message, success: false }

  // Eigene Bestätigungsroute (/auth/confirm) statt des von Supabase generierten
  // action_link — der kann je nach Flow-Typ (PKCE) im Browser nicht zuverlässig
  // eingelöst werden. hashed_token + unsere Route funktioniert unabhängig davon.
  const hashedToken = (linkData as any)?.properties?.hashed_token as string | undefined
  const userId = linkData.user?.id
  if (!hashedToken || !userId) {
    return { error: 'Einladungslink konnte nicht erzeugt werden.', success: false }
  }
  const actionLink = `${siteUrl}/auth/confirm?token_hash=${hashedToken}&type=invite&next=${encodeURIComponent('/admin/passwort-neu-setzen')}`

  const { error } = await supabase.from('team_members').insert({
    user_id:   userId,
    name,
    email,
    role,
    is_active: false, // erst aktiv nach Passwort-Setzen
  })
  if (error) return { error: error.message, success: false }

  await logChange({
    action: 'create', entity_type: 'team',
    entity_name: name, new_value: { email, role },
  })
  revalidatePath('/admin/team')

  // Kein automatischer E-Mail-Versand (bewusst) — der Link wird dem Admin hier
  // zum manuellen Weiterleiten angezeigt.
  return { error: null, success: true, inviteLink: actionLink }
}

// ── Neuen Link zum Passwort-Setzen erzeugen (für bereits registrierte
//    Mitarbeiter, die ihr Passwort verloren haben) ──────────────────
export async function generateNewPasswordLink(id: string): Promise<TeamActionState> {
  const auth = await requireAdmin()
  if (!auth.ok) return { error: auth.error, success: false }

  const supabase = createSupabaseAdminClient()
  const { data: member } = await supabase
    .from('team_members').select('email').eq('id', id).single()
  if (!member?.email) return { error: 'Mitarbeiter nicht gefunden.', success: false }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

  const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
    type:  'recovery',
    email: member.email,
    options: { redirectTo: `${siteUrl}/admin/passwort-neu-setzen` },
  })
  if (linkError) return { error: linkError.message, success: false }

  const hashedToken = (linkData as any)?.properties?.hashed_token as string | undefined
  if (!hashedToken) return { error: 'Link konnte nicht erzeugt werden.', success: false }

  const actionLink = `${siteUrl}/auth/confirm?token_hash=${hashedToken}&type=recovery&next=${encodeURIComponent('/admin/passwort-neu-setzen')}`

  await logChange({
    action: 'update', entity_type: 'team', entity_id: id,
    entity_name: member.email,
    new_value: { action: 'password_link_generated' },
  })

  return { error: null, success: true, inviteLink: actionLink }
}

// ── Mitarbeiter endgültig löschen ───────────────────────────────────
export async function deleteTeamMember(id: string) {
  const auth = await requireAdmin()
  if (!auth.ok) return { error: auth.error, success: false }

  const supabase = createSupabaseAdminClient()
  const { data: member } = await supabase
    .from('team_members').select('name, role, user_id').eq('id', id).single()

  if (member?.role === 'admin') {
    return { error: 'Der Hauptadmin kann nicht gelöscht werden.', success: false }
  }

  // Login-Konto ebenfalls entfernen — sonst könnte die Person sich trotz gelöschtem
  // Team-Eintrag technisch weiterhin einloggen.
  if (member?.user_id) {
    await supabase.auth.admin.deleteUser(member.user_id).catch(() => {})
  }

  const { error } = await supabase.from('team_members').delete().eq('id', id)
  if (error) return { error: error.message, success: false }

  await logChange({
    action: 'delete', entity_type: 'team', entity_id: id,
    entity_name: member?.name,
    old_value: { role: member?.role },
  })
  revalidatePath('/admin/team')
  return { error: null, success: true }
}

// ── Rolle ändern ───────────────────────────────────────────────────
export async function updateTeamMemberRole(id: string, role: TeamRole) {
  const auth = await requireAdmin()
  if (!auth.ok) return { error: auth.error, success: false }

  // Sicherheit: Es muss immer einen aktiven Admin geben
  if (role !== 'admin') {
    const supabase = createSupabaseAdminClient()
    const { data: member } = await supabase
      .from('team_members').select('role').eq('id', id).single()
    if (member?.role === 'admin') {
      return { error: 'Der Hauptadmin kann sich nicht selbst degradieren.', success: false }
    }
  }

  const supabase = createSupabaseAdminClient()
  const { data: old } = await supabase
    .from('team_members').select('name, role').eq('id', id).single()

  const { error } = await supabase
    .from('team_members').update({ role }).eq('id', id)
  if (error) return { error: error.message, success: false }

  await logChange({
    action: 'update', entity_type: 'team', entity_id: id,
    entity_name: old?.name,
    old_value: { role: old?.role }, new_value: { role },
  })
  revalidatePath('/admin/team')
  return { error: null, success: true }
}

// ── Name + Rolle aktualisieren ─────────────────────────────────────
export async function updateTeamMember(
  id: string,
  _prevState: TeamActionState,
  formData: FormData
): Promise<TeamActionState> {
  const auth = await requireAdmin()
  if (!auth.ok) return { error: auth.error, success: false }

  const supabase = createSupabaseAdminClient()
  const { data: old } = await supabase
    .from('team_members').select('name, role').eq('id', id).single()

  const name = formData.get('name') as string
  const role = formData.get('role') as TeamRole

  if (old?.role === 'admin' && role !== 'admin') {
    return { error: 'Der Hauptadmin kann sich nicht selbst degradieren.', success: false }
  }

  const { error } = await supabase
    .from('team_members').update({ name, role }).eq('id', id)
  if (error) return { error: error.message, success: false }

  await logChange({
    action: 'update', entity_type: 'team', entity_id: id,
    entity_name: name,
    old_value: { name: old?.name, role: old?.role },
    new_value: { name, role },
  })
  revalidatePath('/admin/team')
  return { error: null, success: true }
}

// ── Aktivieren / Deaktivieren ──────────────────────────────────────
export async function toggleTeamMember(id: string, is_active: boolean) {
  const auth = await requireAdmin()
  if (!auth.ok) return { error: auth.error, success: false }

  const supabase = createSupabaseAdminClient()
  const { data: member } = await supabase
    .from('team_members').select('name, role').eq('id', id).single()

  if (member?.role === 'admin' && !is_active) {
    return { error: 'Der Hauptadmin kann nicht deaktiviert werden.', success: false }
  }

  const { error } = await supabase
    .from('team_members').update({ is_active }).eq('id', id)
  if (error) return { error: error.message, success: false }

  await logChange({
    action: 'update', entity_type: 'team', entity_id: id,
    entity_name: member?.name,
    new_value: { is_active },
  })
  revalidatePath('/admin/team')
  return { error: null, success: true }
}
