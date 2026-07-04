import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Suspense } from 'react'
import { createSupabaseAdminClient } from '@/lib/supabase'
import CategoryFilter from '@/components/public/CategoryFilter'
import type { Metadata } from 'next'
import type { Product, Category } from '@/lib/types'
import styles from '../../../category.module.css'
import { canonical, SITE_NAME, SITE_URL } from '@/lib/seo'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const { data: cat } = await createSupabaseAdminClient()
    .from('categories').select('name, description').eq('slug', slug).eq('location', 'aussen').single()
  if (!cat) return { title: 'Kategorie nicht gefunden' }
  return {
    title:       `${cat.name} – Außenbereich Naturstein | ${SITE_NAME}`,
    description: cat.description ?? `Hochwertige Natursteine ${cat.name} für den Außenbereich. Beratung & Lieferung – ${SITE_NAME}, Inning am Ammersee.`,
    alternates:  { canonical: canonical(`/aussen/kategorie/${slug}`) },
    openGraph: {
      title:       `${cat.name} – Außenbereich | ${SITE_NAME}`,
      description: cat.description ?? `Naturstein ${cat.name} für den Außenbereich.`,
      type:        'website',
    },
  }
}

async function getData(kategorieSlug: string) {
  try {
    const supabase = createSupabaseAdminClient()
    const [{ data: products }, { data: categories }] = await Promise.all([
      supabase.from('products')
        .select('*, category:categories!inner(*)')
        .eq('is_active', true)
        .is('deleted_at', null)
        .eq('category.location', 'aussen')
        .eq('category.slug', kategorieSlug)
        .order('sort_order'),
      supabase.from('categories').select('*').eq('location', 'aussen').order('sort_order'),
    ])
    return { products: (products as Product[]) ?? [], categories: (categories as Category[]) ?? [] }
  } catch { return { products: [], categories: [] } }
}

export default async function AussenKategoriePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = createSupabaseAdminClient()
  const { data: cat } = await supabase
    .from('categories').select('*').eq('slug', slug).eq('location', 'aussen').single()
  if (!cat) notFound()

  const { products, categories } = await getData(slug)

  const jsonLd = {
    '@context':  'https://schema.org',
    '@type':     'CollectionPage',
    name:        `${cat.name} – Außenbereich Naturstein`,
    description: cat.description ?? `Naturstein ${cat.name} für den Außenbereich`,
    url:         `${SITE_URL}/aussen/kategorie/${slug}`,
    provider:    { '@type': 'Organization', name: SITE_NAME },
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <section className={styles.page}>
        <div className={styles.hero}>
          <p className={styles.label}>// Außenbereich</p>
          <h1 className={styles.title}>{cat.name}</h1>
          <p className={styles.subtitle}>Außenbereich · Naturstein{cat.description ? ` · ${cat.description.slice(0, 60)}` : ''}</p>
        </div>

        <Suspense>
          <CategoryFilter categories={categories} basePath="/aussen" />
        </Suspense>

        {products.length === 0 ? (
          <div className={styles.empty}>
            <p>Noch keine Produkte in dieser Kategorie.</p>
            <Link href="/aussen" style={{ color: 'var(--color-gold)' }}>← Alle Außenbereich-Produkte</Link>
          </div>
        ) : (
          <div className={styles.grid}>
            {products.map((product) => (
              <Link key={product.id} href={`/aussen/${product.slug}`} className={styles.card} style={{ textDecoration: 'none', display: 'block' }}>
                <div className={styles.cardImage}>
                  {product.thumbnail
                    ? <img src={product.thumbnail} alt={product.image_alts?.[product.thumbnail] ?? product.name} className={styles.img} />
                    : <div className={styles.imgPlaceholder}><span>{product.material ?? 'Naturstein'}</span></div>}
                  {(product.category as any)?.name && <span className={styles.categoryBadge}>{(product.category as any).name}</span>}
                </div>
                <div className={styles.cardBody}>
                  <p className={styles.cardMaterial}>{product.material}</p>
                  <h3 className={styles.cardTitle}>{product.name}</h3>
                  <p className={styles.cardSurface}>{product.surface}</p>
                  <span className={styles.cardCta}>Details & Anfrage →</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </>
  )
}
