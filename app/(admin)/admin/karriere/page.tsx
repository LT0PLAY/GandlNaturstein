import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createSupabaseAdminClient } from '@/lib/supabase'
import { getCurrentUser } from '@/lib/actions/auth'
import { deleteJobListing } from '@/lib/actions/karriere'
import DeleteButton from '@/components/admin/DeleteButton'
import type { JobListing } from '@/lib/types'
import styles from '../table.module.css'

const SUPABASE_CONFIGURED =
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')

async function getJobs(): Promise<JobListing[]> {
  try {
    const { data } = await createSupabaseAdminClient()
      .from('job_listings')
      .select('*')
      .is('deleted_at', null)
      .order('sort_order')
      .order('created_at', { ascending: false })
    return (data as JobListing[]) ?? []
  } catch { return [] }
}

export default async function AdminKarrierePage() {
  if (SUPABASE_CONFIGURED) {
    const user = await getCurrentUser()
    if (user && (user.role as string) !== 'admin') redirect('/admin')
  }

  const jobs = await getJobs()

  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <p className={styles.pageLabel}>// Admin</p>
          <h1 className={styles.pageTitle}>
            Karriere <span className={styles.count}>{jobs.length}</span>
          </h1>
        </div>
        <Link href="/admin/karriere/neu" className={styles.btnPrimary}>
          + Neue Stelle
        </Link>
      </div>

      {jobs.length === 0 ? (
        <div className={styles.empty}>
          <p>Noch keine Stellenangebote angelegt.</p>
          <Link href="/admin/karriere/neu" className={styles.btnPrimary}>
            Erste Stelle anlegen
          </Link>
        </div>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Stelle</th>
              <th>Art</th>
              <th>Standort</th>
              <th>PDF</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Aktionen</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((j) => (
              <tr key={j.id}>
                <td className={styles.tdName}>
                  {j.title}
                  {j.department && (
                    <span className={styles.tdMuted} style={{ display: 'block', fontSize: '11px' }}>
                      {j.department}
                    </span>
                  )}
                </td>
                <td className={styles.tdMuted}>{j.employment_type ?? '—'}</td>
                <td className={styles.tdMuted}>{j.location ?? '—'}</td>
                <td className={styles.tdMuted}>
                  {j.pdf_url
                    ? <a href={j.pdf_url} target="_blank" rel="noreferrer" style={{ color: 'var(--color-sage)', fontSize: '11px' }}>PDF ↗</a>
                    : '—'}
                </td>
                <td>
                  <span className={styles.badge} data-active={j.is_published}>
                    {j.is_published ? 'Veröffentlicht' : 'Entwurf'}
                  </span>
                </td>
                <td>
                  <div className={styles.btnGroup}>
                    <Link href={`/admin/karriere/${j.id}`} className={styles.btnEdit}>
                      Bearbeiten
                    </Link>
                    {j.is_published && (
                      <a
                        href="/karriere"
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.btnEdit}
                        style={{ opacity: 0.7 }}
                      >
                        ↗ Vorschau
                      </a>
                    )}
                    <DeleteButton
                      action={deleteJobListing.bind(null, j.id)}
                      confirmMsg={`Stelle „${j.title}" in den Papierkorb verschieben?`}
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
