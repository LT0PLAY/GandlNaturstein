import type { MetadataRoute } from 'next'
import { createSupabaseAdminClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://gandl-natursteine.de'

function url(path: string, priority = 0.7, changefreq?: string) {
  return {
    url: `${BASE}${path}`,
    lastModified: new Date(),
    priority,
    changefreq: (changefreq ?? 'weekly') as MetadataRoute.Sitemap[0]['changeFrequency'],
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createSupabaseAdminClient()

  // Alle aktiven Produkte mit Kategorie
  const { data: products } = await supabase
    .from('products')
    .select('slug, updated_at, category:categories(type, location)')
    .eq('is_active', true)
    .is('deleted_at', null)

  // Alle veröffentlichten Referenzen
  const { data: references } = await supabase
    .from('project_references')
    .select('slug, updated_at')
    .eq('is_published', true)
    .is('deleted_at', null)

  // Alle aktiven Kategorien (deleted_at / updated_at evtl. nicht vorhanden → Fallback)
  let categories: any[] = []
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('slug, type, location')
      .is('deleted_at', null)
    if (!error) categories = data ?? []
    else {
      // deleted_at-Spalte existiert noch nicht → ohne Filter laden
      const { data: fallback } = await supabase
        .from('categories')
        .select('slug, type, location')
      categories = fallback ?? []
    }
  } catch { /* ignore */ }

  // Produkt-URLs — je nach Kategorie-Typ den richtigen Pfad wählen
  const productUrls: MetadataRoute.Sitemap = (products ?? []).map((p: any) => {
    const type     = p.category?.type     as string | undefined
    const location = p.category?.location as string | undefined
    let path = `/${location ?? 'aussen'}/${p.slug}`
    if (type === 'sonderanfertigung') path = `/sonderanfertigung/${p.slug}`
    else if (type === 'extras')       path = `/extras/${p.slug}`
    return {
      url:          `${BASE}${path}`,
      lastModified: new Date(p.updated_at),
      priority:     0.8,
      changeFrequency: 'weekly' as const,
    }
  })

  // Referenz-URLs
  const referenceUrls: MetadataRoute.Sitemap = (references ?? []).map((r: any) => ({
    url:          `${BASE}/referenzen/${r.slug}`,
    lastModified: new Date(r.updated_at),
    priority:     0.7,
    changeFrequency: 'monthly' as const,
  }))

  // Kategorie-URLs — je nach Bereich den richtigen Pfad wählen
  const categoryUrls: MetadataRoute.Sitemap = (categories ?? []).map((c: any) => {
    let basePath = `/${c.location ?? 'aussen'}`
    if (c.type === 'sonderanfertigung') basePath = '/sonderanfertigung'
    else if (c.type === 'extras')       basePath = '/extras'
    return {
      url:          `${BASE}${basePath}/kategorie/${c.slug}`,
      lastModified: new Date(),
      priority:     0.75,
      changeFrequency: 'weekly' as const,
    }
  })

  // Statische Seiten
  const staticUrls: MetadataRoute.Sitemap = [
    url('/',                  1.0, 'weekly'),
    url('/aussen',            0.9, 'daily'),
    url('/innen',             0.9, 'daily'),
    url('/sonderanfertigung', 0.8, 'weekly'),
    url('/extras',            0.7, 'weekly'),
    url('/referenzen',        0.8, 'weekly'),
    url('/ueber-uns',         0.6, 'monthly'),
    url('/karriere',          0.6, 'weekly'),
    url('/impressum',         0.3, 'yearly'),
    url('/datenschutz',       0.3, 'yearly'),
    url('/agb',               0.3, 'yearly'),
  ]

  return [...staticUrls, ...categoryUrls, ...productUrls, ...referenceUrls]
}
