'use server'

import { revalidatePath } from 'next/cache'
import { createSupabaseAdminClient } from '@/lib/supabase'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { logChange } from '@/lib/utils/changelog'

// ── Hilfsfunktion: Aktuellen Team-Member holen ──────────────────────────────
async function getCurrentMemberId(): Promise<string | null> {
  try {
    const serverClient = await createSupabaseServerClient()
    const { data: { user } } = await serverClient.auth.getUser()
    if (!user) return null
    const { data: member } = await serverClient
      .from('team_members').select('id').eq('user_id', user.id).single()
    return member?.id ?? null
  } catch { return null }
}

// ── URLs aus FormData lesen (ImageUploader schickt hidden inputs) ────────────
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

export type ProductActionState = { error: string | null; success: boolean; id: string | null }

/** Alle öffentlichen Produkt-Listingseiten + Detailseite + Sitemap invalidieren */
function revalidatePublicProductPaths(slug?: string) {
  revalidatePath('/aussen')
  revalidatePath('/innen')
  revalidatePath('/sonderanfertigung')
  revalidatePath('/extras')
  revalidatePath('/sitemap.xml')
  if (slug) {
    revalidatePath(`/aussen/${slug}`)
    revalidatePath(`/innen/${slug}`)
    revalidatePath(`/sonderanfertigung/${slug}`)
    revalidatePath(`/extras/${slug}`)
  }
}

/** Slug bereinigen: Leerzeichen → Bindestrich, nur a-z 0-9 - */
function sanitizeSlug(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/[äöü]/g, (c) => ({ ä: 'ae', ö: 'oe', ü: 'ue' }[c] ?? c))
    .replace(/ß/g, 'ss')
    .normalize('NFD').replace(/[̀-ͯ]/g, '') // andere Akzente abbauen
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

// ── CREATE ───────────────────────────────────────────────────────────────────
export async function createProduct(
  _prevState: ProductActionState,
  formData: FormData
): Promise<ProductActionState> {
  const supabase = createSupabaseAdminClient()

  const name = formData.get('name') as string
  const slug = sanitizeSlug(formData.get('slug') as string || name)

  if (!name || !slug) return { error: 'Name und Slug sind Pflichtfelder.', success: false, id: null }

  const thumbnailUrls = readImageUrls(formData, 'thumbnail')
  const galleryUrls   = readImageUrls(formData, 'gallery')

  const data = {
    name,
    slug,
    article_number: formData.get('article_number') as string || null,
    description: formData.get('description') as string || null,
    category_id: formData.get('category_id') as string || null,
    material:    formData.get('material')    as string || null,
    surface:     formData.get('surface')     as string || null,
    format:      formData.get('format')      as string || null,
    origin:      formData.get('origin')      as string || null,
    is_active:   formData.get('is_active') === 'true',
    show_price:  formData.get('show_price') === 'true',
    price:       formData.get('price') ? Number(formData.get('price')) : null,
    sort_order:  Number(formData.get('sort_order')) || 0,
    thumbnail:   thumbnailUrls[0] ?? null,
    images:      galleryUrls,
    image_alts:  {} as Record<string, string>,
  }

  if (data.thumbnail) {
    data.image_alts[data.thumbnail] = formData.get('thumbnail_alt') as string || data.name
  }

  const { data: product, error } = await supabase
    .from('products').insert(data).select().single()
  if (error) return { error: `Fehler: ${error.message}`, success: false, id: null }

  await logChange({ action: 'create', entity_type: 'product', entity_id: product.id, entity_name: data.name, new_value: data })
  revalidatePath('/admin/produkte')
  revalidatePublicProductPaths(data.slug)
  return { error: null, success: true, id: product.id }
}

