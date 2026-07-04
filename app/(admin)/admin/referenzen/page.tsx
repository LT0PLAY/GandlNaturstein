import Link from 'next/link'
import { createSupabaseAdminClient } from '@/lib/supabase'
import { deleteReference } from '@/lib/actions/references'
import DeleteButton from '@/components/admin/DeleteButton'
import type { Reference } from '@/lib/types'
import styles from '../table.module.css'

async function getReferences(): Promise<Reference[]> {
  const { data } = await createSupabaseAdminClient()
    .from('project_references')
    .select('*, product:products(id,name,slug)')
    .is('deleted_at', null)
    .order('sort_order')
    .order('created_at', { ascending: false })
  return (data as Reference[]) ?? []
}

export default async function AdminReferenzenPage() {
  const refs = await getReferences()

  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <p className={styles.pageLabel}>// Admin</p>
          <h1 className={styles.pageTitle}>
            Referenzen <span className={styles.count}>{refs.length}</span>
          </h1>
        </div>
        <Link href="/admin/referenzen/neu" className={styles.btnPrimary}>
          + Neue Referenz
        </Link>
      </div>

      {refs.length === 0 ? (
        <div className={styles.empty}>
          <p>Noch keine Referenzen angelegt.</p>
          <Link href="/admin/referenzen/neu" className={styles.btnPrimary}>
            Erste Referenz anlegen
          </Link>
        </div>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Bild</th>
              <th>Titel</th>
              <th>Tags</th>
              <th>Produkt</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Aktionen</th>
            </tr>
          </thead>
          <tbody>
            {refs.map((r) => (
              <tr key={r.id}>
                <td>
                  {r.cover_image
                    ? <img src={r.cover_image} alt={r.title} className={styles.thumb} />
                    : <div className={styles.thumbEmpty}>—</div>}
                </td>
                <td className={styles.tdName}>
                  {r.title}
                  {r.subtitle && (
                    <span className={styles.tdMuted} style={{ display: 'block', fontSize: '11px' }}>
                      {r.subtitle}
                    </span>
                  )}
                </td>
                <td className={styles.tdMuted} style={{ fontSize: '11px' }}>
                  {r.category_tags?.join(' · ') || '—'}
                </td>
                <td className={styles.tdMuted}>
                  {(r.product as any)?.name ?? '—'}
                </td>
                <td>
                  <span className={styles.badge} data-active={r.is_published}>
                    {r.is_published ? 'Veröffentlicht' : 'Entwurf'}
                  </span>
                </td>
                <td>
                  <div className={styles.btnGroup}>
                    <Link href={`/admin/referenzen/${r.id}`} className={styles.btnEdit}>
                      Bearbeiten
                    </Link>
                    {r.is_published && (
                      <a
                        href={`/referenzen/${r.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.btnEdit}
                        style={{ opacity: 0.7 }}
                      >
                        ↗ Vorschau
                      </a>
                    )}
                    <DeleteButton
                      action={deleteReference.bind(null, r.id)}
                      confirmMsg={`Referenz „${r.title}" endgültig löschen?`}
                      className={styles.btnDelete}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
