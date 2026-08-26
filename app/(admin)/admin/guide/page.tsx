export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { createSupabaseAdminClient } from '@/lib/supabase'
import { deleteGuideEntry } from '@/lib/actions/guide'
import DeleteButton from '@/components/admin/DeleteButton'
import type { GuideEntry } from '@/lib/types'
import styles from '../table.module.css'

async function getEntries(): Promise<GuideEntry[]> {
  try {
    const { data } = await createSupabaseAdminClient()
      .from('guide_entries')
      .select('*, product:products(id, name)')
      .is('deleted_at', null)
      .order('number')
    return (data as unknown as GuideEntry[]) ?? []
  } catch { return [] }
}

export default async function AdminGuidePage() {
  const entries = await getEntries()

  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <p className={styles.pageLabel}>// Admin</p>
          <h1 className={styles.pageTitle}>
            Ausstellungsguide <span className={styles.count}>{entries.length}</span>
          </h1>
        </div>
        <Link href="/admin/guide/neu" className={styles.btnPrimary}>
          + Neue Nummer
        </Link>
      </div>

      {entries.length === 0 ? (
        <div className={styles.empty}>
          <p>Noch keine Guide-Nummern angelegt.</p>
          <Link href="/admin/guide/neu" className={styles.btnPrimary}>
            Erste Nummer anlegen
          </Link>
        </div>
      ) : (
        <div className={styles.tableScroll}>
<table className={styles.table}>
          <thead>
            <tr>
              <th>#</th>
              <th>Bild</th>
              <th>Name</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Aktionen</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((g) => (
              <tr key={g.id}>
                <td className={styles.tdName} style={{ fontFamily: 'var(--font-bebas)', fontSize: '20px' }} data-label="#">
                  {g.number}
                </td>
                <td>
                  {g.images?.[0]
                    ? <img src={g.images[0]} alt={g.name} className={styles.thumb} />
                    : <div className={styles.thumbEmpty} />}
                </td>
                <td className={styles.tdName} data-label="Name">
                  {g.name}
                  {g.product && (
                    <span className={styles.tdMuted} style={{ display: 'block', fontSize: '13px' }}>
                      ⚭ {g.product.name}
                    </span>
                  )}
                </td>
                <td data-label="Status">
                  <span className={styles.badge} data-active={g.is_active}>
                    {g.is_active ? 'Aktiv' : 'Inaktiv'}
                  </span>
                </td>
                <td className={styles.tdActionsCell}>
                  <div className={styles.btnGroup}>
                    <Link href={`/admin/guide/${g.id}`} className={styles.btnEdit}>
                      Bearbeiten
                    </Link>
                    <DeleteButton
                      action={deleteGuideEntry.bind(null, g.id)}
                      confirmMsg={`Nummer ${g.number} „${g.name}" endgültig löschen?`}
                      className={styles.btnDelete}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
</div>
      )}
    </div>
  )
}