// ── UPDATE ───────────────────────────────────────────────────────────────────
export async function updateProduct(id: string, _prevState: ProductActionState, formData: FormData): Promise<ProductActionState> {
  const supabase = createSupabaseAdminClient()
  const { data: existing } = await supabase.from('products').select('*').eq('id', id).single()

  const thumbnailUrls  = readImageUrls(formData, 'thumbnail')
  const newGalleryUrls = readImageUrls(formData, 'gallery')
  const existingGallery = (existing?.images as string[]) ?? []

  const data: Record<string, unknown> = {
    name:           formData.get('name')        as string,
    slug:           sanitizeSlug(formData.get('slug') as string || formData.get('name') as string),
    article_number: formData.get('article_number') as string || null,
    description:    formData.get('description') as string || null,
    category_id:    formData.get('category_id') as string || null,
    material:       formData.get('material')    as string || null,
    surface:        formData.get('surface')     as string || null,
    format:         formData.get('format')      as string || null,
    origin:         formData.get('origin')      as string || null,
    is_active:      formData.get('is_active') === 'true',
    show_price:     formData.get('show_price') === 'true',
    price:          formData.get('price') ? Number(formData.get('price')) : null,
    sort_order:     Number(formData.get('sort_order')) || 0,
    images:         [...existingGallery, ...newGalleryUrls],
  }

  if (thumbnailUrls.length > 0) data.thumbnail = thumbnailUrls[0]

  const alts: Record<string, string> = { ...((existing?.image_alts as Record<string, string>) ?? {}) }
  if (data.thumbnail) alts[data.thumbnail as string] = formData.get('thumbnail_alt') as string || data.name as string
  data.image_alts = alts

  const { error } = await supabase.from('products').update(data).eq('id', id)
  if (error) return { error: `Fehler: ${error.message}`, success: false, id }

  await logChange({ action: 'update', entity_type: 'product', entity_id: id, entity_name: data.name as string, old_value: existing, new_value: data })

  revalidatePath('/admin/produkte')
  revalidatePublicProductPaths(data.slug as string)
  if (existing?.slug && existing.slug !== data.slug) revalidatePublicProductPaths(existing.slug)
  return { error: null, success: true, id }
}

// ── Direkt in Papierkorb verschieben (ohne Genehmigungsschritt) ──────────────
export async function moveProductToTrash(id: string) {
  const supabase = createSupabaseAdminClient()
  const memberId = await getCurrentMemberId()

  const { data: product } = await supabase.from('products').select('name').eq('id', id).single()
  const { error } = await supabase.from('products').update({
    deleted_at:          new Date().toISOString(),
    deleted_by:          memberId,
    delete_pending:      false,
    delete_requested_by: null,
    delete_requested_at: null,
    is_active:           false,
  }).eq('id', id)

  if (error) return { error: error.message, success: false }

  await logChange({
    action:      'delete',
    entity_type: 'product',
    entity_id:   id,
    entity_name: product?.name,
    new_value:   { status: 'moved_to_trash' },
  })
  revalidatePath('/admin/produkte')
  revalidatePath('/admin/papierkorb')
  revalidatePublicProductPaths()
  return { error: null, success: true }
}

// ── SOFT DELETE: Editor stellt Löschantrag ───────────────────────────────────
export async function requestDeleteProduct(id: string) {
  const supabase   = createSupabaseAdminClient()
  const memberId   = await getCurrentMemberId()

  const { data: product } = await supabase.from('products').select('name').eq('id', id).single()
  const { error } = await supabase.from('products').update({
    delete_pending:        true,
    delete_requested_by:   memberId,
    delete_requested_at:   new Date().toISOString(),
  }).eq('id', id)

  if (error) return { error: error.message, success: false }

  await logChange({
    action:      'delete',
    entity_type: 'product',
    entity_id:   id,
    entity_name: product?.name,
    new_value:   { status: 'delete_requested', requested_by: memberId },
  })
  revalidatePath('/admin/produkte')
  revalidatePath('/admin/papierkorb')
  return { error: null, success: true }
}

// ── Admin: Löschantrag genehmigen → Papierkorb ───────────────────────────────
export async function approveDeleteProduct(id: string) {
  const supabase = createSupabaseAdminClient()
  const memberId = await getCurrentMemberId()

  const { data: product } = await supabase.from('products').select('name').eq('id', id).single()
  const { error } = await supabase.from('products').update({
    deleted_at:          new Date().toISOString(),
    deleted_by:          memberId,
    delete_pending:      false,
    delete_requested_by: null,
    delete_requested_at: null,
    is_active:           false,
  }).eq('id', id)

  if (error) return { error: error.message, success: false }

  await logChange({
    action:      'delete',
    entity_type: 'product',
    entity_id:   id,
    entity_name: product?.name,
    new_value:   { status: 'moved_to_trash', approved_by: memberId },
  })
  revalidatePath('/admin/produkte')
  revalidatePath('/admin/papierkorb')
  revalidatePublicProductPaths()
  return { error: null, success: true }
}

