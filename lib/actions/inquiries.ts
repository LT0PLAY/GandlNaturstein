'use server'

import { revalidatePath } from 'next/cache'
import { createSupabaseAdminClient } from '@/lib/supabase'
import { logChange } from '@/lib/utils/changelog'
import { requireTeamMember } from '@/lib/actions/authGuard'
import type { InquiryFormData, ApiResponse, Inquiry, InquiryItem, InquiryNote } from '@/lib/types'
import { UNIT_LABELS, normalizeUnit } from '@/lib/types'

// Anfrage einreichen (öffentlich)
export async function submitInquiry(
  data: InquiryFormData
): Promise<ApiResponse<Inquiry>> {
  // Honeypot: unsichtbares Feld, das nur Bots ausfüllen.
  // Ist es befüllt, tun wir so, als wäre alles gut gelaufen (kein Hinweis für Bots),
  // speichern aber nichts.
  if (data.website && data.website.trim() !== '') {
    console.warn('submitInquiry: honeypot getriggert – vermutlich Bot')
    return { data: null, error: null, success: true }
  }

  // DSGVO-Zustimmung ist Pflicht
  const consentGiven = data.consent === true || data.consent === 'on' || data.consent === 'true'
  if (!consentGiven) {
    return { data: null, error: 'Bitte stimmen Sie der Datenverarbeitung zu.', success: false }
  }

  const supabase = createSupabaseAdminClient()

  const { data: inquiry, error } = await supabase
    .from('inquiries')
    .insert({
      name:       data.name.trim(),
      email:      data.email.trim().toLowerCase(),
      phone:      data.phone?.trim() || null,
      area_sqm:   data.area_sqm || null,
      message:    data.message?.trim() || null,
      product_id: data.product_id || null,
      status:     'new',
    })
    .select()
    .single()

  if (error) {
    console.error('submitInquiry error:', error)
    return { data: null, error: 'Anfrage konnte nicht gesendet werden.', success: false }
  }

  return { data: inquiry as Inquiry, error: null, success: true }
}

// Korb-Anfrage: mehrere Produkte auf einmal
export async function submitBasketInquiry(data: {
  name:    string
  email:   string
  phone?:  string
  message?: string
  items: Array<{
    productId: string
    productName: string
    quantity: number
    unit: string
    /** Woher der Eintrag stammt – fehlt = normales Katalogprodukt (Rückwärtskompatibilität) */
    sourceType?: 'product' | 'restposten' | 'guide'
    /** Gewählte Größenvariante, falls das Produkt mehrere Größen anbietet */
    size?: string | null
    /** Gewählte Oberflächen-Variante, falls das Produkt mehrere Oberflächen anbietet */
    surface?: string | null
    /** Artikelnummer der gewählten Variante bzw. des Produkts */
    articleNumber?: string | null
  }>
  consent: boolean | string
  website?: string  // Honeypot – muss leer bleiben
}): Promise<ApiResponse<{ count: number }>> {
  // Honeypot: unsichtbares Feld, das nur Bots ausfüllen
  if (data.website && data.website.trim() !== '') {
    console.warn('submitBasketInquiry: honeypot getriggert – vermutlich Bot')
    return { data: { count: 0 }, error: null, success: true }
  }

  // DSGVO-Zustimmung ist Pflicht
  const consentGiven = data.consent === true || data.consent === 'on' || data.consent === 'true'
  if (!consentGiven) {
    return { data: null, error: 'Bitte stimmen Sie der Datenverarbeitung zu.', success: false }
  }

  const supabase = createSupabaseAdminClient()

  if (!Array.isArray(data.items) || data.items.length === 0) {
    return { data: null, error: 'Der Anfragekorb ist leer.', success: false }
  }
  if (data.items.length > MAX_INQUIRY_ITEMS) {
    return { data: null, error: `Maximal ${MAX_INQUIRY_ITEMS} Positionen pro Anfrage.`, success: false }
  }

  const items = await buildInquiryItems(supabase, data.items)
  const name  = data.name.trim()
  const email = data.email.trim().toLowerCase()
  const phone = data.phone?.trim() || null
  const comment = data.message?.trim().slice(0, 5000) || null

  // Eine Anfrage pro Korb (die Positionen stehen strukturiert in "items").
  // product_id hat eine Fremdschlüssel-Referenz auf products – nur bei genau einem
  // echten, in der Datenbank gefundenen Katalogprodukt setzen.
  const only = items.length === 1 ? items[0] : null
  const productId = only && only.sourceType === 'product' && only.path ? only.productId : null

  const { error } = await supabase.from('inquiries').insert({
    name, email, phone,
    message:    comment,
    product_id: productId,
    status:     'new',
    items,
  })

  if (error) {
    // Migration 036 (Spalte "items") noch nicht eingespielt → alte Speicherweise,
    // damit keine Anfrage verloren geht.
    if (error.code === '42703' || error.code === 'PGRST204' || /items/i.test(error.message)) {
      return submitBasketInquiryLegacy(supabase, data, items)
    }
    console.error('submitBasketInquiry error:', error)
    return { data: null, error: 'Anfrage konnte nicht gesendet werden.', success: false }
  }

  return { data: { count: items.length }, error: null, success: true }
}

