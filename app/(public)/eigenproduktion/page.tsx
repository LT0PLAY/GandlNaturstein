import { createSupabaseAdminClient } from '@/lib/supabase'
import { getProductIdsForBereich } from '@/lib/queries/products'
import BereichPage from '@/components/public/BereichPage'
import type { Metadata } from 'next'
import type { Product, Category } from '@/lib/types'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title:       'Eigenproduktion – Jura Kalkstein & Muschelkalk | Gandl Natursteine',
  description: 'Natursteine aus eigener Eigenproduktion: Jura Kalkstein, Muschelkalk und mehr. Gandl Natursteine, Inning am Ammersee.',
  alternates:  { canonical: 'https://gandl-natursteine.de/eigenproduktion' },
}

async function getData() {
  try {
    const supabase = createSupabaseAdminClient()
    const [productIds, { data: categories }] = await Promise.all([
      getProductIdsForBereich('eigenproduktion'),
      supabase.from('categories').select('*').eq('type', 'eigenproduktion').order('sort_order'),
    ])

    if (productIds.length === 0) return { products: [], categories: (categories as Category[]) ?? [] }

    const { data: products } = await supabase
      .from('products')
      .select('*, category:categories!products_category_id_fkey(*)')
      .eq('is_active', true).is('deleted_at', null)
      .in('id', productIds)
      .order('sort_order')

    return { products: (products as Product[]) ?? [], categories: (categories as Category[]) ?? [] }
  } catch {
    return { products: [], categories: [] }
  }
}

export default async function EigenproduktionPage() {
  const { products, categories } = await getData()
  return (
    <BereichPage
      backHref="/bereiche"
      title="Eigenproduktion"
      label="Eigenproduktion"
      subtitle="Jura Kalkstein · Kirchheimer Muschelkalk · und mehr"
      basePath="/eigenproduktion"
      categories={categories}
      products={products}
    />
  )
}
