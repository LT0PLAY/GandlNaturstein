'use server'

import { revalidatePath } from 'next/cache'
import { createSupabaseAdminClient } from '@/lib/supabase'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { logChange } from '@/lib/utils/changelog'
import type { TeamRole } from '@/lib/types'

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
export async function createTeamMember(formData: FormData) {
  const auth = await requireAdmin()
  if (!auth.ok) return { error: auth.error, success: false }

  const supabase = createSupabaseAdminClient()
  const email = formData.get('email') as string
  const name  = formData.get('name')  as string
  const role  = formData.get('role')  as TeamRole

  // Einladungs-E-Mail via Supabase Auth
  const { data: authData, error: authError } =
    await supabase.auth.admin.inviteUserByEmail(email, {
      data: { name, role },
    })
  if (authError) return { error: authError.message, success: false }

  const { error } = await supabase.from('team_members').insert({
    user_id:   authData.user.id,
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
export async function updateTeamMember(id: string, formData: FormData) {
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
