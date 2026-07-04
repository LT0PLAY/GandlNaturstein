import Link from 'next/link'
import { Suspense } from 'react'
import { createSupabaseAdminClient } from '@/lib/supabase'
import CategoryFilter from '@/components/public/CategoryFilter'
import type { Metadata } from 'next'
import type { Product, Category } from '@/lib/types'
import styles from '../category.module.css'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title:       'Sonderanfertigung – Individuelle Natursteine nach Maß | Gandl Natursteine',
  description: 'Maßgefertigte Natursteine nach Ihren Wünschen: Skulpturen, Restaurierung, individuelle Anfertigungen. Handwerkliche Qualität. Gandl Natursteine, Inning am Ammersee.',
  alternates:  { canonical: 'https://gandl-natursteine.de/sonderanfertigung' },
}

async function getData() {
  try {
    const supabase = createSupabaseAdminClient()
    const [{ data: products }, { data: categories }] = await Promise.all([
      supabase.from('products')
        .select('*, category:categories!inner(*)')
        .eq('is_active', true)
        .is('deleted_at', null)
        .eq('category.type', 'sonderanfertigung')
        .order('sort_order'),
      supabase.from('categories').select('*').eq('type', 'sonderanfertigung').order('sort_order'),
    ])
    return { products: (products as Product[]) ?? [], categories: (categories as Category[]) ?? [] }
  } catch { return { products: [], categories: [] } }
}

export default async function SonderanfertigungPage() {
  const { products, categories } = await getData()

  return (
    <section className={styles.page}>
      <div className={styles.hero}>
        <p className={styles.label}>// Sonderanfertigung</p>
        <h1 className={styles.title}>Sonderanfertigung</h1>
        <p className={styles.subtitle}>Maßarbeit · Skulpturen · Restaurierung</p>
      </div>

      <Suspense>
        <CategoryFilter categories={categories} basePath="/sonderanfertigung" />
      </Suspense>

      {products.length === 0 ? (
        <div className={styles.empty}>
          <p>Keine Produkte in dieser Kategorie.</p>
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
  )
}
