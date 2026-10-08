import { createSupabaseAdminClient } from '@/lib/supabase'
import { getProductIdsForBereich } from '@/lib/queries/products'
import BereichPage from '@/components/public/BereichPage'
import type { Metadata } from 'next'
import type { Product, Category } from '@/lib/types'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title:       'Gartengestaltung – Terrassenplatten, Mauersteine & mehr | Gandl Natursteine',
  description: 'Natursteine für Ihren Garten und Außenbereich: Terrassenplatten, Mauersteine, Stelen, Blockstufen und vieles mehr. Gandl Natursteine, Inning am Ammersee.',
  alternates:  { canonical: 'https://gandl-natursteine.de/gartengestaltung' },
}

async function getData() {
  try {
    const supabase = createSupabaseAdminClient()
    const [productIds, { data: categories }] = await Promise.all([
      getProductIdsForBereich('gartengestaltung'),
      supabase.from('categories').select('*').eq('type', 'gartengestaltung').order('sort_order'),
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

export default async function GartengestaltungPage() {
  const { products, categories } = await getData()
  return (
    <BereichPage
      backHref="/bereiche"
      title="Gartengestaltung"
      label="Gartengestaltung"
      subtitle="Terrassenplatten · Mauersteine · Stelen · Blockstufen"
      basePath="/gartengestaltung"
      categories={categories}
      products={products}
    />
  )
}
