'use server'

import { createSupabaseAdminClient } from '@/lib/supabase'
import type { CategoryBereich, CategoryLocation } from '@/lib/types'

export interface SearchResult {
  id:               string
  name:             string
  slug:             string
  article_number:   string | null
  thumbnail:        string | null
  material:         string | null
  surface:          string | null
  description:      string | null
  /** Hauptbereich (massivproduktion, gartengestaltung, ...) */
  categoryType:     CategoryBereich
  /** Standort — bestimmt die URL (/aussen/... oder /innen/...) */
  categoryLocation: CategoryLocation | null
  categoryName:     string | null
}

export async function searchProducts(query: string): Promise<SearchResult[]> {
  if (!query || query.trim().length < 2) return []

  const supabase = createSupabaseAdminClient()
  const q = query.trim()

  const { data, error } = await supabase
    .from('products')
    .select('id, name, slug, article_number, thumbnail, material, surface, description, category:categories!inner(name, type, location)')
    .eq('is_active', true)
    .or(
      `name.ilike.%${q}%,material.ilike.%${q}%,surface.ilike.%${q}%,description.ilike.%${q}%,origin.ilike.%${q}%,article_number.ilike.%${q}%`
    )
    .limit(8)

  if (error || !data) return []

  return data.map((p: any) => ({
    id:               p.id,
    name:             p.name,
    slug:             p.slug,
    article_number:   p.article_number ?? null,
    thumbnail:        p.thumbnail,
    material:         p.material,
    surface:          p.surface,
    description:      p.description,
    categoryType:     p.category?.type     ?? 'massivproduktion',
    categoryLocation: p.category?.location ?? null,
    categoryName:     p.category?.name     ?? null,
  }))
}
