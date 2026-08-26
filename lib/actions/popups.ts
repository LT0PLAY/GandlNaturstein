'use server'

import { revalidatePath } from 'next/cache'
import { createSupabaseAdminClient } from '@/lib/supabase'
import { logChange } from '@/lib/utils/changelog'
import type { Popup } from '@/lib/types'

// ── Bild-URL aus FormData lesen (ImageUploader schickt hidden inputs) ──
function readImageUrl(formData: FormData, field: string): string | null {
  const count = Number(formData.get(`${field}_count`) ?? 0)
  if (count > 0) {
    const indexed = formData.get(`${field}_0`) as string | null
    if (indexed) return indexed
  }
  return (formData.get(field) as string) || null
}

function revalidateAll() {
  revalidatePath('/admin/popups')
  revalidatePath('/', 'layout')
}

export type PopupActionState = { error: string | null; success: boolean; id: string | null }

function parseFormData(formData: FormData) {
  const activeUntilRaw = (formData.get('active_until') as string) || ''
  return {
    title:        (formData.get('title') as string)?.trim(),
    message:      (formData.get('message') as string) || null,
    image_url:    readImageUrl(formData, 'image'),
    is_active:    formData.get('is_active') === 'true',
    active_until: activeUntilRaw ? new Date(activeUntilRaw).toISOString() : null,
    updated_at:   new Date().toISOString(),
  }
}

// Stellt sicher, dass immer nur EIN Popup gleichzeitig aktiv ist — ältere
// aktive Popups werden deaktiviert (nicht gelöscht), sobald ein neues aktiv wird.
async function deactivateOthers(exceptId: string) {
  const supabase = createSupabaseAdminClient()
  await supabase.from('popups').update({ is_active: false }).neq('id', exceptId).eq('is_active', true)
}

export async function createPopup(
  _prev: PopupActionState,
  formData: FormData
): Promise<PopupActionState> {
  const supabase = createSupabaseAdminClient()
  const data = parseFormData(formData)
  if (!data.title) return { error: 'Name ist Pflichtfeld.', success: false, id: null }

  const { data: popup, error } = await supabase.from('popups').insert(data).select().single()
  if (error) return { error: error.message, success: false, id: null }

  if (data.is_active) await deactivateOthers(popup.id)

  await logChange({ action: 'create', entity_type: 'popup', entity_id: popup.id, entity_name: data.title, new_value: data })
  revalidateAll()
  return { error: null, success: true, id: popup.id }
}

export async function updatePopup(
  id: string,
  _prev: PopupActionState,
  formData: FormData
): Promise<PopupActionState> {
  const supabase = createSupabaseAdminClient()
  const { data: existing } = await supabase.from('popups').select('*').eq('id', id).single()
  const data = parseFormData(formData)
  if (!data.title) return { error: 'Name ist Pflichtfeld.', success: false, id }

  const { error } = await supabase.from('popups').update(data).eq('id', id)
  if (error) return { error: error.message, success: false, id }

  if (data.is_active) await deactivateOthers(id)

  await logChange({ action: 'update', entity_type: 'popup', entity_id: id, entity_name: data.title, old_value: existing, new_value: data })
  revalidateAll()
  return { error: null, success: true, id }
}

// Schnell-Umschalten aus der Liste heraus (ohne das Formular zu öffnen).
export async function togglePopupActive(id: string, nextActive: boolean) {
  const supabase = createSupabaseAdminClient()
  const { data: popup } = await supabase.from('popups').select('title').eq('id', id).single()
  const { error } = await supabase.from('popups').update({ is_active: nextActive, updated_at: new Date().toISOString() }).eq('id', id)
  if (error) return { error: error.message, success: false }

  if (nextActive) await deactivateOthers(id)

  await logChange({ action: 'update', entity_type: 'popup', entity_id: id, entity_name: popup?.title, new_value: { is_active: nextActive } })
  revalidateAll()
  return { error: null, success: true }
}

export async function deletePopup(id: string) {
  const supabase = createSupabaseAdminClient()
  const { data: popup } = await supabase.from('popups').select('title').eq('id', id).single()
  const { error } = await supabase.from('popups').delete().eq('id', id)
  if (error) return { error: error.message, success: false }

  await logChange({ action: 'delete', entity_type: 'popup', entity_id: id, entity_name: popup?.title, new_value: { status: 'permanently_deleted' } })
  revalidateAll()
  return { error: null, success: true }
}

// ── Für die öffentliche Website: aktuell aktives Popup ──────────────────────
// Prüft nebenbei, ob ein Ablaufdatum überschritten ist, und deaktiviert das
// Popup in dem Fall automatisch (bleibt aber gespeichert, nur nicht mehr aktiv).
export async function getActivePopup(): Promise<Popup | null> {
  try {
    const supabase = createSupabaseAdminClient()
    const { data } = await supabase
      .from('popups')
      .select('*')
      .eq('is_active', true)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (!data) return null

    if (data.active_until && new Date(data.active_until).getTime() <= Date.now()) {
      await supabase.from('popups').update({ is_active: false }).eq('id', data.id)
      return null
    }

    return data as Popup
  } catch {
    return null
  }
}
