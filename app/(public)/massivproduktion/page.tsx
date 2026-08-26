import { createSupabaseAdminClient } from '@/lib/supabase'
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
    const [{ data: products }, { data: categories }] = await Promise.all([
      supabase.from('products')
        .select('*, category:categories!products_category_id_fkey(*)')
        .eq('is_active', true).is('deleted_at', null)
        .eq('bereich', 'massivproduktion')
        .order('sort_order'),
      supabase.from('categories').select('*').eq('type', 'massivproduktion').order('sort_order'),
    ])
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
