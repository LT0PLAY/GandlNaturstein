import { createSupabaseAdminClient } from '@/lib/supabase'
import BereichPage from '@/components/public/BereichPage'
import type { Metadata } from 'next'
import type { Product, Category } from '@/lib/types'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title:       'Extras – Pflegemittel, Zubehör & mehr | Gandl Natursteine',
  description: 'Naturstein-Pflegemittel, Reiniger, Zubehör und mehr. Alles für die Pflege und Verarbeitung Ihrer Natursteine. Gandl Natursteine, Inning am Ammersee.',
  alternates:  { canonical: 'https://gandl-natursteine.de/extras' },
}

async function getData() {
  try {
    const supabase = createSupabaseAdminClient()
    const [{ data: products }, { data: categories }] = await Promise.all([
      supabase.from('products')
        .select('*, category:categories!products_category_id_fkey(*)')
        .eq('is_active', true)
        .is('deleted_at', null)
        .eq('bereich', 'extras')
        .order('sort_order'),
      supabase.from('categories').select('*').eq('type', 'extras').order('sort_order'),
    ])
    return { products: (products as Product[]) ?? [], categories: (categories as Category[]) ?? [] }
  } catch { return { products: [], categories: [] } }
}

export default async function ExtrasPage() {
  const { products, categories } = await getData()
  return (
    <BereichPage
      title="Extras"
      label="Extras"
      subtitle="Pflegemittel · Zubehör · Sonstiges"
      basePath="/extras"
      categories={categories}
      products={products}
    />
  )
}
