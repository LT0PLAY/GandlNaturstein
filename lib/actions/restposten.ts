'use server'

import { revalidatePath } from 'next/cache'
import { createSupabaseAdminClient } from '@/lib/supabase'
import { logChange } from '@/lib/utils/changelog'

function readImageUrls(formData: FormData, field: string, existing?: string[]): string[] {
  const count = Number(formData.get(`${field}_count`) ?? 0)
  const urls: string[] = [...(existing ?? [])]
  for (let i = 0; i < count; i++) {
    const url = formData.get(`${field}_${i}`) as string
    if (url) urls.push(url)
  }
  return urls
}

function parseFormData(formData: FormData, existingImages?: string[]) {
  return {
    title:         (formData.get('title') as string),
    description:   (formData.get('description') as string) || null,
    price:         formData.get('price') ? Number(formData.get('price')) : null,
    images:        readImageUrls(formData, 'images', existingImages),
    external_link: (formData.get('external_link') as string) || null,
    is_active:     formData.get('is_active') === 'true',
    sort_order:    Number(formData.get('sort_order')) || 0,
    updated_at:    new Date().toISOString(),
  }
}

export type RestpostenActionState = { error: string | null; success: boolean; id: string | null }

export async function createRestposten(
  _prev: RestpostenActionState,
  formData: FormData
): Promise<RestpostenActionState> {
  const supabase = createSupabaseAdminClient()
  const data = parseFormData(formData)
  if (!data.title) return { error: 'Titel ist Pflichtfeld.', success: false, id: null }

  const { data: item, error } = await supabase.from('restposten').insert(data).select().single()
  if (error) return { error: error.message, success: false, id: null }

  await logChange({ action: 'create', entity_type: 'restposten', entity_id: item.id, entity_name: data.title, new_value: data })
  revalidatePath('/restposten')
  revalidatePath('/admin/restposten')
  return { error: null, success: true, id: item.id }
}

export async function updateRestposten(
  id: string,
  _prev: RestpostenActionState,
  formData: FormData
): Promise<RestpostenActionState> {
  const supabase = createSupabaseAdminClient()
  const { data: existing } = await supabase.from('restposten').select('*').eq('id', id).single()
  const existingImages = (existing?.images as string[]) ?? []
  const data = parseFormData(formData, existingImages)

  const { error } = await supabase.from('restposten').update(data).eq('id', id)
  if (error) return { error: error.message, success: false, id }

  await logChange({ action: 'update', entity_type: 'restposten', entity_id: id, entity_name: data.title, old_value: existing, new_value: data })
  revalidatePath('/restposten')
  revalidatePath('/admin/restposten')
  return { error: null, success: true, id }
}

// ── MOVE TO TRASH (Soft-Delete) ───────────────────────────────────────────────
export async function deleteRestposten(id: string) {
  const supabase = createSupabaseAdminClient()
  const { data: item } = await supabase.from('restposten').select('title').eq('id', id).single()
  const { error } = await supabase.from('restposten')
    .update({ deleted_at: new Date().toISOString(), is_active: false })
    .eq('id', id)
  if (error) return { error: error.message, success: false }

  await logChange({ action: 'delete', entity_type: 'restposten', entity_id: id, entity_name: item?.title, new_value: { status: 'moved_to_trash' } })
  revalidatePath('/restposten')
  revalidatePath('/admin/restposten')
  revalidatePath('/admin/papierkorb')
  return { error: null, success: true }
}

// ── RESTORE ──────────────────────────────────────────────────────────────────
export async function restoreRestposten(id: string) {
  const supabase = createSupabaseAdminClient()
  const { data: item } = await supabase.from('restposten').select('title').eq('id', id).single()
  const { error } = await supabase.from('restposten').update({ deleted_at: null }).eq('id', id)
  if (error) return { error: error.message, success: false }

  await logChange({ action: 'update', entity_type: 'restposten', entity_id: id, entity_name: item?.title, new_value: { status: 'restored' } })
  revalidatePath('/admin/restposten')
  revalidatePath('/admin/papierkorb')
  return { error: null, success: true }
}

// ── PERMANENT DELETE ──────────────────────────────────────────────────────────
export async function permanentDeleteRestposten(id: string) {
  const supabase = createSupabaseAdminClient()
  const { data: item } = await supabase.from('restposten').select('title').eq('id', id).single()
  const { error } = await supabase.from('restposten').delete().eq('id', id)
  if (error) return { error: error.message, success: false }

  await logChange({ action: 'delete', entity_type: 'restposten', entity_id: id, entity_name: item?.title, new_value: { status: 'permanently_deleted' } })
  revalidatePath('/admin/papierkorb')
  return { error: null, success: true }
}

export async function removeRestpostenImage(id: string, imageUrl: string) {
  const supabase = createSupabaseAdminClient()
  const { data: item } = await supabase.from('restposten').select('images').eq('id', id).single()
  const images = ((item?.images as string[]) ?? []).filter((u) => u !== imageUrl)
  await supabase.from('restposten').update({ images }).eq('id', id)
  revalidatePath(`/admin/restposten/${id}`)
  return { success: true }
}
