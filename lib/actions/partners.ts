'use server'

import { revalidatePath } from 'next/cache'
import { createSupabaseAdminClient } from '@/lib/supabase'
import { logChange } from '@/lib/utils/changelog'

/** Ergänzt fehlendes https:// bei URLs, die der Nutzer ohne Protokoll eingegeben hat. */
function normalizeUrl(raw: string): string {
  const trimmed = raw.trim()
  if (!trimmed) return trimmed
  if (/^https?:\/\//i.test(trimmed)) return trimmed
  return `https://${trimmed}`
}

function readPdfs(formData: FormData) {
  const pdfs: { title: string; url: string }[] = []
  for (let i = 0; i < 10; i++) {
    const url   = (formData.get(`pdf_${i}`) as string) || ''
    const title = (formData.get(`pdf_title_${i}`) as string) || ''
    if (url) pdfs.push({ title: title || `Dokument ${pdfs.length + 1}`, url: normalizeUrl(url) })
  }
  return pdfs
}

function parseFormData(formData: FormData) {
  return {
    name:        (formData.get('name') as string),
    logo_url:    (formData.get('logo_url') as string) || null,
    website_url: (formData.get('website_url') as string) ? normalizeUrl(formData.get('website_url') as string) : null,
    pdfs:        readPdfs(formData),
    is_active:   formData.get('is_active') === 'true',
    sort_order:  Number(formData.get('sort_order')) || 0,
    updated_at:  new Date().toISOString(),
  }
}

export type PartnerActionState = { error: string | null; success: boolean; id: string | null }

export async function createPartner(
  _prev: PartnerActionState,
  formData: FormData
): Promise<PartnerActionState> {
  const supabase = createSupabaseAdminClient()
  const data = parseFormData(formData)
  if (!data.name) return { error: 'Name ist Pflichtfeld.', success: false, id: null }

  const { data: partner, error } = await supabase.from('partners').insert(data).select().single()
  if (error) return { error: error.message, success: false, id: null }

  await logChange({ action: 'create', entity_type: 'partner', entity_id: partner.id, entity_name: data.name, new_value: data })
  revalidatePath('/unsere-partner')
  revalidatePath('/admin/partner')
  return { error: null, success: true, id: partner.id }
}

export async function updatePartner(
  id: string,
  _prev: PartnerActionState,
  formData: FormData
): Promise<PartnerActionState> {
  const supabase = createSupabaseAdminClient()
  const { data: existing } = await supabase.from('partners').select('*').eq('id', id).single()
  const data = parseFormData(formData)

  const { error } = await supabase.from('partners').update(data).eq('id', id)
  if (error) return { error: error.message, success: false, id }

  await logChange({ action: 'update', entity_type: 'partner', entity_id: id, entity_name: data.name, old_value: existing, new_value: data })
  revalidatePath('/unsere-partner')
  revalidatePath('/admin/partner')
  return { error: null, success: true, id }
}

// ── MOVE TO TRASH (Soft-Delete) ───────────────────────────────────────────────
export async function deletePartner(id: string) {
  const supabase = createSupabaseAdminClient()
  const { data: partner } = await supabase.from('partners').select('name').eq('id', id).single()
  const { error } = await supabase.from('partners')
    .update({ deleted_at: new Date().toISOString(), is_active: false })
    .eq('id', id)
  if (error) return { error: error.message, success: false }

  await logChange({ action: 'delete', entity_type: 'partner', entity_id: id, entity_name: partner?.name, new_value: { status: 'moved_to_trash' } })
  revalidatePath('/unsere-partner')
  revalidatePath('/admin/partner')
  revalidatePath('/admin/papierkorb')
  return { error: null, success: true }
}

// ── RESTORE ──────────────────────────────────────────────────────────────────
export async function restorePartner(id: string) {
  const supabase = createSupabaseAdminClient()
  const { data: partner } = await supabase.from('partners').select('name').eq('id', id).single()
  const { error } = await supabase.from('partners').update({ deleted_at: null }).eq('id', id)
  if (error) return { error: error.message, success: false }

  await logChange({ action: 'update', entity_type: 'partner', entity_id: id, entity_name: partner?.name, new_value: { status: 'restored' } })
  revalidatePath('/admin/partner')
  revalidatePath('/admin/papierkorb')
  return { error: null, success: true }
}

// ── PERMANENT DELETE ──────────────────────────────────────────────────────────
export async function permanentDeletePartner(id: string) {
  const supabase = createSupabaseAdminClient()
  const { data: partner } = await supabase.from('partners').select('name').eq('id', id).single()
  const { error } = await supabase.from('partners').delete().eq('id', id)
  if (error) return { error: error.message, success: false }

  await logChange({ action: 'delete', entity_type: 'partner', entity_id: id, entity_name: partner?.name, new_value: { status: 'permanently_deleted' } })
  revalidatePath('/admin/papierkorb')
  return { error: null, success: true }
}
