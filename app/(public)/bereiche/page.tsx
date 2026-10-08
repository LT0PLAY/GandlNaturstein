import { canonical } from '@/lib/seo'
import Link from 'next/link'
import { createSupabaseAdminClient } from '@/lib/supabase'
import type { Metadata } from 'next'
import type { Category, CategoryBereich } from '@/lib/types'
import { BEREICH_LABELS } from '@/lib/types'
import styles from '../category.module.css'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title:       'Unsere Bereiche – Alle Kategorien | Gandl Natursteine',
  description: 'Alle Kategorien von Gandl Natursteine auf einen Blick: Eigenproduktion, Sonderanfertigung, Gartengestaltung und Extras.',
  alternates:  { canonical: canonical('/bereiche') },
}

const BEREICH_ORDER: CategoryBereich[] = ['eigenproduktion', 'sonderanfertigung', 'gartengestaltung', 'extras']

async function getData() {
  try {
    const supabase = createSupabaseAdminClient()
    const { data } = await supabase
      .from('categories')
      .select('*')
      .is('deleted_at', null)
      .order('type')
      .order('sort_order')
    return (data as Category[]) ?? []
  } catch { return [] }
}

export default async function BereichePage() {
  const categories = await getData()

  const grouped: Record<string, Category[]> = {}
  for (const cat of categories) {
    if (!grouped[cat.type]) grouped[cat.type] = []
    grouped[cat.type].push(cat)
  }

  return (
    <div className={styles.pageBg}>
    <section className={styles.page}>
      <div className={styles.hero}>
        <p className={styles.label}>// Übersicht</p>
        <h1 className={styles.title}>Unsere Bereiche</h1>
        <p className={styles.subtitle}>Alle Kategorien auf einen Blick</p>
      </div>

      {BEREICH_ORDER.map((bereich) => {
        const cats = grouped[bereich] ?? []
        return (
          <div key={bereich} className={styles.bereichGroup}>
            <h2 className={styles.bereichGroupTitle}>
              <Link href={`/${bereich}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                {BEREICH_LABELS[bereich]} →
              </Link>
            </h2>

            {cats.length === 0 ? (
              <p style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-inter)', fontSize: '15px' }}>
                Noch keine Kategorien — <Link href={`/${bereich}`} style={{ color: 'var(--color-sage)' }}>alle Produkte ansehen →</Link>
              </p>
            ) : (
              <div className={styles.categoriesGrid}>
                {cats.map((cat) => (
                  <Link key={cat.id} href={`/${bereich}/kategorie/${cat.slug}`} className={styles.categoryCard}>
                    {cat.image_url ? (
                      <img src={cat.image_url} alt={cat.name} className={styles.categoryCardImg} />
                    ) : (
                      <div className={styles.categoryCardPlaceholder} />
                    )}
                    <div className={styles.categoryCardOverlay}>
                      <span className={styles.categoryCardTitle}>{cat.name}</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )
      })}
    </section>
    </div>
  )
}
