'use server'

import { revalidatePath } from 'next/cache'
import { createSupabaseAdminClient } from '@/lib/supabase'
import { logChange } from '@/lib/utils/changelog'
import { requireTeamMember, requireAdminMember } from '@/lib/actions/authGuard'

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

// ── Größenvarianten aus FormData lesen (bis zu MAX_SIZES Zeilen) ────────────
const MAX_SIZES = 8

function readSizes(formData: FormData): Array<{ label: string; price: number | null; article_number: string | null; surfaces: string[] }> {
  const sizes: Array<{ label: string; price: number | null; article_number: string | null; surfaces: string[] }> = []
  for (let i = 0; i < MAX_SIZES; i++) {
    const label = (formData.get(`size_label_${i}`) as string || '').trim()
    if (!label) continue
    const priceRaw = formData.get(`size_price_${i}`) as string
    const articleRaw = (formData.get(`size_article_${i}`) as string || '').trim()
    const surfaces = formData.getAll(`size_surfaces_${i}`).map((v) => String(v)).filter(Boolean)
    sizes.push({
      label,
      price: priceRaw ? Number(priceRaw) : null,
      article_number: articleRaw || null,
      surfaces,
    })
  }
  return sizes
}

// ── Oberflächen-Varianten aus FormData lesen (bis zu MAX_SURFACES Zeilen) ───
const MAX_SURFACES = 8

function readSurfaces(formData: FormData): string[] {
  const surfaces: string[] = []
  for (let i = 0; i < MAX_SURFACES; i++) {
    const label = (formData.get(`surface_label_${i}`) as string || '').trim()
    if (label) surfaces.push(label)
  }
  return surfaces
}

// ── Mehrfachkategorien aus FormData lesen (Checkboxen "category_ids") ───────
function readCategoryIds(formData: FormData, primaryCategoryId: string | null): string[] {
  const extra = formData.getAll('category_ids').map((v) => String(v)).filter(Boolean)
  const all = new Set<string>(extra)
  if (primaryCategoryId) all.add(primaryCategoryId)
  return [...all]
}

// ── product_categories-Tabelle mit der aktuellen Auswahl synchronisieren ────
// Tolerant: falls die Tabelle noch nicht existiert (Migration 024 fehlt),
// wird das stillschweigend übersprungen statt das Speichern zu blockieren.
async function syncProductCategories(
  supabase: ReturnType<typeof createSupabaseAdminClient>,
  productId: string,
  categoryIds: string[]
) {
  try {
    await supabase.from('product_categories').delete().eq('product_id', productId)
    if (categoryIds.length > 0) {
      await supabase.from('product_categories').insert(
        categoryIds.map((category_id) => ({ product_id: productId, category_id }))
      )
    }
  } catch {
    // Tabelle fehlt noch — Migration 024 wurde noch nicht ausgeführt
  }
}

export type ProductActionState = { error: string | null; success: boolean; id: string | null }

const ALL_BEREICHE = ['eigenproduktion', 'sonderanfertigung', 'gartengestaltung', 'extras'] as const

