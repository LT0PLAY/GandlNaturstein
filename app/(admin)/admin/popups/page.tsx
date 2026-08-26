export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { createSupabaseAdminClient } from '@/lib/supabase'
import { deletePopup, togglePopupActive } from '@/lib/actions/popups'
import DeleteButton from '@/components/admin/DeleteButton'
import ToggleActiveButton from '@/components/admin/ToggleActiveButton'
import type { Popup } from '@/lib/types'
import styles from '../table.module.css'

async function getPopups(): Promise<Popup[]> {
  try {
    const { data } = await createSupabaseAdminClient()
      .from('popups')
      .select('*')
      .order('created_at', { ascending: false })
    return (data as Popup[]) ?? []
  } catch { return [] }
}

function formatDate(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export default async function AdminPopupsPage() {
  const popups = await getPopups()

  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <p className={styles.pageLabel}>// Admin</p>
          <h1 className={styles.pageTitle}>
            Popups <span className={styles.count}>{popups.length}</span>
          </h1>
        </div>
        <Link href="/admin/popups/neu" className={styles.btnPrimary}>
          + Neues Popup
        </Link>
      </div>

      {popups.length === 0 ? (
        <div className={styles.empty}>
          <p>Noch keine Popups angelegt.</p>
          <Link href="/admin/popups/neu" className={styles.btnPrimary}>
            Erstes Popup anlegen
          </Link>
        </div>
      ) : (
        <div className={styles.tableScroll}>
<table className={styles.table}>
          <thead>
            <tr>
              <th>Bild</th>
              <th>Name</th>
              <th>Info-Text</th>
              <th>Deaktiviert am</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Aktionen</th>
            </tr>
          </thead>
          <tbody>
            {popups.map((p) => (
              <tr key={p.id}>
                <td>
                  {p.image_url
                    ? <img src={p.image_url} alt={p.title} className={styles.thumb} />
                    : <div className={styles.thumbEmpty} />}
                </td>
                <td className={styles.tdName} data-label="Name">{p.title}</td>
                <td className={styles.tdMuted} style={{ maxWidth: '260px' }} data-label="Info-Text">
                  {p.message ? (p.message.length > 60 ? `${p.message.slice(0, 60)}…` : p.message) : '—'}
                </td>
                <td className={styles.tdMuted} data-label="Deaktiviert am">{formatDate(p.active_until)}</td>
                <td data-label="Status">
                  <span className={styles.badge} data-active={p.is_active}>
                    {p.is_active ? 'Aktiv' : 'Inaktiv'}
                  </span>
                </td>
                <td className={styles.tdActionsCell}>
                  <div className={styles.btnGroup}>
                    <ToggleActiveButton
                      action={togglePopupActive.bind(null, p.id, !p.is_active)}
                      isActive={p.is_active}
                      className={styles.btnWarning}
                    />
                    <Link href={`/admin/popups/${p.id}`} className={styles.btnEdit}>
                      Bearbeiten
                    </Link>
                    <DeleteButton
                      action={deletePopup.bind(null, p.id)}
                      confirmMsg={`Popup „${p.title}" endgültig löschen?`}
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
