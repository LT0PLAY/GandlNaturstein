'use server'

import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase-server'

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

export async function requestPasswordReset(email: string) {
  const supabase = await createSupabaseServerClient()
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteUrl}/admin/passwort-neu-setzen`,
  })
  if (error) return { error: error.message, success: false }
  return { error: null, success: true }
}

export async function updatePassword(password: string) {
  const supabase = await createSupabaseServerClient()
  const { error } = await supabase.auth.updateUser({ password })
  if (error) return { error: error.message, success: false }
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

  return member ?? { id: user.id, name: user.email, email: user.email, role: 'admin' }
}
