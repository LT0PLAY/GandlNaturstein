'use server'

import { revalidatePath } from 'next/cache'
import { createSupabaseAdminClient } from '@/lib/supabase'
import type { PageHeroKey } from '@/lib/types'

// Pfad der öffentlichen Seite pro Key, damit revalidatePath nach dem Speichern
// die richtige Seite neu rendert.
const PUBLIC_PATH: Record<PageHeroKey, string> = {
  partner:    '/unsere-partner',
  restposten: '/restposten',
  guide:      '/ausstellungsguide',
  karriere:   '/karriere',
  referenzen: '/referenzen',
}

// ── Titelbild-URL aus FormData lesen (ImageUploader schickt hidden inputs) ──
function readImageUrl(formData: FormData, field: string): string | null {
  const count = Number(formData.get(`${field}_count`) ?? 0)
  if (count > 0) {
    const indexed = formData.get(`${field}_0`) as string | null
    if (indexed) return indexed
  }
  return (formData.get(field) as string) || null
}

export async function getPageHeroImage(pageKey: PageHeroKey): Promise<string | null> {
  try {
    const { data } = await createSupabaseAdminClient()
      .from('page_heroes')
      .select('image_url')
      .eq('page_key', pageKey)
      .maybeSingle()
    return data?.image_url ?? null
  } catch {
    // Tabelle evtl. noch nicht migriert — Seite funktioniert weiterhin ohne Titelbild.
    return null
  }
}

export async function savePageHero(pageKey: PageHeroKey, formData: FormData) {
  const imageUrl = readImageUrl(formData, 'image')
  if (!imageUrl) return { error: 'Bitte zuerst ein Bild hochladen.', success: false }

  const supabase = createSupabaseAdminClient()
  const { error } = await supabase
    .from('page_heroes')
    .upsert({ page_key: pageKey, image_url: imageUrl, updated_at: new Date().toISOString() })
  if (error) return { error: error.message, success: false }

  revalidatePath(`/admin/${pageKey}`)
  revalidatePath(PUBLIC_PATH[pageKey])
  return { error: null, success: true }
}

export async function removePageHero(pageKey: PageHeroKey) {
  const supabase = createSupabaseAdminClient()
  const { error } = await supabase
    .from('page_heroes')
    .upsert({ page_key: pageKey, image_url: null, updated_at: new Date().toISOString() })
  if (error) return { error: error.message, success: false }

  revalidatePath(`/admin/${pageKey}`)
  revalidatePath(PUBLIC_PATH[pageKey])
  return { error: null, success: true }
}
