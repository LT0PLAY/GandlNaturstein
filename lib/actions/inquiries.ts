'use server'

import { revalidatePath } from 'next/cache'
import { createSupabaseAdminClient } from '@/lib/supabase'
import { logChange } from '@/lib/utils/changelog'
import type { InquiryFormData, ApiResponse, Inquiry } from '@/lib/types'
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

  const SOURCE_LABEL: Record<string, string> = {
    restposten: '[Restposten] ',
    guide:      '[Ausstellungsguide] ',
  }

  const itemsText = data.items
    .map((it) => `– ${SOURCE_LABEL[it.sourceType ?? 'product'] ?? ''}${it.productName}${it.size ? ` (Größe: ${it.size})` : ''}: ${it.quantity} ${UNIT_LABELS[normalizeUnit(it.unit)].short}`)
    .join('\n')

  const message = `Anfrage-Korb:\n${itemsText}${data.message ? `\n\nKommentar: ${data.message}` : ''}`

  // Eine Anfrage pro Position (gleiche Kundendaten).
  // product_id hat eine Fremdschlüssel-Referenz auf die products-Tabelle – nur bei
  // echten Katalogprodukten setzen, Restposten/Guide-Einträge bleiben null (Name steht in message).
  const rows = data.items.map((item) => ({
    name:       data.name.trim(),
    email:      data.email.trim().toLowerCase(),
    phone:      data.phone?.trim() || null,
    message,
    product_id: (!item.sourceType || item.sourceType === 'product') ? item.productId : null,
    status:     'new' as const,
  }))

  const { error } = await supabase.from('inquiries').insert(rows)
  if (error) {
    console.error('submitBasketInquiry error:', error)
    return { data: null, error: 'Anfrage konnte nicht gesendet werden.', success: false }
  }

  return { data: { count: rows.length }, error: null, success: true }
}

// Alle Anfragen abrufen (Admin)
export async function getInquiries(status?: string) {
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
  const supabase = createSupabaseAdminClient()
  const { error } = await supabase
    .from('inquiries')
    .update({ status, internal_note: internal_note || null })
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
