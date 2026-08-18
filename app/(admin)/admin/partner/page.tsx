export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { createSupabaseAdminClient } from '@/lib/supabase'
import { deletePartner } from '@/lib/actions/partners'
import DeleteButton from '@/components/admin/DeleteButton'
import type { Partner } from '@/lib/types'
import styles from '../table.module.css'

async function getPartners(): Promise<Partner[]> {
  try {
    const { data } = await createSupabaseAdminClient()
      .from('partners')
      .select('*')
      .is('deleted_at', null)
      .order('sort_order')
      .order('created_at', { ascending: false })
    return (data as Partner[]) ?? []
  } catch { return [] }
}

export default async function AdminPartnerPage() {
  const partners = await getPartners()

  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <p className={styles.pageLabel}>// Admin</p>
          <h1 className={styles.pageTitle}>
            Unsere Partner <span className={styles.count}>{partners.length}</span>
          </h1>
        </div>
        <Link href="/admin/partner/neu" className={styles.btnPrimary}>
          + Neuer Partner
        </Link>
      </div>

      {partners.length === 0 ? (
        <div className={styles.empty}>
          <p>Noch keine Partner angelegt.</p>
          <Link href="/admin/partner/neu" className={styles.btnPrimary}>
            Ersten Partner anlegen
          </Link>
        </div>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Logo</th>
              <th>Name</th>
              <th>PDFs</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Aktionen</th>
            </tr>
          </thead>
          <tbody>
            {partners.map((p) => (
              <tr key={p.id}>
                <td>
                  {p.logo_url
                    ? <img src={p.logo_url} alt={p.name} className={styles.thumb} style={{ objectFit: 'contain', background: '#fff' }} />
                    : <div className={styles.thumbEmpty} />}
                </td>
                <td className={styles.tdName}>{p.name}</td>
                <td className={styles.tdMuted}>{p.pdfs?.length ?? 0} / 10</td>
                <td>
                  <span className={styles.badge} data-active={p.is_active}>
                    {p.is_active ? 'Aktiv' : 'Inaktiv'}
                  </span>
                </td>
                <td>
                  <div className={styles.btnGroup}>
                    <Link href={`/admin/partner/${p.id}`} className={styles.btnEdit}>
                      Bearbeiten
                    </Link>
                    <DeleteButton
                      action={deletePartner.bind(null, p.id)}
                      confirmMsg={`Partner „${p.name}" endgültig löschen?`}
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