/** Alle öffentlichen Produkt-Listingseiten + Detailseite + Sitemap invalidieren */
function revalidatePublicProductPaths(slug?: string) {
  for (const b of ALL_BEREICHE) revalidatePath(`/${b}`)
  revalidatePath('/sitemap.xml')
  if (slug) {
    for (const b of ALL_BEREICHE) revalidatePath(`/${b}/${slug}`)
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
  const auth = await requireTeamMember()
  if (!auth.ok) return { error: auth.error, success: false, id: null }

  const supabase = createSupabaseAdminClient()

  const name = formData.get('name') as string
  const slug = sanitizeSlug(formData.get('slug') as string || name)

  if (!name || !slug) return { error: 'Name und Slug sind Pflichtfelder.', success: false, id: null }

  const thumbnailUrls = readImageUrls(formData, 'thumbnail')
  const galleryUrls   = readImageUrls(formData, 'gallery')
  const iconUrls       = readImageUrls(formData, 'icon')

  const data = {
    name,
    slug,
    article_number: formData.get('article_number') as string || null,
    description: formData.get('description') as string || null,
    bereich:     formData.get('bereich')     as string || null,
    category_id: formData.get('category_id') as string || null,
    material:    formData.get('material')    as string || null,
    surface:     readSurfaces(formData)[0] ?? null,
    surfaces:    readSurfaces(formData),
    format:      formData.get('format')      as string || null,
    origin:      formData.get('origin')      as string || null,
    einsatzbereich: formData.get('einsatzbereich') as string || null,
    farbe:          formData.get('farbe')          as string || null,
    unit:        (['stueck','laufmeter','qm','gewicht','groesse'].includes(formData.get('unit') as string) ? formData.get('unit') : 'qm') as string,
    is_active:   formData.get('is_active') === 'true',
    show_price:  formData.get('show_price') === 'true',
    price:       formData.get('price') ? Number(formData.get('price')) : null,
    sizes:       readSizes(formData),
    sort_order:  Number(formData.get('sort_order')) || 0,
    thumbnail:   thumbnailUrls[0] ?? null,
    icon_url:    iconUrls[0] ?? null,
    images:      galleryUrls,
    image_alts:  {} as Record<string, string>,
  }

  if (data.thumbnail) {
    data.image_alts[data.thumbnail] = formData.get('thumbnail_alt') as string || data.name
  }

  const { data: product, error } = await supabase
    .from('products').insert(data).select().single()
  if (error) return { error: `Fehler: ${error.message}`, success: false, id: null }

  await syncProductCategories(supabase, product.id, readCategoryIds(formData, data.category_id))

  await logChange({ action: 'create', entity_type: 'product', entity_id: product.id, entity_name: data.name, new_value: data })
  revalidatePath('/admin/produkte')
  revalidatePublicProductPaths(data.slug)
  return { error: null, success: true, id: product.id }
}

// ── UPDATE ───────────────────────────────────────────────────────────────────
export async function updateProduct(id: string, _prevState: ProductActionState, formData: FormData): Promise<ProductActionState> {
  const auth = await requireTeamMember()
  if (!auth.ok) return { error: auth.error, success: false, id }

  const supabase = createSupabaseAdminClient()
  const { data: existing } = await supabase.from('products').select('*').eq('id', id).single()

  const thumbnailUrls  = readImageUrls(formData, 'thumbnail')
  const newGalleryUrls = readImageUrls(formData, 'gallery')
  const iconUrls        = readImageUrls(formData, 'icon')
  const existingGallery = (existing?.images as string[]) ?? []

  const data: Record<string, unknown> = {
    name:           formData.get('name')        as string,
    slug:           sanitizeSlug(formData.get('slug') as string || formData.get('name') as string),
    article_number: formData.get('article_number') as string || null,
    description:    formData.get('description') as string || null,
    bereich:        formData.get('bereich')     as string || null,
    category_id:    formData.get('category_id') as string || null,
    material:       formData.get('material')    as string || null,
    surface:        readSurfaces(formData)[0] ?? null,
    surfaces:       readSurfaces(formData),
    format:         formData.get('format')      as string || null,
    origin:         formData.get('origin')      as string || null,
    einsatzbereich: formData.get('einsatzbereich') as string || null,
    farbe:          formData.get('farbe')          as string || null,
    unit:           (['stueck','laufmeter','qm','gewicht','groesse'].includes(formData.get('unit') as string) ? formData.get('unit') : 'qm') as string,
    is_active:      formData.get('is_active') === 'true',
    show_price:     formData.get('show_price') === 'true',
    price:          formData.get('price') ? Number(formData.get('price')) : null,
    sizes:          readSizes(formData),
    sort_order:     Number(formData.get('sort_order')) || 0,
    images:         [...existingGallery, ...newGalleryUrls],
  }

  if (thumbnailUrls.length > 0) data.thumbnail = thumbnailUrls[0]
  if (iconUrls.length > 0) data.icon_url = iconUrls[0]

  const alts: Record<string, string> = { ...((existing?.image_alts as Record<string, string>) ?? {}) }
  if (data.thumbnail) alts[data.thumbnail as string] = formData.get('thumbnail_alt') as string || data.name as string
  data.image_alts = alts

  const { error } = await supabase.from('products').update(data).eq('id', id)
  if (error) return { error: `Fehler: ${error.message}`, success: false, id }

  await syncProductCategories(supabase, id, readCategoryIds(formData, data.category_id as string | null))

  await logChange({ action: 'update', entity_type: 'product', entity_id: id, entity_name: data.name as string, old_value: existing, new_value: data })

  revalidatePath('/admin/produkte')
  revalidatePublicProductPaths(data.slug as string)
  if (existing?.slug && existing.slug !== data.slug) revalidatePublicProductPaths(existing.slug)
  return { error: null, success: true, id }
}

// ── DUPLIZIEREN ──────────────────────────────────────────────────────────────
// Legt eine Kopie als "<Name> V2" (bzw. V3, V4 …) mit eindeutigem Slug an.
// Die Kopie startet bewusst als inaktiv: So taucht sie weder auf der Website
// noch in der Google-Sitemap auf, bis Titel/Bilder angepasst sind und sie
// aktiviert wird (sonst gäbe es zwei identische Seiten = Duplicate Content).
export async function duplicateProduct(id: string): Promise<{ error: string | null; id: string | null }> {
  const auth = await requireTeamMember()
  if (!auth.ok) return { error: auth.error, id: null }

  const supabase = createSupabaseAdminClient()
  const { data: src, error: srcError } = await supabase.from('products').select('*').eq('id', id).single()
  if (srcError || !src) return { error: 'Produkt nicht gefunden.', id: null }

  // Bestehende "-vN"-Endung entfernen, damit aus V2 nicht "V2 V2" wird
  const baseName = String(src.name).replace(/\s+V\d+$/i, '').trim()
  const baseSlug = String(src.slug).replace(/-v\d+$/, '')

  // Slugs sind datenbankweit eindeutig (auch im Papierkorb) — daher ohne Soft-Delete-Filter prüfen
  const { data: taken } = await supabase.from('products').select('slug').like('slug', `${baseSlug}-v%`)
  const takenSlugs = new Set((taken ?? []).map((r: { slug: string }) => r.slug))
  let n = 2
  while (takenSlugs.has(`${baseSlug}-v${n}`)) n++

  const data = {
    name:           `${baseName} V${n}`,
    slug:           `${baseSlug}-v${n}`,
    article_number: null,
    description:    src.description,
    bereich:        src.bereich,
    category_id:    src.category_id,
    material:       src.material,
    surface:        src.surface,
    surfaces:       src.surfaces ?? [],
    format:         src.format,
    origin:         src.origin,
    einsatzbereich: src.einsatzbereich,
    farbe:          src.farbe,
    unit:           src.unit,
    is_active:      false,
    show_price:     src.show_price,
    price:          src.price,
    sizes:          src.sizes ?? [],
    sort_order:     src.sort_order,
    thumbnail:      src.thumbnail,
    icon_url:       src.icon_url,
    images:         src.images ?? [],
    image_alts:     src.image_alts ?? {},
  }

  const { data: created, error } = await supabase.from('products').insert(data).select().single()
  if (error || !created) return { error: `Fehler: ${error?.message ?? 'Kopie konnte nicht angelegt werden.'}`, id: null }

  // Weitere Kategorien (Mehrfachzuordnung) übernehmen
  try {
    const { data: links } = await supabase.from('product_categories').select('category_id').eq('product_id', id)
    const ids = new Set<string>(((links ?? []) as { category_id: string }[]).map((l) => l.category_id))
    if (src.category_id) ids.add(src.category_id)
    await syncProductCategories(supabase, created.id, [...ids])
  } catch { /* Tabelle fehlt evtl. noch */ }

  await logChange({ action: 'create', entity_type: 'product', entity_id: created.id, entity_name: data.name, new_value: { ...data, duplicated_from: id } })
  revalidatePath('/admin/produkte')
  return { error: null, id: created.id }
}

// ── Direkt in Papierkorb verschieben (ohne Genehmigungsschritt) ──────────────
export async function moveProductToTrash(id: string) {
  const auth = await requireTeamMember()
  if (!auth.ok) return { error: auth.error, success: false }

  const supabase = createSupabaseAdminClient()

  const { data: product } = await supabase.from('products').select('name').eq('id', id).single()
  const { error } = await supabase.from('products').update({
    deleted_at:          new Date().toISOString(),
    deleted_by:          auth.memberId,
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
  const auth = await requireTeamMember()
  if (!auth.ok) return { error: auth.error, success: false }

  const supabase   = createSupabaseAdminClient()

  const { data: product } = await supabase.from('products').select('name').eq('id', id).single()
  const { error } = await supabase.from('products').update({
    delete_pending:        true,
    delete_requested_by:   auth.memberId,
    delete_requested_at:   new Date().toISOString(),
  }).eq('id', id)

  if (error) return { error: error.message, success: false }

  await logChange({
    action:      'delete',
    entity_type: 'product',
    entity_id:   id,
    entity_name: product?.name,
    new_value:   { status: 'delete_requested', requested_by: auth.memberId },
  })
  revalidatePath('/admin/produkte')
  revalidatePath('/admin/papierkorb')
  return { error: null, success: true }
}

// ── Admin: Löschantrag genehmigen → Papierkorb ───────────────────────────────
export async function approveDeleteProduct(id: string) {
  const auth = await requireAdminMember()
  if (!auth.ok) return { error: auth.error, success: false }

  const supabase = createSupabaseAdminClient()

  const { data: product } = await supabase.from('products').select('name').eq('id', id).single()
  const { error } = await supabase.from('products').update({
    deleted_at:          new Date().toISOString(),
    deleted_by:          auth.memberId,
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
    new_value:   { status: 'moved_to_trash', approved_by: auth.memberId },
  })
  revalidatePath('/admin/produkte')
  revalidatePath('/admin/papierkorb')
  revalidatePublicProductPaths()
  return { error: null, success: true }
}

// ── Admin: Löschantrag ablehnen ──────────────────────────────────────────────
export async function rejectDeleteProduct(id: string) {
  const auth = await requireAdminMember()
  if (!auth.ok) return { error: auth.error, success: false }

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
  const auth = await requireAdminMember()
  if (!auth.ok) return { error: auth.error, success: false }

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
  const auth = await requireAdminMember()
  if (!auth.ok) return { error: auth.error, success: false }

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
  const auth = await requireTeamMember()
  if (!auth.ok) return { success: false }

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
  const auth = await requireTeamMember()
  if (!auth.ok) return { success: false }

  const supabase = createSupabaseAdminClient()
  await supabase.from('products').update({ thumbnail: null }).eq('id', productId)
  revalidatePath(`/admin/produkte/${productId}`)
  return { success: true }
}

export async function removeIcon(productId: string) {
  const auth = await requireTeamMember()
  if (!auth.ok) return { success: false }

  const supabase = createSupabaseAdminClient()
  await supabase.from('products').update({ icon_url: null }).eq('id', productId)
  revalidatePath(`/admin/produkte/${productId}`)
  return { success: true }
}

// ── Monitoring: Abgelaufene Logs löschen (Admin-Action) ──────────────────────
export async function purgeExpiredLogs() {
  const auth = await requireAdminMember()
  if (!auth.ok) return { error: auth.error, success: false, count: 0 }

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
