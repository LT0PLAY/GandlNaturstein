import type { MetadataRoute } from 'next'
import { createSupabaseAdminClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://gandl-natursteine.de'

function url(path: string, priority = 0.7, changefreq?: string) {
  return {
    url: `${BASE}${path}`,
    priority,
    changefreq: (changefreq ?? 'weekly') as MetadataRoute.Sitemap[0]['changeFrequency'],
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createSupabaseAdminClient()

  // Alle aktiven Produkte mit Kategorie. PostgREST liefert pro Anfrage maximal
  // 1000 Zeilen — daher seitenweise laden, sonst fehlen bei großem Sortiment
  // still und leise Produkte in der Sitemap.
  const products: any[] = []
  const PAGE = 1000
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await supabase
      .from('products')
      .select('slug, updated_at, bereich, category:categories!products_category_id_fkey(type)')
      .eq('is_active', true)
      .is('deleted_at', null)
      .order('created_at')
      .range(from, from + PAGE - 1)
    if (error || !data) break
    products.push(...data)
    if (data.length < PAGE) break
  }

  // Alle veröffentlichten Referenzen
  const { data: references } = await supabase
    .from('project_references')
    .select('slug, updated_at')
    .eq('is_published', true)
    .is('deleted_at', null)

  // Alle aktiven Kategorien (deleted_at evtl. nicht vorhanden → Fallback)
  let categories: any[] = []
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('slug, type')
      .is('deleted_at', null)
    if (!error) categories = data ?? []
    else {
      const { data: fallback } = await supabase.from('categories').select('slug, type')
      categories = fallback ?? []
    }
  } catch { /* ignore */ }

  // Produkt-URLs — Bereich bestimmt den Pfad
  const productUrls: MetadataRoute.Sitemap = products.map((p: any) => {
    const bereich = p.bereich ?? p.category?.type ?? 'eigenproduktion'
    return {
      url:          `${BASE}/${bereich}/${p.slug}`,
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

  // Kategorie-URLs
  const categoryUrls: MetadataRoute.Sitemap = (categories ?? []).map((c: any) => ({
    url:          `${BASE}/${c.type}/kategorie/${c.slug}`,
    priority:     0.75,
    changeFrequency: 'weekly' as const,
  }))

  // Statische Seiten
  const staticUrls: MetadataRoute.Sitemap = [
    url('/',                   1.0, 'weekly'),
    url('/eigenproduktion',   0.9, 'daily'),
    url('/sonderanfertigung',  0.8, 'weekly'),
    url('/gartengestaltung',   0.8, 'weekly'),
    url('/extras',             0.7, 'weekly'),
    url('/referenzen',         0.8, 'weekly'),
    url('/ueber-uns',          0.6, 'monthly'),
    url('/karriere',           0.6, 'weekly'),
    url('/bereiche',           0.8, 'weekly'),
    url('/kontakt',            0.7, 'monthly'),
    url('/restposten',         0.6, 'weekly'),
    url('/unsere-partner',     0.5, 'monthly'),
    url('/ausstellungsguide',  0.5, 'monthly'),
    url('/weitere-infos',      0.5, 'monthly'),
    url('/oekostrom',          0.4, 'yearly'),
    url('/versand-zahlung',    0.3, 'yearly'),
    url('/widerrufsrecht',     0.3, 'yearly'),
    url('/impressum',          0.3, 'yearly'),
    url('/datenschutz',        0.3, 'yearly'),
    url('/agb',                0.3, 'yearly'),
  ]

  return [...staticUrls, ...categoryUrls, ...productUrls, ...referenceUrls]
}
