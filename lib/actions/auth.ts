'use server'

import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { createSupabaseAdminClient } from '@/lib/supabase'
import { sendBrandedEmail } from '@/lib/email/resend'
import { passwordResetEmailHtml } from '@/lib/email/templates'

export async function login(formData: FormData) {
  const email    = formData.get('email')    as string
  const password = formData.get('password') as string

  const supabase = await createSupabaseServerClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    return { error: 'E-Mail oder Passwort falsch.', success: false }
  }

  redirect('/admin')
}

export async function logout() {
  const supabase = await createSupabaseServerClient()
  await supabase.auth.signOut()
  redirect('/admin/login')
}

export type PasswordResetState = {
  error:      string | null
  success:    boolean
  /** Nur gesetzt, wenn die Mail nicht automatisch verschickt werden konnte
   *  (z.B. RESEND_API_KEY fehlt) — Admin kann den Link dann manuell teilen. */
  resetLink?:     string | null
  emailWarning?:  string | null
}

export async function requestPasswordReset(email: string): Promise<PasswordResetState> {
  const admin    = createSupabaseAdminClient()
  const siteUrl  = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

  // Nur für bekannte, aktive Team-Mitglieder tatsächlich einen Link erzeugen —
  // bei unbekannten E-Mails geben wir trotzdem "erfolgreich" zurück, damit sich
  // über dieses öffentliche Formular nicht herausfinden lässt, welche
  // E-Mail-Adressen im System existieren.
  const { data: member } = await admin
    .from('team_members')
    .select('id')
    .eq('email', email)
    .eq('is_active', true)
    .maybeSingle()

  if (!member) return { error: null, success: true }

  // Eigene Bestätigungsroute statt Supabase-Standard-Link — funktioniert
  // zuverlässig unabhängig vom Flow-Typ (siehe app/auth/confirm/route.ts) und
  // hängt nicht am rate-limitierten Standard-Mailer von Supabase.
  const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
    type: 'recovery',
    email,
    options: { redirectTo: `${siteUrl}/admin/passwort-neu-setzen` },
  })
  if (linkError) return { error: null, success: true }

  const hashedToken = (linkData as any)?.properties?.hashed_token as string | undefined
  if (!hashedToken) return { error: null, success: true }

  const actionLink = `${siteUrl}/auth/confirm?token_hash=${hashedToken}&type=recovery&next=${encodeURIComponent('/admin/passwort-neu-setzen')}`

  const emailResult = await sendBrandedEmail({
    to:      email,
    subject: 'Passwort zurücksetzen – Gandl Natursteine Admin',
    html:    passwordResetEmailHtml({ actionLink }),
  })

  if (emailResult.sent) {
    return { error: null, success: true }
  }

  // Kein Mailversand konfiguriert — Link zum manuellen Teilen zurückgeben.
  return {
    error:        null,
    success:      true,
    resetLink:    actionLink,
    emailWarning: emailResult.error ?? 'E-Mail konnte nicht verschickt werden.',
  }
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
