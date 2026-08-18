import { createSupabaseAdminClient } from '@/lib/supabase'
import BereichListingPage from '@/components/public/BereichListingPage'
import type { Metadata } from 'next'
import type { Product, Category } from '@/lib/types'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title:       'Massivproduktion – Jura Kalkstein & Muschelkalk | Gandl Natursteine',
  description: 'Natursteine aus eigener Massivproduktion: Jura Kalkstein, Muschelkalk und mehr – für Außen- und Innenbereich. Gandl Natursteine, Inning am Ammersee.',
  alternates:  { canonical: 'https://gandl-natursteine.de/massivproduktion' },
}

async function getData() {
  try {
    const supabase = createSupabaseAdminClient()
    const [
      { data: aussenProds },
      { data: innenProds },
      { data: aussenCats },
      { data: innenCats },
    ] = await Promise.all([
      supabase.from('products')
        .select('*, category:categories!inner(*)')
        .eq('is_active', true).is('deleted_at', null)
        .eq('category.type', 'massivproduktion')
        .eq('category.location', 'aussen')
        .order('sort_order'),
      supabase.from('products')
        .select('*, category:categories!inner(*)')
        .eq('is_active', true).is('deleted_at', null)
        .eq('category.type', 'massivproduktion')
        .eq('category.location', 'innen')
        .order('sort_order'),
      supabase.from('categories').select('*')
        .eq('type', 'massivproduktion').eq('location', 'aussen').order('sort_order'),
      supabase.from('categories').select('*')
        .eq('type', 'massivproduktion').eq('location', 'innen').order('sort_order'),
    ])
    return {
      aussenProducts:   (aussenProds as Product[])  ?? [],
      innenProducts:    (innenProds  as Product[])  ?? [],
      aussenCategories: (aussenCats  as Category[]) ?? [],
      innenCategories:  (innenCats   as Category[]) ?? [],
    }
  } catch {
    return { aussenProducts: [], innenProducts: [], aussenCategories: [], innenCategories: [] }
  }
}

export default async function MassivproduktionPage() {
  const data = await getData()
  return (
    <BereichListingPage
      title="Massivproduktion"
      label="Massivproduktion"
      aussenSubtitle="Pflaster · Stufen · Fassaden · Terrassen"
      innenSubtitle="Böden · Treppen · Bad · Küche"
      {...data}
    />
  )
}
