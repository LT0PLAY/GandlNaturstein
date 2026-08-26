export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createSupabaseAdminClient } from '@/lib/supabase'
import EditProductForm from './EditProductForm'
import type { Product, Category } from '@/lib/types'
import styles from '../../form.module.css'

function getPublicUrl(product: Product): string {
  const bereich = (product as any).bereich ?? product.category?.type ?? 'massivproduktion'
  return `/${bereich}/${product.slug}`
}

async function getData(id: string) {
  try {
    const supabase = createSupabaseAdminClient()
    const [{ data: product }, { data: categories }] = await Promise.all([
      supabase.from('products').select('*, category:categories!products_category_id_fkey(*)').eq('id', id).single(),
      supabase.from('categories').select('*').order('type').order('sort_order'),
    ])

    // Weitere zugeordnete Kategorien (Mehrfachzuordnung) — tolerant, falls
    // Migration 024 (product_categories) noch nicht ausgeführt wurde.
    let extraCategoryIds: string[] = []
    try {
      const { data: links } = await supabase
        .from('product_categories').select('category_id').eq('product_id', id)
      extraCategoryIds = ((links ?? []) as { category_id: string }[])
        .map((l) => l.category_id)
        .filter((catId) => catId !== (product as any)?.category_id)
    } catch {}

    return { product: product as Product, categories: (categories as Category[]) ?? [], extraCategoryIds }
  } catch { return { product: null, categories: [], extraCategoryIds: [] as string[] } }
}

export default async function EditProduktPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { product, categories, extraCategoryIds } = await getData(id)
  if (!product) notFound()

  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <p className={styles.pageLabel}>// Produkte</p>
          <h1 className={styles.pageTitle}>Bearbeiten: {product!.name}</h1>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          <Link href="/admin/produkte" className={styles.btnEdit}>
            ← Zurück
          </Link>
          <a
            href={getPublicUrl(product!)}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.btnEdit}
            style={{ opacity: 0.75 }}
          >
            ↗ Vorschau
          </a>
        </div>
      </div>

      <EditProductForm product={product!} categories={categories} extraCategoryIds={extraCategoryIds} />
    </div>
  )
}
