import { createSupabaseAdminClient } from '@/lib/supabase'
import BereichListingPage from '@/components/public/BereichListingPage'
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
    const [
      { data: aussenProds },
      { data: innenProds },
      { data: aussenCats },
      { data: innenCats },
    ] = await Promise.all([
      supabase.from('products')
        .select('*, category:categories!inner(*)')
        .eq('is_active', true).is('deleted_at', null)
        .eq('category.type', 'gartengestaltung')
        .eq('category.location', 'aussen')
        .order('sort_order'),
      supabase.from('products')
        .select('*, category:categories!inner(*)')
        .eq('is_active', true).is('deleted_at', null)
        .eq('category.type', 'gartengestaltung')
        .eq('category.location', 'innen')
        .order('sort_order'),
      supabase.from('categories').select('*')
        .eq('type', 'gartengestaltung').eq('location', 'aussen').order('sort_order'),
      supabase.from('categories').select('*')
        .eq('type', 'gartengestaltung').eq('location', 'innen').order('sort_order'),
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

export default async function GartengestaltungPage() {
  const data = await getData()
  return (
    <BereichListingPage
      title="Gartengestaltung"
      label="Gartengestaltung"
      aussenSubtitle="Terrassenplatten · Mauersteine · Stelen · Blockstufen"
      innenSubtitle="Naturstein im Innenbereich"
      {...data}
    />
  )
}
