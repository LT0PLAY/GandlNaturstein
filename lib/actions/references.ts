'use server'

import { revalidatePath } from 'next/cache'
import { createSupabaseAdminClient } from '@/lib/supabase'
import { logChange } from '@/lib/utils/changelog'

function slugify(str: string) {
  return str
    .toLowerCase()
    .replace(/[äöü]/g, (c) => ({ ä: 'ae', ö: 'oe', ü: 'ue' }[c] ?? c))
    .replace(/ß/g, 'ss')
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function readImageUrls(formData: FormData, field: string): string[] {
  const count = Number(formData.get(`${field}_count`) ?? 0)
  const urls: string[] = []
  for (let i = 0; i < count; i++) {
    const url = formData.get(`${field}_${i}`) as string
    if (url) urls.push(url)
  }
  if (urls.length === 0) {
    const single = formData.get(field) as string
    if (single) urls.push(single)
  }
  return urls
}

function parseFormData(formData: FormData, existingImages?: string[]) {
  const title    = formData.get('title') as string
  const slugRaw  = formData.get('slug') as string
  const coverUrls = readImageUrls(formData, 'cover_image')
  const galleryUrls = readImageUrls(formData, 'gallery')

  // Kategorie-Tags: kommagetrennte Eingabe → Array
  const tagsRaw = (formData.get('category_tags') as string) ?? ''
  const category_tags = tagsRaw
    .split(',').map((t) => t.trim()).filter(Boolean)

  return {
    slug:             slugRaw || slugify(title),
    title,
    subtitle:         (formData.get('subtitle') as string) || null,
    category_tags,
    year:             Number(formData.get('year')) || null,
    description:      (formData.get('description') as string) || null,
    cover_image:      coverUrls[0] ?? null,
    images:           [...(existingImages ?? []), ...galleryUrls],
    product_ids:      formData.getAll('product_ids') as string[],
    product_id:       (formData.getAll('product_ids')[0] as string) || null,
    spec_material:    (formData.get('spec_material') as string) || null,
    spec_surface:     (formData.get('spec_surface') as string) || null,
    spec_scope:       (formData.get('spec_scope') as string) || null,
    spec_location:    (formData.get('spec_location') as string) || null,
    meta_title:       (formData.get('meta_title') as string) || null,
    meta_description: (formData.get('meta_description') as string) || null,
    is_published:     formData.get('is_published') === 'true',
    sort_order:       Number(formData.get('sort_order')) || 0,
  }
}

export type ReferenceActionState = { error: string | null; success: boolean; id: string | null }

// ── CREATE ───────────────────────────────────────────────────────────────────
export async function createReference(
  _prev: ReferenceActionState,
  formData: FormData
): Promise<ReferenceActionState> {
  const supabase = createSupabaseAdminClient()
  const data = parseFormData(formData)

  if (!data.title) return { error: 'Titel ist Pflichtfeld.', success: false, id: null }

  const { data: ref, error } = await supabase
    .from('project_references').insert(data).select().single()
  if (error) return { error: error.message, success: false, id: null }

  await logChange({ action: 'create', entity_type: 'reference', entity_id: ref.id, entity_name: data.title, new_value: data })
  revalidatePath('/referenzen')
  revalidatePath('/admin/referenzen')
  revalidatePath('/sitemap.xml')
  return { error: null, success: true, id: ref.id }
}

// ── UPDATE ───────────────────────────────────────────────────────────────────
export async function updateReference(
  id: string,
  _prev: ReferenceActionState,
  formData: FormData
): Promise<ReferenceActionState> {
  const supabase = createSupabaseAdminClient()
  const { data: existing } = await supabase.from('project_references').select('*').eq('id', id).single()
  const existingImages = (existing?.images as string[]) ?? []

  const data = parseFormData(formData, existingImages)

  const { error } = await supabase.from('project_references').update(data).eq('id', id)
  if (error) return { error: error.message, success: false, id }

  await logChange({ action: 'update', entity_type: 'reference', entity_id: id, entity_name: data.title, old_value: existing, new_value: data })
  revalidatePath('/referenzen')
  revalidatePath(`/referenzen/${data.slug}`)
  revalidatePath('/admin/referenzen')
  revalidatePath('/sitemap.xml')
  return { error: null, success: true, id }
}

// ── MOVE TO TRASH (Soft-Delete) ───────────────────────────────────────────────
export async function deleteReference(id: string) {
  const supabase = createSupabaseAdminClient()
  const { data: ref } = await supabase.from('project_references').select('title').eq('id', id).single()
  const { error } = await supabase.from('project_references')
    .update({ deleted_at: new Date().toISOString(), is_published: false })
    .eq('id', id)
  if (error) return { error: error.message, success: false }

  await logChange({ action: 'delete', entity_type: 'reference', entity_id: id, entity_name: ref?.title, new_value: { status: 'moved_to_trash' } })
  revalidatePath('/referenzen')
  revalidatePath('/admin/referenzen')
  revalidatePath('/admin/papierkorb')
  return { error: null, success: true }
}

// ── RESTORE ──────────────────────────────────────────────────────────────────
export async function restoreReference(id: string) {
  const supabase = createSupabaseAdminClient()
  const { data: ref } = await supabase.from('project_references').select('title').eq('id', id).single()
  const { error } = await supabase.from('project_references')
    .update({ deleted_at: null })
    .eq('id', id)
  if (error) return { error: error.message, success: false }

  await logChange({ action: 'update', entity_type: 'reference', entity_id: id, entity_name: ref?.title, new_value: { status: 'restored' } })
  revalidatePath('/admin/referenzen')
  revalidatePath('/admin/papierkorb')
  return { error: null, success: true }
}

// ── PERMANENT DELETE (nur Admin) ─────────────────────────────────────────────
export async function permanentDeleteReference(id: string) {
  const supabase = createSupabaseAdminClient()
  const { data: ref } = await supabase.from('project_references').select('title').eq('id', id).single()
  const { error } = await supabase.from('project_references').delete().eq('id', id)
  if (error) return { error: error.message, success: false }

  await logChange({ action: 'delete', entity_type: 'reference', entity_id: id, entity_name: ref?.title, new_value: { status: 'permanently_deleted' } })
  revalidatePath('/referenzen')
  revalidatePath('/admin/referenzen')
  revalidatePath('/admin/papierkorb')
  return { error: null, success: true }
}

// ── REMOVE GALLERY IMAGE ──────────────────────────────────────────────────────
export async function removeReferenceImage(refId: string, imageUrl: string) {
  const supabase = createSupabaseAdminClient()
  const { data: ref } = await supabase.from('project_references').select('images').eq('id', refId).single()
  const images = ((ref?.images as string[]) ?? []).filter((u) => u !== imageUrl)
  await supabase.from('project_references').update({ images }).eq('id', refId)
  revalidatePath(`/admin/referenzen/${refId}`)
  return { success: true }
}
