'use server'

import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { createSupabaseAdminClient } from '@/lib/supabase'

export async function login(formData: FormData) {
  const email    = formData.get('email')    as string
  const password = formData.get('password') as string

  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })

  if (error || !data.user) {
    return { error: 'E-Mail oder Passwort falsch.', success: false }
  }

  // Deaktivierte Mitarbeiter dürfen sich trotz gültigem Supabase-Passwort nicht
  // einloggen — team_members.is_active ist die eigentliche Zugriffs-Schranke.
  const { data: member } = await supabase
    .from('team_members')
    .select('is_active')
    .eq('user_id', data.user.id)
    .maybeSingle()

  if (!member || !member.is_active) {
    await supabase.auth.signOut()
    return { error: 'Dieses Konto wurde deaktiviert. Wende dich an den Administrator.', success: false }
  }

  redirect('/admin')
}

export async function logout() {
  const supabase = await createSupabaseServerClient()
  await supabase.auth.signOut()
  redirect('/admin/login')
}

export async function updatePassword(password: string, activateInvite = false) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { error } = await supabase.auth.updateUser({ password })
  if (error) return { error: error.message, success: false }

  // Neu eingeladene Mitarbeiter starten inaktiv ("erst aktiv nach Passwort-Setzen") —
  // sobald die Einladung akzeptiert (Passwort gesetzt) wurde, hier freischalten.
  // Bewusst NUR bei echten Einladungs-Links (activateInvite=true von der Seite gesetzt),
  // damit ein bewusst deaktivierter Mitarbeiter sich nicht über "Passwort vergessen"
  // selbst wieder aktivieren kann.
  if (activateInvite && user) {
    await createSupabaseAdminClient()
      .from('team_members')
      .update({ is_active: true })
      .eq('user_id', user.id)
      .eq('is_active', false)
  }

  return { error: null, success: true }
}

export async function getCurrentUser() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  // Team-Member-Eintrag laden für Name + Rolle
  const { data: member } = await supabase
    .from('team_members')
    .select('id, name, email, role')
    .eq('user_id', user.id)
    .single()

  // WICHTIG: kein Fallback auf "role: admin" mehr, wenn kein team_members-Eintrag
  // gefunden wird (z.B. weil das Konto zwischenzeitlich gelöscht wurde) — das hätte
  // sonst versehentlich vollen Admin-Zugriff gewährt. Kein Team-Eintrag = kein Zugriff.
  return member ?? null
}