const MAX_INQUIRY_ITEMS = 50
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function clip(value: unknown, max: number): string | null {
  return typeof value === 'string' && value.trim() ? value.trim().slice(0, max) : null
}

type SupabaseAdmin = ReturnType<typeof createSupabaseAdminClient>
type BasketItemInput = Parameters<typeof submitBasketInquiry>[0]['items'][number]

/** Bereinigt die Positionen aus dem Browser und ergänzt Link, Bild und Artikelnummer aus der Datenbank. */
async function buildInquiryItems(supabase: SupabaseAdmin, input: BasketItemInput[]): Promise<InquiryItem[]> {
  const sourceOf = (t?: string): InquiryItem['sourceType'] => (t === 'restposten' || t === 'guide' ? t : 'product')
  // Restposten/Guide-Einträge liegen im Korb als "restposten:<id>" bzw. "guide:<id>"
  const rawId = (id: string) => String(id).replace(/^(restposten|guide):/, '')
  const idsFor = (type: InquiryItem['sourceType']) => [...new Set(
    input.filter((i) => sourceOf(i.sourceType) === type && UUID_RE.test(rawId(i.productId))).map((i) => rawId(i.productId))
  )]

  type ProductRow = { id: string; slug: string; bereich: string | null; article_number: string | null; thumbnail: string | null; category: { type: string } | { type: string }[] | null }
  type ImageRow   = { id: string; images: string[] | null }

  const load = async <T,>(table: string, columns: string, ids: string[]): Promise<Map<string, T>> => {
    if (!ids.length) return new Map()
    const { data } = await supabase.from(table).select(columns).in('id', ids)
    return new Map(((data ?? []) as unknown as (T & { id: string })[]).map((r) => [r.id, r]))
  }

  const [products, restposten, guide] = await Promise.all([
    load<ProductRow>('products', 'id, slug, bereich, article_number, thumbnail, category:categories!products_category_id_fkey(type)', idsFor('product')),
    load<ImageRow>('restposten', 'id, images', idsFor('restposten')),
    load<ImageRow>('guide_entries', 'id, images', idsFor('guide')),
  ])

  return input.map((it): InquiryItem => {
    const sourceType = sourceOf(it.sourceType)
    let path: string | null = null
    let thumbnail: string | null = null
    let baseArticle: string | null = null

    if (sourceType === 'product') {
      const p = products.get(rawId(it.productId))
      if (p) {
        const cat = Array.isArray(p.category) ? p.category[0] : p.category
        path        = `/${p.bereich ?? cat?.type ?? 'eigenproduktion'}/${p.slug}`
        thumbnail   = p.thumbnail
        baseArticle = p.article_number
      }
    } else if (sourceType === 'restposten') {
      path = '/restposten'
      thumbnail = restposten.get(rawId(it.productId))?.images?.[0] ?? null
    } else {
      path = '/ausstellungsguide'
      thumbnail = guide.get(rawId(it.productId))?.images?.[0] ?? null
    }

    return {
      productId:     String(it.productId).slice(0, 64),
      name:          clip(it.productName, 200) ?? 'Ohne Bezeichnung',
      quantity:      Number.isFinite(it.quantity) ? Math.min(Math.max(it.quantity, 0), 99999) : 1,
      unit:          normalizeUnit(it.unit),
      sourceType,
      articleNumber: clip(it.articleNumber, 60) ?? baseArticle,
      size:          clip(it.size, 120),
      surface:       clip(it.surface, 120),
      path,
      thumbnail,
    }
  })
}

