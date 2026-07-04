import { createSupabaseBrowserClient } from '@/lib/supabase'
import { createSupabaseAdminClient }   from '@/lib/supabase'
import type { Product, Category, CategoryType } from '@/lib/types'

// Hilfsfunktion: deleted_at-Filter mit Fallback
// Falls Migration 005 noch nicht gelaufen ist, wird der Filter weggelassen.
async function withSoftDeleteFilter<T>(
  queryFn: (withFilter: boolean) => Promise<{ data: T | null; error: any }>
): Promise<T | null> {
  const { data, error } = await queryFn(true)
  if (!error) return data

  // Spalte existiert noch nicht → ohne Filter nochmal
  if (error.message?.includes('deleted_at') || error.code === '42703') {
    const { data: fallback } = await queryFn(false)
    return fallback
  }
  return null
}

// ============================================================
// PRODUCTS
// ============================================================

// Alle aktiven Produkte (optional nach Kategorie-Typ filtern)
export async function getProducts(type?: CategoryType) {
  const supabase = createSupabaseAdminClient()

  const result = await withSoftDeleteFilter<Product[]>((withFilter) => {
    let q = supabase
      .from('products')
      .select(`*, category:categories(*)`)
      .eq('is_active', true)
      .order('sort_order')

    if (withFilter) q = q.is('deleted_at', null) as any
    if (type)       q = q.eq('categories.type', type) as any
    return q as any
  })

  return (result ?? []) as Product[]
}

// Einzelnes Produkt per Slug
export async function getProductBySlug(slug: string) {
  const supabase = createSupabaseAdminClient()

  // Zuerst mit deleted_at-Filter versuchen
  const { data, error } = await supabase
    .from('products')
    .select(`*, category:categories(*)`)
    .eq('slug', slug)
    .eq('is_active', true)
    .is('deleted_at', null)
    .maybeSingle()

  if (!error) return data as Product | null

  // Fallback: deleted_at-Spalte existiert noch nicht (Migration 005/010 fehlt)
  if (error.code === '42703' || error.message?.includes('deleted_at')) {
    const { data: fallback, error: fallbackError } = await supabase
      .from('products')
      .select(`*, category:categories(*)`)
      .eq('slug', slug)
      .eq('is_active', true)
      .maybeSingle()
    if (!fallbackError) return fallback as Product | null
  }

  console.error('[getProductBySlug] Unexpected DB error:', error)
  return null
}

// Produkte einer Kategorie
export async function getProductsByCategory(categorySlug: string) {
  const supabase = createSupabaseAdminClient()

  const result = await withSoftDeleteFilter<Product[]>((withFilter) => {
    let q = supabase
      .from('products')
      .select(`*, category:categories(*)`)
      .eq('is_active', true)
      .eq('categories.slug', categorySlug)
      .order('sort_order') as any

    if (withFilter) q = q.is('deleted_at', null)
    return q
  })

  return (result ?? []) as Product[]
}

// ============================================================
// CATEGORIES
// ============================================================

export async function getCategories(type?: CategoryType) {
  const supabase = createSupabaseAdminClient()

  let query = supabase
    .from('categories')
    .select('*')
    .order('sort_order')

  if (type) query = query.eq('type', type)

  const { data, error } = await query
  if (error) throw new Error(error.message)
  return data as Category[]
}

export async function getCategoryBySlug(slug: string) {
  const supabase = createSupabaseAdminClient()

  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error) return null
  return data as Category
}
