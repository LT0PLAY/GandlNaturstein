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
  // Manuell hochgeladene Fotos + gezielt vom verknüpften Produkt übernommene Fotos zusammenführen
  const uploadedImages = readImageUrls(formData, 'images', existingImages)
  const productImages  = readImageUrls(formData, 'product_images')
  const images = [...uploadedImages, ...productImages.filter((u) => !uploadedImages.includes(u))]

  return {
    number:      Number(formData.get('number')) || 0,
    name:        (formData.get('name') as string),
    description: (formData.get('description') as string) || null,
    images,
    product_id:  (formData.get('product_id') as string) || null,
    is_active:   formData.get('is_active') === 'true',
    sort_order:  Number(formData.get('sort_order')) || 0,
    updated_at:  new Date().toISOString(),
  }
}

// Wenn ein Produkt verknüpft ist und Name/Beschreibung/Bilder leer gelassen wurden,
// aus dem verknüpften Produkt übernehmen.
async function fillFromProduct(
  supabase: ReturnType<typeof createSupabaseAdminClient>,
  data: Awaited<ReturnType<typeof parseFormData>>
) {
  if (!data.product_id) return data
  const { data: product } = await supabase
    .from('products')
    .select('name, description, images, thumbnail')
    .eq('id', data.product_id)
    .single()
  if (!product) return data

  return {
    ...data,
    name:        data.name?.trim() ? data.name : product.name,
    description: data.description ?? product.description ?? null,
    images:      data.images.length > 0
      ? data.images
      : [product.thumbnail, ...(product.images ?? [])].filter(Boolean) as string[],
  }
}

export type GuideActionState = { error: string | null; success: boolean; id: string | null }

export async function createGuideEntry(
  _prev: GuideActionState,
  formData: FormData
): Promise<GuideActionState> {
  const supabase = createSupabaseAdminClient()
  let data = parseFormData(formData)
  data = await fillFromProduct(supabase, data)
  if (!data.name)          return { error: 'Name ist Pflichtfeld (oder Produkt verknüpfen).', success: false, id: null }
  if (!data.number || data.number < 1) return { error: 'Nummer ist Pflichtfeld (größer als 0).', success: false, id: null }

  const { data: item, error } = await supabase.from('guide_entries').insert(data).select().single()
  if (error) {
    const msg = error.code === '23505' ? `Die Nummer ${data.number} ist bereits vergeben.` : error.message
    return { error: msg, success: false, id: null }
  }

  await logChange({ action: 'create', entity_type: 'guide_entry', entity_id: item.id, entity_name: `#${data.number} ${data.name}`, new_value: data })
  revalidatePath('/ausstellungsguide')
  revalidatePath('/admin/guide')
  return { error: null, success: true, id: item.id }
}

export async function updateGuideEntry(
  id: string,
  _prev: GuideActionState,
  formData: FormData
): Promise<GuideActionState> {
  const supabase = createSupabaseAdminClient()
  const { data: existing } = await supabase.from('guide_entries').select('*').eq('id', id).single()
  const existingImages = (existing?.images as string[]) ?? []
  let data = parseFormData(formData, existingImages)
  data = await fillFromProduct(supabase, data)

  const { error } = await supabase.from('guide_entries').update(data).eq('id', id)
  if (error) {
    const msg = error.code === '23505' ? `Die Nummer ${data.number} ist bereits vergeben.` : error.message
    return { error: msg, success: false, id }
  }

  await logChange({ action: 'update', entity_type: 'guide_entry', entity_id: id, entity_name: `#${data.number} ${data.name}`, old_value: existing, new_value: data })
  revalidatePath('/ausstellungsguide')
  revalidatePath('/admin/guide')
  return { error: null, success: true, id }
}

// ── MOVE TO TRASH (Soft-Delete) ───────────────────────────────────────────────
export async function deleteGuideEntry(id: string) {
  const supabase = createSupabaseAdminClient()
  const { data: item } = await supabase.from('guide_entries').select('number, name').eq('id', id).single()
  const { error } = await supabase.from('guide_entries')
    .update({ deleted_at: new Date().toISOString(), is_active: false })
    .eq('id', id)
  if (error) return { error: error.message, success: false }

  await logChange({ action: 'delete', entity_type: 'guide_entry', entity_id: id, entity_name: item ? `#${item.number} ${item.name}` : undefined, new_value: { status: 'moved_to_trash' } })
  revalidatePath('/ausstellungsguide')
  revalidatePath('/admin/guide')
  revalidatePath('/admin/papierkorb')
  return { error: null, success: true }
}

// ── RESTORE ──────────────────────────────────────────────────────────────────
export async function restoreGuideEntry(id: string) {
  const supabase = createSupabaseAdminClient()
  const { data: item } = await supabase.from('guide_entries').select('number, name').eq('id', id).single()
  const { error } = await supabase.from('guide_entries').update({ deleted_at: null }).eq('id', id)
  if (error) return { error: error.message, success: false }

  await logChange({ action: 'update', entity_type: 'guide_entry', entity_id: id, entity_name: item ? `#${item.number} ${item.name}` : undefined, new_value: { status: 'restored' } })
  revalidatePath('/admin/guide')
  revalidatePath('/admin/papierkorb')
  return { error: null, success: true }
}

// ── PERMANENT DELETE ──────────────────────────────────────────────────────────
export async function permanentDeleteGuideEntry(id: string) {
  const supabase = createSupabaseAdminClient()
  const { data: item } = await supabase.from('guide_entries').select('number, name').eq('id', id).single()
  const { error } = await supabase.from('guide_entries').delete().eq('id', id)
  if (error) return { error: error.message, success: false }

  await logChange({ action: 'delete', entity_type: 'guide_entry', entity_id: id, entity_name: item ? `#${item.number} ${item.name}` : undefined, new_value: { status: 'permanently_deleted' } })
  revalidatePath('/admin/papierkorb')
  return { error: null, success: true }
}

export async function removeGuideImage(id: string, imageUrl: string) {
  const supabase = createSupabaseAdminClient()
  const { data: item } = await supabase.from('guide_entries').select('images').eq('id', id).single()
  const images = ((item?.images as string[]) ?? []).filter((u) => u !== imageUrl)
  await supabase.from('guide_entries').update({ images }).eq('id', id)
  revalidatePath(`/admin/guide/${id}`)
  return { success: true }
}
