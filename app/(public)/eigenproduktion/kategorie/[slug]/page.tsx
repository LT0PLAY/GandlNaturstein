import { notFound } from 'next/navigation'
import { createSupabaseAdminClient } from '@/lib/supabase'
import { getProductIdsForCategory } from '@/lib/queries/products'
import BereichPage from '@/components/public/BereichPage'
import type { Metadata } from 'next'
import type { Product, Category } from '@/lib/types'
import { canonical, SITE_NAME, SITE_URL } from '@/lib/seo'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const { data: cat } = await createSupabaseAdminClient()
    .from('categories').select('name, description').eq('slug', slug).eq('type', 'eigenproduktion').single()
  if (!cat) return { title: 'Kategorie nicht gefunden' }
  return {
    title:       `${cat.name} | ${SITE_NAME}`,
    description: cat.description ?? `${cat.name} – ${SITE_NAME}, Inning am Ammersee.`,
    alternates:  { canonical: canonical(`/eigenproduktion/kategorie/${slug}`) },
    openGraph: {
      title:       `${cat.name} | ${SITE_NAME}`,
      description: cat.description ?? `${cat.name}.`,
      type:        'website',
    },
  }
}

async function getData(kategorieSlug: string) {
  try {
    const supabase = createSupabaseAdminClient()
    const [{ data: cat }, { data: categories }] = await Promise.all([
      supabase.from('categories').select('id').eq('slug', kategorieSlug).eq('type', 'eigenproduktion').maybeSingle(),
      supabase.from('categories').select('*').eq('type', 'eigenproduktion').order('sort_order'),
    ])
    if (!cat) return { products: [], categories: (categories as Category[]) ?? [] }

    // Produkte, die dieser Kategorie zugeordnet sind — Hauptkategorie ODER
    // Mehrfachzuordnung (product_categories), damit ein Produkt auch dann
    // hier erscheint, wenn diese Kategorie nur eine zusätzliche ist.
    const productIds = await getProductIdsForCategory(cat.id)
    if (productIds.length === 0) return { products: [], categories: (categories as Category[]) ?? [] }

    // Kein zusätzlicher .eq('bereich', ...)-Filter mehr hier: die Kategorie-
    // Zuordnung (productIds, via Haupt- oder Mehrfachkategorie) entscheidet
    // allein, ob ein Produkt hier erscheint — auch wenn sein eigenes
    // "Hauptbereich"-Feld einem anderen Bereich zugeordnet ist.
    const { data: products } = await supabase
      .from('products')
      .select('*, category:categories!products_category_id_fkey(*)')
      .eq('is_active', true)
      .is('deleted_at', null)
      .in('id', productIds)
      .order('sort_order')

    return { products: (products as Product[]) ?? [], categories: (categories as Category[]) ?? [] }
  } catch { return { products: [], categories: [] } }
}

export default async function eigenproduktionKategoriePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = createSupabaseAdminClient()
  const { data: cat } = await supabase
    .from('categories').select('*').eq('slug', slug).eq('type', 'eigenproduktion').single()
  if (!cat) notFound()

  const { products, categories } = await getData(slug)

  const jsonLd = {
    '@context':  'https://schema.org',
    '@type':     'CollectionPage',
    name:        cat.name,
    description: cat.description ?? cat.name,
    url:         `${SITE_URL}/eigenproduktion/kategorie/${slug}`,
    provider:    { '@type': 'Organization', name: SITE_NAME },
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <BereichPage
        title={cat.name}
        label="Eigenproduktion"
        heroImage={cat.image_url}
        categoryDescription={cat.description}
        basePath="/eigenproduktion"
        categories={categories}
        products={products}
      />
    </>
  )
}
