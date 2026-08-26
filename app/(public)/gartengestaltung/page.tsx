import { createSupabaseAdminClient } from '@/lib/supabase'
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
    const [{ data: products }, { data: categories }] = await Promise.all([
      supabase.from('products')
        .select('*, category:categories!products_category_id_fkey(*)')
        .eq('is_active', true).is('deleted_at', null)
        .eq('bereich', 'gartengestaltung')
        .order('sort_order'),
      supabase.from('categories').select('*').eq('type', 'gartengestaltung').order('sort_order'),
    ])
    return { products: (products as Product[]) ?? [], categories: (categories as Category[]) ?? [] }
  } catch {
    return { products: [], categories: [] }
  }
}

export default async function GartengestaltungPage() {
  const { products, categories } = await getData()
  return (
    <BereichPage
      title="Gartengestaltung"
      label="Gartengestaltung"
      subtitle="Terrassenplatten · Mauersteine · Stelen · Blockstufen"
      basePath="/gartengestaltung"
      categories={categories}
      products={products}
    />
  )
}
