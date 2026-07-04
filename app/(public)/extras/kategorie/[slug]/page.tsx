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
    .from('categories').select('name, description').eq('slug', slug).eq('type', 'extras').single()
  if (!cat) return { title: 'Kategorie nicht gefunden' }
  return {
    title:       `${cat.name} – Naturstein Extras & Zubehör | ${SITE_NAME}`,
    description: cat.description ?? `${cat.name} – Naturstein-Zubehör und Pflegeprodukte von ${SITE_NAME}, Inning am Ammersee.`,
    alternates:  { canonical: canonical(`/extras/kategorie/${slug}`) },
    openGraph: {
      title:       `${cat.name} – Extras | ${SITE_NAME}`,
      description: cat.description ?? `${cat.name} – Naturstein Extras.`,
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
        .eq('category.type', 'extras')
        .eq('category.slug', kategorieSlug)
        .order('sort_order'),
      supabase.from('categories').select('*').eq('type', 'extras').order('sort_order'),
    ])
    return { products: (products as Product[]) ?? [], categories: (categories as Category[]) ?? [] }
  } catch { return { products: [], categories: [] } }
}

export default async function ExtrasKategoriePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = createSupabaseAdminClient()
  const { data: cat } = await supabase
    .from('categories').select('*').eq('slug', slug).eq('type', 'extras').single()
  if (!cat) notFound()

  const { products, categories } = await getData(slug)

  const jsonLd = {
    '@context':  'https://schema.org',
    '@type':     'CollectionPage',
    name:        `${cat.name} – Naturstein Extras`,
    description: cat.description ?? `Naturstein-Zubehör ${cat.name}`,
    url:         `${SITE_URL}/extras/kategorie/${slug}`,
    provider:    { '@type': 'Organization', name: SITE_NAME },
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <section className={styles.page}>
        <div className={styles.hero}>
          <p className={styles.label}>// Extras</p>
          <h1 className={styles.title}>{cat.name}</h1>
          <p className={styles.subtitle}>Extras · Zubehör{cat.description ? ` · ${cat.description.slice(0, 60)}` : ''}</p>
        </div>

        <Suspense>
          <CategoryFilter categories={categories} basePath="/extras" />
        </Suspense>

        {products.length === 0 ? (
          <div className={styles.empty}>
            <p>Noch keine Produkte in dieser Kategorie.</p>
            <Link href="/extras" style={{ color: 'var(--color-gold)' }}>← Alle Extras</Link>
          </div>
        ) : (
          <div className={styles.grid}>
            {products.map((product) => (
              <Link key={product.id} href={`/extras/${product.slug}`} className={styles.card} style={{ textDecoration: 'none', display: 'block' }}>
                <div className={styles.cardImage}>
                  {product.thumbnail
                    ? <img src={product.thumbnail} alt={product.image_alts?.[product.thumbnail] ?? product.name} className={styles.img} />
                    : <div className={styles.imgPlaceholder}><span>{product.material ?? 'Extras'}</span></div>}
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
