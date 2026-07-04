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
    .from('categories').select('name, description').eq('slug', slug).eq('type', 'sonderanfertigung').single()
  if (!cat) return { title: 'Kategorie nicht gefunden' }
  return {
    title:       `${cat.name} – Sonderanfertigung Naturstein | ${SITE_NAME}`,
    description: cat.description ?? `Individuelle Naturstein-Sonderanfertigung ${cat.name}. Maßgefertigt nach Ihren Wünschen – ${SITE_NAME}, Inning am Ammersee.`,
    alternates:  { canonical: canonical(`/sonderanfertigung/kategorie/${slug}`) },
    openGraph: {
      title:       `${cat.name} – Sonderanfertigung | ${SITE_NAME}`,
      description: cat.description ?? `Naturstein ${cat.name} – Sonderanfertigung.`,
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
        .eq('category.type', 'sonderanfertigung')
        .eq('category.slug', kategorieSlug)
        .order('sort_order'),
      supabase.from('categories').select('*').eq('type', 'sonderanfertigung').order('sort_order'),
    ])
    return { products: (products as Product[]) ?? [], categories: (categories as Category[]) ?? [] }
  } catch { return { products: [], categories: [] } }
}

export default async function SonderanfertigungKategoriePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = createSupabaseAdminClient()
  const { data: cat } = await supabase
    .from('categories').select('*').eq('slug', slug).eq('type', 'sonderanfertigung').single()
  if (!cat) notFound()

  const { products, categories } = await getData(slug)

  const jsonLd = {
    '@context':  'https://schema.org',
    '@type':     'CollectionPage',
    name:        `${cat.name} – Sonderanfertigung Naturstein`,
    description: cat.description ?? `Naturstein-Sonderanfertigung ${cat.name}`,
    url:         `${SITE_URL}/sonderanfertigung/kategorie/${slug}`,
    provider:    { '@type': 'Organization', name: SITE_NAME },
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <section className={styles.page}>
        <div className={styles.hero}>
          <p className={styles.label}>// Sonderanfertigung</p>
          <h1 className={styles.title}>{cat.name}</h1>
          <p className={styles.subtitle}>Sonderanfertigung · Maßarbeit{cat.description ? ` · ${cat.description.slice(0, 60)}` : ''}</p>
        </div>

        <Suspense>
          <CategoryFilter categories={categories} basePath="/sonderanfertigung" />
        </Suspense>

        {products.length === 0 ? (
          <div className={styles.empty}>
            <p>Noch keine Produkte in dieser Kategorie.</p>
            <Link href="/sonderanfertigung" style={{ color: 'var(--color-gold)' }}>← Alle Sonderanfertigungen</Link>
          </div>
        ) : (
          <div className={styles.grid}>
            {products.map((product) => (
              <Link key={product.id} href={`/sonderanfertigung/${product.slug}`} className={styles.card} style={{ textDecoration: 'none', display: 'block' }}>
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
