import { Suspense } from 'react'
import { createSupabaseAdminClient } from '@/lib/supabase'
import Navbar from './Navbar'
import type { Category, CategoryBereich } from '@/lib/types'

export type NavCategory = { name: string; slug: string }
export type NavBereich  = {
  key:      CategoryBereich
  label:    string
  aussen:   NavCategory[]
  innen:    NavCategory[]
}

// Server Component: holt Kategorien und strukturiert für die Navbar
export default async function NavWrapper() {
  let bereiche: NavBereich[] = []
  let extrasCats: NavCategory[] = []

  try {
    const supabase = createSupabaseAdminClient()
    const { data } = await supabase
      .from('categories')
      .select('name, slug, type, location')
      .order('type')
      .order('sort_order')

    if (data) {
      // Bereiche mit Außen/Innen
      const BEREICH_ORDER: CategoryBereich[] = ['massivproduktion', 'sonderanfertigung', 'gartengestaltung']
      const LABELS: Record<CategoryBereich, string> = {
        massivproduktion:  'Massivproduktion',
        sonderanfertigung: 'Sonderanfertigung',
        gartengestaltung:  'Gartengestaltung',
        extras:            'Extras',
      }

      bereiche = BEREICH_ORDER.map((key) => ({
        key,
        label:  LABELS[key],
        aussen: data.filter(c => c.type === key && c.location === 'aussen').map(({ name, slug }) => ({ name, slug })),
        innen:  data.filter(c => c.type === key && c.location === 'innen').map(({ name, slug }) => ({ name, slug })),
      }))

      extrasCats = data
        .filter(c => c.type === 'extras')
        .map(({ name, slug }) => ({ name, slug }))
    }
  } catch {
    // graceful fallback
  }

  return (
    <Suspense fallback={<Navbar bereiche={bereiche} extrasCategories={extrasCats} />}>
      <Navbar bereiche={bereiche} extrasCategories={extrasCats} />
    </Suspense>
  )
}
