export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { getInquiries } from '@/lib/actions/inquiries'
import styles from '../table.module.css'

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  new:         { label: 'Neu',         color: '#C4923A' },
  in_progress: { label: 'In Bearbeitung', color: '#7AAACE' },
  completed:   { label: 'Abgeschlossen',  color: '#7EC87E' },
  archived:    { label: 'Archiviert',     color: '#666' },
}

function timeAgo(dateStr: string) {
  const diff  = Date.now() - new Date(dateStr).getTime()
  const mins  = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days  = Math.floor(diff / 86400000)
  if (mins  < 1)  return 'Gerade eben'
  if (mins  < 60) return `vor ${mins} Min.`
  if (hours < 24) return `vor ${hours} Std.`
  return `vor ${days} Tag${days > 1 ? 'en' : ''}`
}

export default async function AnfragenPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const { status } = await searchParams
  const { data: inquiries } = await getInquiries(status)

  const counts: Record<string, number> = {}
  const { data: all } = await getInquiries()
  for (const inq of all ?? []) {
    counts[inq.status] = (counts[inq.status] ?? 0) + 1
  }
  const newCount = counts['new'] ?? 0

  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <p className={styles.pageLabel}>// Admin</p>
          <h1 className={styles.pageTitle}>
            Anfragen <span className={styles.count}>{inquiries?.length ?? 0}</span>
          </h1>
        </div>
      </div>

      {/* Status-Filter */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <Link
          href="/admin/anfragen"
          style={{
            fontFamily: 'var(--font-inter)', fontSize: '11px',
            padding: '4px 12px', border: '0.5px solid',
            textDecoration: 'none', letterSpacing: '.04em',
            borderColor: !status ? 'rgba(196,146,58,0.6)' : 'rgba(255,255,255,0.1)',
            color:        !status ? 'var(--color-gold)'    : 'var(--color-text-muted)',
            background:   !status ? 'rgba(196,146,58,0.08)' : 'transparent',
          }}
        >
          Alle ({(all ?? []).length})
        </Link>
        {Object.entries(STATUS_LABELS).map(([s, info]) => (
          <Link
            key={s}
            href={`/admin/anfragen?status=${s}`}
            style={{
              fontFamily: 'var(--font-inter)', fontSize: '11px',
              padding: '4px 12px', border: '0.5px solid',
              textDecoration: 'none', letterSpacing: '.04em',
              borderColor: status === s ? info.color + '80' : 'rgba(255,255,255,0.1)',
              color:        status === s ? info.color        : 'var(--color-text-muted)',
              background:   status === s ? info.color + '14' : 'transparent',
            }}
          >
            {info.label} {counts[s] ? `(${counts[s]})` : ''}
          </Link>
        ))}
      </div>

      {newCount > 0 && !status && (
        <div style={{
          padding: '12px 16px', marginBottom: '16px',
          background: 'rgba(196,146,58,0.07)',
          border: '0.5px solid rgba(196,146,58,0.25)',
          fontFamily: 'var(--font-inter)', fontSize: '13px',
          color: 'var(--color-gold)',
        }}>
          ⚠ {newCount} neue Anfrage{newCount > 1 ? 'n' : ''} noch unbearbeitet.
        </div>
      )}

      {!inquiries?.length ? (
        <div className={styles.empty}>
          <p>Keine Anfragen{status ? ` mit Status „${STATUS_LABELS[status]?.label}"` : ''}.</p>
        </div>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Name</th>
              <th>E-Mail</th>
              <th>Produkt</th>
              <th>Status</th>
              <th>Eingang</th>
              <th style={{ textAlign: 'right' }}>Aktion</th>
            </tr>
          </thead>
          <tbody>
            {inquiries.map((inq: any) => (
              <tr key={inq.id}>
                <td className={styles.tdName}>{inq.name}</td>
                <td className={styles.tdMuted}>{inq.email}</td>
                <td className={styles.tdMuted}>{inq.product?.name ?? '—'}</td>
                <td>
                  <span
                    className={styles.badge}
                    style={{
                      color:       STATUS_LABELS[inq.status]?.color ?? '#888',
                      borderColor: (STATUS_LABELS[inq.status]?.color ?? '#888') + '44',
                      background:  (STATUS_LABELS[inq.status]?.color ?? '#888') + '14',
                    }}
                  >
                    {STATUS_LABELS[inq.status]?.label ?? inq.status}
                  </span>
                </td>
                <td className={styles.tdMuted}>{timeAgo(inq.created_at)}</td>
                <td>
                  <div className={styles.btnGroup}>
                    <Link href={`/admin/anfragen/${inq.id}`} className={styles.btnEdit}>
                      Öffnen
                    </Link>
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
