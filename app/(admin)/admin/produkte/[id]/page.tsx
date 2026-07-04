export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createSupabaseAdminClient } from '@/lib/supabase'
import EditProductForm from './EditProductForm'
import type { Product, Category } from '@/lib/types'
import styles from '../../form.module.css'

function getPublicUrl(product: Product): string {
  const cat = product.category as any
  const type     = cat?.type     as string | undefined
  const location = cat?.location as string | undefined
  if (type === 'sonderanfertigung') return `/sonderanfertigung/${product.slug}`
  if (type === 'extras')            return `/extras/${product.slug}`
  return `/${location ?? 'aussen'}/${product.slug}`
}

async function getData(id: string) {
  try {
    const supabase = createSupabaseAdminClient()
    const [{ data: product }, { data: categories }] = await Promise.all([
      supabase.from('products').select('*, category:categories(*)').eq('id', id).single(),
      supabase.from('categories').select('*').order('type').order('sort_order'),
    ])
    return { product: product as Product, categories: (categories as Category[]) ?? [] }
  } catch { return { product: null, categories: [] } }
}

export default async function EditProduktPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { product, categories } = await getData(id)
  if (!product) notFound()

  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <p className={styles.pageLabel}>// Produkte</p>
          <h1 className={styles.pageTitle}>Bearbeiten: {product!.name}</h1>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
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

      <EditProductForm product={product!} categories={categories} />
    </div>
  )
}
