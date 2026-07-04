'use server'

import { revalidatePath } from 'next/cache'
import { createSupabaseAdminClient } from '@/lib/supabase'
import { logChange } from '@/lib/utils/changelog'
import { getCurrentUser } from '@/lib/actions/auth'
import { redirect } from 'next/navigation'

async function requireAdmin() {
  const user = await getCurrentUser()
  if (!user || (user.role as string) !== 'admin') redirect('/admin')
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
  const newImages = readImageUrls(formData, 'images')
  return {
    title:           (formData.get('title') as string),
    department:      (formData.get('department') as string) || null,
    location:        (formData.get('location') as string) || null,
    employment_type: (formData.get('employment_type') as string) || null,
    description:     (formData.get('description') as string) || null,
    requirements:    (formData.get('requirements') as string) || null,
    benefits:        (formData.get('benefits') as string) || null,
    pdf_url:         (formData.get('pdf_url') as string) || null,
    linkedin_url:    (formData.get('linkedin_url') as string) || null,
    images:          [...(existingImages ?? []), ...newImages],
    is_published:    formData.get('is_published') === 'true',
    sort_order:      Number(formData.get('sort_order')) || 0,
    updated_at:      new Date().toISOString(),
  }
}

export type KarriereActionState = { error: string | null; success: boolean; id: string | null }
const SUPABASE_CONFIGURED = process.env.NEXT_PUBLIC_SUPABASE_URL && !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')

// ── CREATE ───────────────────────────────────────────────────────────────────
export async function createJobListing(
  _prev: KarriereActionState,
  formData: FormData
): Promise<KarriereActionState> {
  if (SUPABASE_CONFIGURED) await requireAdmin()
  const supabase = createSupabaseAdminClient()
  const data = parseFormData(formData)
  if (!data.title) return { error: 'Titel ist Pflichtfeld.', success: false, id: null }

  const { data: job, error } = await supabase.from('job_listings').insert(data).select().single()
  if (error) return { error: error.message, success: false, id: null }

  await logChange({ action: 'create', entity_type: 'job_listing', entity_id: job.id, entity_name: data.title, new_value: data })
  revalidatePath('/karriere')
  revalidatePath('/admin/karriere')
  revalidatePath('/sitemap.xml')
  return { error: null, success: true, id: job.id }
}

// ── UPDATE ───────────────────────────────────────────────────────────────────
export async function updateJobListing(
  id: string,
  _prev: KarriereActionState,
  formData: FormData
): Promise<KarriereActionState> {
  if (SUPABASE_CONFIGURED) await requireAdmin()
  const supabase = createSupabaseAdminClient()
  const { data: existing } = await supabase.from('job_listings').select('*').eq('id', id).single()
  const existingImages = (existing?.images as string[]) ?? []
  const data = parseFormData(formData, existingImages)

  const { error } = await supabase.from('job_listings').update(data).eq('id', id)
  if (error) return { error: error.message, success: false, id }

  await logChange({ action: 'update', entity_type: 'job_listing', entity_id: id, entity_name: data.title, old_value: existing, new_value: data })
  revalidatePath('/karriere')
  revalidatePath('/admin/karriere')
  revalidatePath('/sitemap.xml')
  return { error: null, success: true, id }
}

// ── SOFT DELETE ───────────────────────────────────────────────────────────────
export async function deleteJobListing(id: string) {
  if (SUPABASE_CONFIGURED) await requireAdmin()
  const supabase = createSupabaseAdminClient()
  const { data: job } = await supabase.from('job_listings').select('title').eq('id', id).single()
  const { error } = await supabase.from('job_listings')
    .update({ deleted_at: new Date().toISOString(), is_published: false })
    .eq('id', id)
  if (error) return { error: error.message, success: false }

  await logChange({ action: 'delete', entity_type: 'job_listing', entity_id: id, entity_name: job?.title, new_value: { status: 'moved_to_trash' } })
  revalidatePath('/karriere')
  revalidatePath('/admin/karriere')
  revalidatePath('/admin/papierkorb')
  return { error: null, success: true }
}

// ── RESTORE ───────────────────────────────────────────────────────────────────
export async function restoreJobListing(id: string) {
  if (SUPABASE_CONFIGURED) await requireAdmin()
  const supabase = createSupabaseAdminClient()
  const { data: job } = await supabase.from('job_listings').select('title').eq('id', id).single()
  const { error } = await supabase.from('job_listings').update({ deleted_at: null }).eq('id', id)
  if (error) return { error: error.message, success: false }

  await logChange({ action: 'update', entity_type: 'job_listing', entity_id: id, entity_name: job?.title, new_value: { status: 'restored' } })
  revalidatePath('/admin/karriere')
  revalidatePath('/admin/papierkorb')
  return { error: null, success: true }
}

// ── PERMANENT DELETE ──────────────────────────────────────────────────────────
export async function permanentDeleteJobListing(id: string) {
  if (SUPABASE_CONFIGURED) await requireAdmin()
  const supabase = createSupabaseAdminClient()
  const { data: job } = await supabase.from('job_listings').select('title').eq('id', id).single()
  const { error } = await supabase.from('job_listings').delete().eq('id', id)
  if (error) return { error: error.message, success: false }

  await logChange({ action: 'delete', entity_type: 'job_listing', entity_id: id, entity_name: job?.title, new_value: { status: 'permanently_deleted' } })
  revalidatePath('/karriere')
  revalidatePath('/admin/karriere')
  revalidatePath('/admin/papierkorb')
  return { error: null, success: true }
}

// ── REMOVE IMAGE ──────────────────────────────────────────────────────────────
export async function removeJobImage(jobId: string, imageUrl: string) {
  if (SUPABASE_CONFIGURED) await requireAdmin()
  const supabase = createSupabaseAdminClient()
  const { data: job } = await supabase.from('job_listings').select('images').eq('id', jobId).single()
  const images = ((job?.images as string[]) ?? []).filter((u) => u !== imageUrl)
  await supabase.from('job_listings').update({ images }).eq('id', jobId)
  revalidatePath(`/admin/karriere/${jobId}`)
  return { success: true }
}
