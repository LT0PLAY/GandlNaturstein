import { createSupabaseAdminClient } from '@/lib/supabase'
import { getProductIdsForBereich } from '@/lib/queries/products'
import BereichPage from '@/components/public/BereichPage'
import type { Metadata } from 'next'
import type { Product, Category } from '@/lib/types'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title:       'Sonderanfertigung – Individuelle Natursteine nach Maß | Gandl Natursteine',
  description: 'Maßgefertigte Natursteine nach Ihren Wünschen: Skulpturen, Restaurierung, individuelle Anfertigungen. Handwerkliche Qualität. Gandl Natursteine, Inning am Ammersee.',
  alternates:  { canonical: 'https://gandl-natursteine.de/sonderanfertigung' },
}

async function getData() {
  try {
    const supabase = createSupabaseAdminClient()
    const [productIds, { data: categories }] = await Promise.all([
      getProductIdsForBereich('sonderanfertigung'),
      supabase.from('categories').select('*').eq('type', 'sonderanfertigung').order('sort_order'),
    ])

    if (productIds.length === 0) return { products: [], categories: (categories as Category[]) ?? [] }

    const { data: products } = await supabase
      .from('products')
      .select('*, category:categories!products_category_id_fkey(*)')
      .eq('is_active', true).is('deleted_at', null)
      .in('id', productIds)
      .order('sort_order')

    return { products: (products as Product[]) ?? [], categories: (categories as Category[]) ?? [] }
  } catch { return { products: [], categories: [] } }
}

export default async function SonderanfertigungPage() {
  const { products, categories } = await getData()
  return (
    <BereichPage
      title="Sonderanfertigung"
      label="Sonderanfertigung"
      subtitle="Maßarbeit · Skulpturen · Restaurierung"
      basePath="/sonderanfertigung"
      categories={categories}
      products={products}
    />
  )
}
