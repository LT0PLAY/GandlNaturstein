import { createSupabaseAdminClient } from '@/lib/supabase'
import { getProductIdsForBereich } from '@/lib/queries/products'
import BereichPage from '@/components/public/BereichPage'
import type { Metadata } from 'next'
import type { Product, Category } from '@/lib/types'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title:       'Massivproduktion – Jura Kalkstein & Muschelkalk | Gandl Natursteine',
  description: 'Natursteine aus eigener Massivproduktion: Jura Kalkstein, Muschelkalk und mehr. Gandl Natursteine, Inning am Ammersee.',
  alternates:  { canonical: 'https://gandl-natursteine.de/massivproduktion' },
}

async function getData() {
  try {
    const supabase = createSupabaseAdminClient()
    const [productIds, { data: categories }] = await Promise.all([
      getProductIdsForBereich('massivproduktion'),
      supabase.from('categories').select('*').eq('type', 'massivproduktion').order('sort_order'),
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

export default async function MassivproduktionPage() {
  const { products, categories } = await getData()
  return (
    <BereichPage
      title="Massivproduktion"
      label="Massivproduktion"
      subtitle="Jura Kalkstein · Kirchheimer Muschelkalk · und mehr"
      basePath="/massivproduktion"
      categories={categories}
      products={products}
    />
  )
}