/** Alte Speicherweise (eine Zeile pro Position, Positionen als Text in der Nachricht). */
async function submitBasketInquiryLegacy(
  supabase: SupabaseAdmin,
  data: Parameters<typeof submitBasketInquiry>[0],
  items: InquiryItem[],
): Promise<ApiResponse<{ count: number }>> {
  const SOURCE_LABEL: Record<string, string> = {
    restposten: '[Restposten] ',
    guide:      '[Ausstellungsguide] ',
  }
  const itemsText = items
    .map((it) => {
      const variant = [
        it.size ? `Größe: ${it.size}` : null,
        it.surface ? `Oberfläche: ${it.surface}` : null,
        it.articleNumber ? `Art.-Nr.: ${it.articleNumber}` : null,
      ].filter(Boolean).join(', ')
      return `– ${SOURCE_LABEL[it.sourceType] ?? ''}${it.name}${variant ? ` (${variant})` : ''}: ${it.quantity} ${UNIT_LABELS[it.unit].short}`
    })
    .join('\n')
  const message = `Anfrage-Korb:\n${itemsText}${data.message ? `\n\nKommentar: ${data.message}` : ''}`

  const rows = items.map((item) => ({
    name:       data.name.trim(),
    email:      data.email.trim().toLowerCase(),
    phone:      data.phone?.trim() || null,
    message,
    product_id: item.sourceType === 'product' && item.path ? item.productId : null,
    status:     'new' as const,
  }))

  const { error } = await supabase.from('inquiries').insert(rows)
  if (error) {
    console.error('submitBasketInquiryLegacy error:', error)
    return { data: null, error: 'Anfrage konnte nicht gesendet werden.', success: false }
  }
  return { data: { count: rows.length }, error: null, success: true }
}

// Alle Anfragen abrufen (Admin)
export async function getInquiries(status?: string) {
  const auth = await requireTeamMember()
  if (!auth.ok) return { data: [], error: auth.error }

  const supabase = createSupabaseAdminClient()

  let query = supabase
    .from('inquiries')
    .select(`*, product:products(id, name, slug)`)
    .order('created_at', { ascending: false })

  if (status) query = query.eq('status', status)

  const { data, error } = await query
  if (error) return { data: [], error: error.message }
  return { data, error: null }
}

// Status aktualisieren (Admin)
export async function updateInquiryStatus(
  id: string,
  status: string,
  internal_note?: string
) {
  const auth = await requireTeamMember()
  if (!auth.ok) return { error: auth.error, success: false }

  const supabase = createSupabaseAdminClient()
  const { error } = await supabase
    .from('inquiries')
    .update(internal_note === undefined ? { status } : { status, internal_note: internal_note || null })
    .eq('id', id)
  if (error) return { error: error.message, success: false }
  revalidatePath('/admin/anfragen')
  revalidatePath(`/admin/anfragen/${id}`)
  await logChange({
    action: 'update', entity_type: 'inquiry', entity_id: id,
    new_value: { status, internal_note },
  })
  return { error: null, success: true }
}

// Interne Notiz (Chat-Verlauf) hinzufügen (Admin)
export async function addInquiryNote(id: string, text: string) {
  const auth = await requireTeamMember()
  if (!auth.ok) return { error: auth.error, success: false }

  const clean = text.trim().slice(0, 2000)
  if (!clean) return { error: 'Bitte eine Notiz eingeben.', success: false }

  const supabase = createSupabaseAdminClient()
  const { data: member } = await supabase
    .from('team_members').select('name').eq('id', auth.memberId).maybeSingle()
  const author = member?.name ?? 'Team'

  const note: InquiryNote = {
    id: crypto.randomUUID(), authorId: auth.memberId, author, text: clean, at: new Date().toISOString(),
  }

  const { data: row, error: readError } = await supabase
    .from('inquiries').select('notes').eq('id', id).maybeSingle()

  if (!readError) {
    if (!row) return { error: 'Anfrage nicht gefunden.', success: false }
    const notes = Array.isArray(row.notes) ? (row.notes as InquiryNote[]) : []
    if (notes.length >= 200) return { error: 'Zu viele Notizen in dieser Anfrage.', success: false }
    const { error } = await supabase.from('inquiries').update({ notes: [...notes, note] }).eq('id', id)
    if (error) return { error: error.message, success: false }
  } else {
    // Migration 036 (Spalte "notes") noch nicht eingespielt → an die alte Einzel-Notiz anhängen.
    const { data: old } = await supabase.from('inquiries').select('internal_note').eq('id', id).maybeSingle()
    const stamp = new Date().toLocaleString('de-DE', { timeZone: 'Europe/Berlin' })
    const appended = `${old?.internal_note ? `${old.internal_note}\n\n` : ''}[${author}, ${stamp}] ${clean}`
    const { error } = await supabase.from('inquiries').update({ internal_note: appended }).eq('id', id)
    if (error) return { error: error.message, success: false }
  }

  revalidatePath(`/admin/anfragen/${id}`)
  await logChange({
    action: 'update', entity_type: 'inquiry', entity_id: id,
    new_value: { note_added: true },
  })
  return { error: null, success: true }
}