// ── Admin: Löschantrag ablehnen ──────────────────────────────────────────────
export async function rejectDeleteProduct(id: string) {
  const supabase = createSupabaseAdminClient()

  const { data: product } = await supabase.from('products').select('name').eq('id', id).single()
  const { error } = await supabase.from('products').update({
    delete_pending:      false,
    delete_requested_by: null,
    delete_requested_at: null,
  }).eq('id', id)

  if (error) return { error: error.message, success: false }

  await logChange({
    action:      'update',
    entity_type: 'product',
    entity_id:   id,
    entity_name: product?.name,
    new_value:   { status: 'delete_rejected' },
  })
  revalidatePath('/admin/produkte')
  revalidatePath('/admin/papierkorb')
  return { error: null, success: true }
}

// ── Admin: Aus Papierkorb wiederherstellen ────────────────────────────────────
export async function restoreProduct(id: string) {
  const supabase = createSupabaseAdminClient()

  const { data: product } = await supabase.from('products').select('name').eq('id', id).single()
  const { error } = await supabase.from('products').update({
    deleted_at:  null,
    deleted_by:  null,
    is_active:   false, // bleibt inaktiv bis Admin manuell aktiviert
  }).eq('id', id)

  if (error) return { error: error.message, success: false }

  await logChange({
    action:      'update',
    entity_type: 'product',
    entity_id:   id,
    entity_name: product?.name,
    new_value:   { status: 'restored_from_trash' },
  })
  revalidatePath('/admin/produkte')
  revalidatePath('/admin/papierkorb')
  revalidatePublicProductPaths()
  return { error: null, success: true }
}

// ── Admin: Endgültig löschen (aus Papierkorb) ────────────────────────────────
export async function permanentDeleteProduct(id: string) {
  const supabase = createSupabaseAdminClient()

  const { data: old } = await supabase.from('products').select('name').eq('id', id).single()
  const { error } = await supabase.from('products').delete().eq('id', id)

  if (error) return { error: error.message, success: false }

  await logChange({
    action:      'delete',
    entity_type: 'product',
    entity_id:   id,
    entity_name: old?.name,
    new_value:   { status: 'permanently_deleted' },
  })
  revalidatePath('/admin/produkte')
  revalidatePath('/admin/papierkorb')
  return { error: null, success: true }
}

// ── Direktlöschung (nur Admin, überspringt Papierkorb) ───────────────────────
export async function deleteProduct(id: string) {
  return permanentDeleteProduct(id)
}

// ── Galerie-Bilder entfernen ──────────────────────────────────────────────────
export async function removeGalleryImage(productId: string, imageUrl: string) {
  const supabase = createSupabaseAdminClient()
  const { data: product } = await supabase.from('products').select('images, image_alts').eq('id', productId).single()
  const images = ((product?.images as string[]) ?? []).filter((u) => u !== imageUrl)
  const alts = { ...(product?.image_alts as object ?? {}) }
  delete (alts as Record<string, string>)[imageUrl]
  await supabase.from('products').update({ images, image_alts: alts }).eq('id', productId)
  revalidatePath(`/admin/produkte/${productId}`)
  return { success: true }
}

export async function removeThumbnail(productId: string) {
  const supabase = createSupabaseAdminClient()
  await supabase.from('products').update({ thumbnail: null }).eq('id', productId)
  revalidatePath(`/admin/produkte/${productId}`)
  return { success: true }
}

// ── Monitoring: Abgelaufene Logs löschen (Admin-Action) ──────────────────────
export async function purgeExpiredLogs() {
  const supabase = createSupabaseAdminClient()
  const cutoff = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString()

  // Erst zählen, dann löschen
  const { count } = await supabase
    .from('change_log')
    .select('*', { count: 'exact', head: true })
    .lt('created_at', cutoff)

  const { error } = await supabase
    .from('change_log')
    .delete()
    .lt('created_at', cutoff)

  if (error) return { error: error.message, success: false, count: 0 }
  revalidatePath('/admin/monitoring')
  return { error: null, success: true, count: count ?? 0 }
}
