'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { createSupabaseAdminClient } from '@/lib/supabase'
import { logChange } from '@/lib/utils/changelog'
import { getCurrentUser } from '@/lib/actions/auth'
import {
  CUSTOMER_SESSION_COOKIE,
  SESSION_MAX_AGE_SECONDS,
  createCustomerSessionToken,
  hashPassword,
  generateSalt,
  verifyPassword,
} from '@/lib/customerSession'

const SUPABASE_CONFIGURED = process.env.NEXT_PUBLIC_SUPABASE_URL && !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')

async function requireAdmin() {
  const user = await getCurrentUser()
  if (!user || (user.role as string) !== 'admin') redirect('/admin')
}

// ============================================================
// ZUGANGSDATEN (Admin legt Benutzername/Passwort für den Kunden fest)
// ============================================================

export async function getCustomerAccess() {
  if (!SUPABASE_CONFIGURED) return null
  const supabase = createSupabaseAdminClient()
  const { data } = await supabase.from('customer_access').select('id, username, updated_at').eq('id', 'default').maybeSingle()
  return data
}

export type CredentialsActionState = { error: string | null; success: boolean }

export async function setCustomerCredentials(
  _prev: CredentialsActionState,
  formData: FormData
): Promise<CredentialsActionState> {
  if (SUPABASE_CONFIGURED) await requireAdmin()

  const username = (formData.get('username') as string || '').trim()
  const password = (formData.get('password') as string || '')

  if (!username) return { error: 'Benutzername ist Pflichtfeld.', success: false }
  if (password && password.length < 6) return { error: 'Passwort muss mindestens 6 Zeichen haben.', success: false }

  const supabase = createSupabaseAdminClient()
  const { data: existing } = await supabase.from('customer_access').select('id').eq('id', 'default').maybeSingle()

  // Passwort ist beim Bearbeiten optional — leer lassen = Passwort unverändert.
  if (!existing && !password) {
    return { error: 'Beim erstmaligen Anlegen ist ein Passwort Pflicht.', success: false }
  }

  const update: Record<string, unknown> = { id: 'default', username, updated_at: new Date().toISOString() }
  if (password) {
    const salt = generateSalt()
    update.password_salt = salt
    update.password_hash = hashPassword(password, salt)
  }

  const { error } = await supabase.from('customer_access').upsert(update, { onConflict: 'id' })
  if (error) return { error: error.message, success: false }

  await logChange({ action: existing ? 'update' : 'create', entity_type: 'customer_access', entity_id: 'default', entity_name: username, new_value: { username, password_changed: !!password } })
  revalidatePath('/admin/btob')
  return { error: null, success: true }
}

// ============================================================
// LOGIN / LOGOUT (Kunde)
// ============================================================

export type CustomerLoginState = { error: string | null }

export async function customerLogin(
  _prev: CustomerLoginState,
  formData: FormData
): Promise<CustomerLoginState> {
  const username = (formData.get('username') as string || '').trim()
  const password = (formData.get('password') as string || '')

  if (!username || !password) return { error: 'Bitte Benutzername und Passwort eingeben.' }

  const supabase = createSupabaseAdminClient()
  const { data: access } = await supabase
    .from('customer_access')
    .select('username, password_hash, password_salt')
    .eq('id', 'default')
    .maybeSingle()

  if (!access || access.username !== username || !verifyPassword(password, access.password_salt, access.password_hash)) {
    return { error: 'Benutzername oder Passwort falsch.' }
  }

  const cookieStore = await cookies()
  cookieStore.set(CUSTOMER_SESSION_COOKIE, createCustomerSessionToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_MAX_AGE_SECONDS,
  })

  redirect('/btob')
}

export async function customerLogout() {
  const cookieStore = await cookies()
  cookieStore.delete(CUSTOMER_SESSION_COOKIE)
  redirect('/btob/login')
}

// ============================================================
// DOKUMENTE (PDFs im Kundenbereich)
// ============================================================

export async function getCustomerDocuments() {
  if (!SUPABASE_CONFIGURED) return []
  const supabase = createSupabaseAdminClient()
  const { data } = await supabase.from('customer_documents').select('*').order('sort_order').order('created_at', { ascending: false })
  return data ?? []
}

export async function getCustomerDocument(id: string) {
  const supabase = createSupabaseAdminClient()
  const { data } = await supabase.from('customer_documents').select('*').eq('id', id).maybeSingle()
  return data
}

export type DocumentActionState = { error: string | null; success: boolean; id: string | null }

function parseDocumentForm(formData: FormData) {
  return {
    title:       (formData.get('title') as string || '').trim(),
    info_text:   (formData.get('info_text') as string) || null,
    thumbnail:   (formData.get('thumbnail') as string) || null,
    pdf_url:     (formData.get('pdf_url') as string) || null,
    sort_order:  Number(formData.get('sort_order')) || 0,
  }
}

export async function createCustomerDocument(
  _prev: DocumentActionState,
  formData: FormData
): Promise<DocumentActionState> {
  if (SUPABASE_CONFIGURED) await requireAdmin()
  const data = parseDocumentForm(formData)
  if (!data.title) return { error: 'Titel ist Pflichtfeld.', success: false, id: null }
  if (!data.pdf_url) return { error: 'Bitte ein PDF hochladen.', success: false, id: null }

  const supabase = createSupabaseAdminClient()
  const { data: doc, error } = await supabase.from('customer_documents').insert(data).select().single()
  if (error) return { error: error.message, success: false, id: null }

  await logChange({ action: 'create', entity_type: 'customer_document', entity_id: doc.id, entity_name: data.title, new_value: data })
  revalidatePath('/admin/btob')
  revalidatePath('/btob')
  return { error: null, success: true, id: doc.id }
}

export async function updateCustomerDocument(
  id: string,
  _prev: DocumentActionState,
  formData: FormData
): Promise<DocumentActionState> {
  if (SUPABASE_CONFIGURED) await requireAdmin()
  const data = parseDocumentForm(formData)
  if (!data.title) return { error: 'Titel ist Pflichtfeld.', success: false, id }
  if (!data.pdf_url) return { error: 'Bitte ein PDF hochladen.', success: false, id }

  const supabase = createSupabaseAdminClient()
  const { data: existing } = await supabase.from('customer_documents').select('*').eq('id', id).single()
  const { error } = await supabase.from('customer_documents').update({ ...data, updated_at: new Date().toISOString() }).eq('id', id)
  if (error) return { error: error.message, success: false, id }

  await logChange({ action: 'update', entity_type: 'customer_document', entity_id: id, entity_name: data.title, old_value: existing, new_value: data })
  revalidatePath('/admin/btob')
  revalidatePath('/btob')
  return { error: null, success: true, id }
}

export async function deleteCustomerDocument(id: string) {
  if (SUPABASE_CONFIGURED) await requireAdmin()
  const supabase = createSupabaseAdminClient()
  const { data: doc } = await supabase.from('customer_documents').select('title').eq('id', id).single()
  const { error } = await supabase.from('customer_documents').delete().eq('id', id)
  if (error) return { error: error.message, success: false }

  await logChange({ action: 'delete', entity_type: 'customer_document', entity_id: id, entity_name: doc?.title, new_value: { status: 'deleted' } })
  revalidatePath('/admin/btob')
  revalidatePath('/btob')
  return { error: null, success: true }
}
