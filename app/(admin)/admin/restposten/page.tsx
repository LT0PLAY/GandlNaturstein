export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { createSupabaseAdminClient } from '@/lib/supabase'
import { deleteRestposten } from '@/lib/actions/restposten'
import DeleteButton from '@/components/admin/DeleteButton'
import PageHeroSettings from '@/components/admin/PageHeroSettings'
import { getPageHeroImage } from '@/lib/actions/pageHeroes'
import type { Restposten } from '@/lib/types'
import styles from '../table.module.css'

async function getItems(): Promise<Restposten[]> {
  try {
    const { data } = await createSupabaseAdminClient()
      .from('restposten')
      .select('*')
      .is('deleted_at', null)
      .order('sort_order')
      .order('created_at', { ascending: false })
    return (data as Restposten[]) ?? []
  } catch { return [] }
}

export default async function AdminRestpostenPage() {
  const [items, heroImage] = await Promise.all([getItems(), getPageHeroImage('restposten')])

  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <p className={styles.pageLabel}>// Admin</p>
          <h1 className={styles.pageTitle}>
            Aktuelle Restposten <span className={styles.count}>{items.length}</span>
          </h1>
        </div>
        <Link href="/admin/restposten/neu" className={styles.btnPrimary}>
          + Neuer Restposten
        </Link>
      </div>

      <PageHeroSettings pageKey="restposten" title="Aktuelle Restposten" currentImageUrl={heroImage} />

      {items.length === 0 ? (
        <div className={styles.empty}>
          <p>Noch keine Restposten angelegt.</p>
          <Link href="/admin/restposten/neu" className={styles.btnPrimary}>
            Ersten Restposten anlegen
          </Link>
        </div>
      ) : (
        <div className={styles.tableScroll}>
<table className={styles.table}>
          <thead>
            <tr>
              <th>Bild</th>
              <th>Titel</th>
              <th>Preis</th>
              <th>Externer Link</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Aktionen</th>
            </tr>
          </thead>
          <tbody>
            {items.map((r) => (
              <tr key={r.id}>
                <td>
                  {r.images?.[0]
                    ? <img src={r.images[0]} alt={r.title} className={styles.thumb} />
                    : <div className={styles.thumbEmpty} />}
                </td>
                <td className={styles.tdName} data-label="Titel">{r.title}</td>
                <td className={styles.tdMuted} data-label="Preis">{r.price != null ? `${r.price.toLocaleString('de-DE')} €` : '—'}</td>
                <td className={styles.tdMuted} data-label="Externer Link">
                  {r.external_link
                    ? <a href={r.external_link} target="_blank" rel="noreferrer" style={{ color: 'var(--color-sage)', fontSize: '13px' }}>Link ↗</a>
                    : '—'}
                </td>
                <td data-label="Status">
                  <span className={styles.badge} data-active={r.is_active}>
                    {r.is_active ? 'Aktiv' : 'Inaktiv'}
                  </span>
                </td>
                <td className={styles.tdActionsCell}>
                  <div className={styles.btnGroup}>
                    <Link href={`/admin/restposten/${r.id}`} className={styles.btnEdit}>
                      Bearbeiten
                    </Link>
                    <DeleteButton
                      action={deleteRestposten.bind(null, r.id)}
                      confirmMsg={`Restposten „${r.title}" endgültig löschen?`}
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
