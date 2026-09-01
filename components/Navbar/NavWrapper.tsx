import { Suspense } from 'react'
import { createSupabaseAdminClient } from '@/lib/supabase'
import Navbar from './Navbar'
import type { Category, CategoryBereich } from '@/lib/types'

export type NavCategory = { name: string; slug: string }
export type NavBereich  = {
  key:        CategoryBereich
  label:      string
  categories: NavCategory[]
}

// Server Component: holt Kategorien und strukturiert für die Navbar
export default async function NavWrapper() {
  let bereiche: NavBereich[] = []
  let extrasCats: NavCategory[] = []

  try {
    const supabase = createSupabaseAdminClient()
    const { data } = await supabase
      .from('categories')
      .select('name, slug, type')
      .order('type')
      .order('sort_order')

    if (data) {
      const BEREICH_ORDER: CategoryBereich[] = ['eigenproduktion', 'sonderanfertigung', 'gartengestaltung']
      const LABELS: Record<CategoryBereich, string> = {
        eigenproduktion:  'Eigenproduktion',
        sonderanfertigung: 'Sonderanfertigung',
        gartengestaltung:  'Gartengestaltung',
        extras:            'Extras',
      }

      bereiche = BEREICH_ORDER.map((key) => ({
        key,
        label:      LABELS[key],
        categories: data.filter(c => c.type === key).map(({ name, slug }) => ({ name, slug })),
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
