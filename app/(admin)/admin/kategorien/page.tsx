export const dynamic = 'force-dynamic'

import React from 'react'
import Link from 'next/link'
import { createSupabaseAdminClient } from '@/lib/supabase'
import { deleteCategory } from '@/lib/actions/categories'
import DeleteButton from '@/components/admin/DeleteButton'
import type { Category } from '@/lib/types'
import { BEREICH_LABELS, LOCATION_LABELS } from '@/lib/types'
import styles from '../table.module.css'

async function getCategories(): Promise<Category[]> {
  const supabase = createSupabaseAdminClient()
  // Versuche mit Soft-Delete-Filter (Migration 008)
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .is('deleted_at', null)
    .order('type')
    .order('location', { nullsFirst: true })
    .order('sort_order')

  if (!error) return (data as Category[]) ?? []

  // Spalte existiert noch nicht (Migration 008 noch nicht gelaufen) → ohne Filter
  if (error.code === '42703' || error.message?.includes('deleted_at')) {
    const { data: fallback } = await supabase
      .from('categories')
      .select('*')
      .order('type')
      .order('location', { nullsFirst: true })
      .order('sort_order')
    return (fallback as Category[]) ?? []
  }

  return []
}

export default async function KategorienPage() {
  const categories = await getCategories()

  // Gruppiere nach Bereich → Location
  const grouped: Record<string, Record<string, Category[]>> = {}
  for (const cat of categories) {
    const bereich  = cat.type
    const location = cat.location ?? '__none__'
    if (!grouped[bereich]) grouped[bereich] = {}
    if (!grouped[bereich][location]) grouped[bereich][location] = []
    grouped[bereich][location].push(cat)
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
          <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginTop: '6px', fontFamily: 'var(--font-inter)' }}>
            Hierarchie: Hauptbereich → Außen/Innen → Unterkategorie
          </p>
        </div>
        <Link href="/admin/kategorien/neu" className={styles.btnPrimary}>
          + Neue Unterkategorie
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
            const locationGroups = grouped[bereich]
            if (!locationGroups) return null

            return (
              <div key={bereich}>
                {/* Bereich-Header */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  borderBottom: '0.5px solid rgba(196,146,58,0.15)',
                  paddingBottom: '10px', marginBottom: '0',
                }}>
                  <span style={{
                    fontFamily: 'var(--font-bebas)',
                    fontSize: '22px', letterSpacing: '.06em',
                    color: '#F0EBE3',
                  }}>
                    {BEREICH_LABELS[bereich as keyof typeof BEREICH_LABELS]}
                  </span>
                  <span className={styles.badge} data-type={bereich}>
                    {Object.values(locationGroups).flat().length} Kategorien
                  </span>
                </div>

                {/* Eine einzige Tabelle pro Bereich — Location als Trennzeile */}
                <table className={styles.table} style={{ tableLayout: 'fixed' }}>
                  <colgroup>
                    <col style={{ width: '35%' }} />
                    <col style={{ width: '30%' }} />
                    <col style={{ width: '10%' }} />
                    <col style={{ width: '25%' }} />
                  </colgroup>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Slug</th>
                      <th>Reihenfolge</th>
                      <th style={{ textAlign: 'right' }}>Aktionen</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(locationGroups).map(([loc, cats]) => (
                      <React.Fragment key={loc}>
                        {/* Location-Trennzeile */}
                        <tr>
                          <td colSpan={4} style={{
                            padding: '8px 16px',
                            background: 'rgba(196,146,58,0.03)',
                            borderBottom: '0.5px solid rgba(196,146,58,0.05)',
                            fontFamily: 'var(--font-inter)',
                            fontSize: '11px', letterSpacing: '.1em',
                            textTransform: 'uppercase',
                            color: loc === '__none__' ? 'var(--color-text-dim)' : 'var(--color-text-muted)',
                          }}>
                            {loc === '__none__'
                              ? '— kein Außen/Innen-Split'
                              : `↳ ${LOCATION_LABELS[loc as keyof typeof LOCATION_LABELS]}`}
                          </td>
                        </tr>
                        {/* Kategorien */}
                        {cats.map((cat) => (
                          <tr key={cat.id}>
                            <td className={styles.tdName}>{cat.name}</td>
                            <td className={styles.tdMuted}>{cat.slug}</td>
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
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
