import { createSupabaseAdminClient } from '@/lib/supabase'
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
    const [{ data: products }, { data: categories }] = await Promise.all([
      supabase.from('products')
        .select('*, category:categories!products_category_id_fkey(*)')
        .eq('is_active', true)
        .is('deleted_at', null)
        .eq('bereich', 'sonderanfertigung')
        .order('sort_order'),
      supabase.from('categories').select('*').eq('type', 'sonderanfertigung').order('sort_order'),
    ])
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
