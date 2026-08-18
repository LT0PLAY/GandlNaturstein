'use server'

import { revalidatePath } from 'next/cache'
import { createSupabaseAdminClient } from '@/lib/supabase'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { logChange } from '@/lib/utils/changelog'
import type { CategoryBereich, CategoryLocation } from '@/lib/types'

async function getCurrentMemberId(): Promise<string | null> {
  try {
    const client = await createSupabaseServerClient()
    const { data: { user } } = await client.auth.getUser()
    if (!user) return null
    const { data } = await client.from('team_members').select('id').eq('user_id', user.id).single()
    return data?.id ?? null
  } catch { return null }
}

export async function createCategory(formData: FormData) {
  const supabase = createSupabaseAdminClient()
  const bereich  = formData.get('type') as CategoryBereich
  const location = formData.get('location') as CategoryLocation | null

  const data = {
    name:        formData.get('name')        as string,
    slug:        formData.get('slug')        as string,
    type:        bereich,
    location:    location || null,
    description: formData.get('description') as string || null,
    sort_order:  Number(formData.get('sort_order')) || 0,
  }

  const { data: created, error } = await supabase
    .from('categories').insert(data).select().single()
  if (error) return { error: error.message, success: false }

  await logChange({
    action: 'create', entity_type: 'category',
    entity_id: created.id, entity_name: data.name, new_value: data,
  })
  revalidatePath('/admin/kategorien')
  revalidatePath('/aussen')
  revalidatePath('/innen')
  revalidatePath('/sonderanfertigung')
  revalidatePath('/extras')
  revalidatePath('/sitemap.xml')
  return { error: null, success: true }
}

export async function updateCategory(id: string, formData: FormData) {
  const supabase = createSupabaseAdminClient()
  const { data: old } = await supabase.from('categories').select('*').eq('id', id).single()

  const bereich  = formData.get('type') as CategoryBereich
  const location = formData.get('location') as CategoryLocation | null

  const data = {
    name:        formData.get('name')        as string,
    slug:        formData.get('slug')        as string,
    type:        bereich,
    location:    location || null,
    description: formData.get('description') as string || null,
    sort_order:  Number(formData.get('sort_order')) || 0,
  }

  const { error } = await supabase.from('categories').update(data).eq('id', id)
  if (error) return { error: error.message, success: false }

  await logChange({
    action: 'update', entity_type: 'category',
    entity_id: id, entity_name: data.name, old_value: old, new_value: data,
  })
  revalidatePath('/admin/kategorien')
  revalidatePath('/aussen')
  revalidatePath('/innen')
  revalidatePath('/sonderanfertigung')
  revalidatePath('/extras')
  revalidatePath('/sitemap.xml')
  return { error: null, success: true }
}

// Soft-Delete: Kategorie in Papierkorb verschieben
export async function deleteCategory(id: string) {
  const supabase  = createSupabaseAdminClient()
  const memberId  = await getCurrentMemberId()
  const { data: old } = await supabase.from('categories').select('*').eq('id', id).single()

  // Versuche Soft-Delete (falls Migration 008 gelaufen)
  const { error } = await supabase.from('categories').update({
    deleted_at: new Date().toISOString(),
    deleted_by: memberId,
  }).eq('id', id)

  // Fallback: Spalte existiert noch nicht → hart löschen
  if (error?.code === '42703') {
    await supabase.from('categories').delete().eq('id', id)
  } else if (error) {
    return { error: error.message, success: false }
  }

  await logChange({
    action: 'delete', entity_type: 'category',
    entity_id: id, entity_name: old?.name, old_value: old,
  })
  revalidatePath('/admin/kategorien')
  revalidatePath('/admin/papierkorb')
  return { error: null, success: true }
}

// Wiederherstellen
export async function restoreCategory(id: string) {
  const supabase = createSupabaseAdminClient()
  const { data: cat } = await supabase.from('categories').select('name').eq('id', id).single()

  const { error } = await supabase.from('categories').update({
    deleted_at: null,
    deleted_by: null,
  }).eq('id', id)
  if (error) return { error: error.message, success: false }

  await logChange({
    action: 'update', entity_type: 'category',
    entity_id: id, entity_name: cat?.name,
    new_value: { status: 'restored' },
  })
  revalidatePath('/admin/kategorien')
  revalidatePath('/admin/papierkorb')
  return { error: null, success: true }
}

// Endgültig löschen (nur Admin)
export async function permanentDeleteCategory(id: string) {
  const supabase = createSupabaseAdminClient()
  const { data: old } = await supabase.from('categories').select('name').eq('id', id).single()
  const { error } = await supabase.from('categories').delete().eq('id', id)
  if (error) return { error: error.message, success: false }

  await logChange({
    action: 'delete', entity_type: 'category',
    entity_id: id, entity_name: old?.name,
    new_value: { status: 'permanently_deleted' },
  })
  revalidatePath('/admin/kategorien')
  revalidatePath('/admin/papierkorb')
  return { error: null, success: true }
}
