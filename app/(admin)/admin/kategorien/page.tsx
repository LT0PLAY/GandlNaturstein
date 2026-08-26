export const dynamic = 'force-dynamic'

import React from 'react'
import Link from 'next/link'
import { createSupabaseAdminClient } from '@/lib/supabase'
import { deleteCategory } from '@/lib/actions/categories'
import DeleteButton from '@/components/admin/DeleteButton'
import type { Category } from '@/lib/types'
import { BEREICH_LABELS } from '@/lib/types'
import styles from '../table.module.css'

async function getCategories(): Promise<Category[]> {
  const supabase = createSupabaseAdminClient()
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .is('deleted_at', null)
    .order('type')
    .order('sort_order')

  if (!error) return (data as Category[]) ?? []

  if (error.code === '42703' || error.message?.includes('deleted_at')) {
    const { data: fallback } = await supabase
      .from('categories')
      .select('*')
      .order('type')
      .order('sort_order')
    return (fallback as Category[]) ?? []
  }

  return []
}

export default async function KategorienPage() {
  const categories = await getCategories()

  const grouped: Record<string, Category[]> = {}
  for (const cat of categories) {
    if (!grouped[cat.type]) grouped[cat.type] = []
    grouped[cat.type].push(cat)
  }

  const BEREICH_ORDER = ['massivproduktion', 'sonderanfertigung', 'gartengestaltung', 'extras']

  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <p className={styles.pageLabel}>// Admin</p>
          <h1 className={styles.pageTitle}>
            Kategorien <span className={styles.count}>{categories.length}</span>
          </h1>
          <p style={{ fontSize: '15px', color: 'var(--color-text-muted)', marginTop: '6px', fontFamily: 'var(--font-inter)' }}>
            Hierarchie: Hauptbereich → Kategorie (frei anlegbar)
          </p>
        </div>
        <Link href="/admin/kategorien/neu" className={styles.btnPrimary}>
          + Neue Kategorie
        </Link>
      </div>

      {categories.length === 0 ? (
        <div className={styles.empty}>
          <p>Noch keine Kategorien angelegt.</p>
          <Link href="/admin/kategorien/neu" className={styles.btnPrimary}>
            Erste Kategorie anlegen
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {BEREICH_ORDER.map((bereich) => {
            const cats = grouped[bereich]
            if (!cats) return null

            return (
              <div key={bereich}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  borderBottom: '0.5px solid rgba(155, 174, 159,0.15)',
                  paddingBottom: '10px', marginBottom: '0',
                }}>
                  <span style={{
                    fontFamily: 'var(--font-bebas)',
                    fontSize: '22px', letterSpacing: '.06em',
                    color: '#dcdcd6',
                  }}>
                    {BEREICH_LABELS[bereich as keyof typeof BEREICH_LABELS]}
                  </span>
                  <span className={styles.badge} data-type={bereich}>
                    {cats.length} Kategorien
                  </span>
                </div>

                <div className={styles.tableScroll}>
<table className={styles.table} style={{ tableLayout: 'fixed' }}>
                  <colgroup>
                    <col style={{ width: '30%' }} />
                    <col style={{ width: '20%' }} />
                    <col style={{ width: '15%' }} />
                    <col style={{ width: '10%' }} />
                    <col style={{ width: '25%' }} />
                  </colgroup>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Slug</th>
                      <th>Titelbild</th>
                      <th>Reihenfolge</th>
                      <th style={{ textAlign: 'right' }}>Aktionen</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cats.map((cat) => (
                      <tr key={cat.id}>
                        <td className={styles.tdName}>{cat.name}</td>
                        <td className={styles.tdMuted}>{cat.slug}</td>
                        <td className={styles.tdMuted}>
                          {cat.image_url
                            ? <img src={cat.image_url} alt={cat.name} className={styles.thumb} />
                            : '—'}
                        </td>
                        <td className={styles.tdMuted}>{cat.sort_order}</td>
                        <td>
                          <div className={styles.btnGroup}>
                            <Link href={`/admin/kategorien/${cat.id}`} className={styles.btnEdit}>
                              Bearbeiten
                            </Link>
                            <DeleteButton
                              action={deleteCategory.bind(null, cat.id)}
                              confirmMsg={`Kategorie „${cat.name}" in den Papierkorb verschieben?`}
                              className={styles.btnDelete}
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
</div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
