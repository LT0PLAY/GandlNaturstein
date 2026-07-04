import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { createSupabaseAdminClient } from '@/lib/supabase'
import { updateInquiryStatus } from '@/lib/actions/inquiries'
import styles from '../../table.module.css'
import formStyles from '../../form.module.css'

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  new:         { label: 'Neu',             color: '#C4923A' },
  in_progress: { label: 'In Bearbeitung',  color: '#7AAACE' },
  completed:   { label: 'Abgeschlossen',   color: '#7EC87E' },
  archived:    { label: 'Archiviert',      color: '#666' },
}

async function getInquiry(id: string) {
  const { data } = await createSupabaseAdminClient()
    .from('inquiries')
    .select('*, product:products(id, name, slug)')
    .eq('id', id)
    .single()
  return data
}

export default async function AnfrageDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const inq = await getInquiry(id)
  if (!inq) notFound()

  const status = STATUS_LABELS[inq.status] ?? { label: inq.status, color: '#888' }

  async function handleUpdate(formData: FormData) {
    'use server'
    const newStatus = formData.get('status') as string
    const note      = formData.get('internal_note') as string
    await updateInquiryStatus(id, newStatus, note)
    redirect('/admin/anfragen')
  }

  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <p className={styles.pageLabel}>// Anfragen</p>
          <h1 className={styles.pageTitle}>Anfrage von {inq.name}</h1>
        </div>
        <Link href="/admin/anfragen" className={formStyles.btnCancel}>
          ← Zurück
        </Link>
      </div>

      {/* Kundendaten */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
        gap: '16px', marginBottom: '32px',
        padding: '20px 24px',
        border: '0.5px solid rgba(255,255,255,0.07)',
        background: 'var(--color-bg-card)',
      }}>
        {[
          { label: 'Name',    value: inq.name },
          { label: 'E-Mail',  value: inq.email },
          { label: 'Telefon', value: inq.phone ?? '—' },
          { label: 'Fläche',  value: inq.area_sqm ? `${inq.area_sqm} m²` : '—' },
          { label: 'Produkt', value: (inq.product as any)?.name ?? '—' },
          { label: 'Eingang', value: new Date(inq.created_at).toLocaleString('de-DE') },
        ].map(({ label, value }) => (
          <div key={label}>
            <p style={{ fontFamily: 'var(--font-inter)', fontSize: '10px', letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--color-text-dim)', marginBottom: '4px' }}>
              {label}
            </p>
            <p style={{ fontFamily: 'var(--font-inter)', fontSize: '13px', color: 'var(--color-text)' }}>
              {label === 'E-Mail'
                ? <a href={`mailto:${value}`} style={{ color: 'var(--color-gold)', textDecoration: 'none' }}>{value}</a>
                : value}
            </p>
          </div>
        ))}
      </div>

      {/* Nachricht */}
      {inq.message && (
        <div style={{
          marginBottom: '32px', padding: '20px 24px',
          border: '0.5px solid rgba(255,255,255,0.07)',
          background: 'var(--color-bg-card)',
        }}>
          <p style={{ fontFamily: 'var(--font-inter)', fontSize: '10px', letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--color-text-dim)', marginBottom: '10px' }}>
            Nachricht
          </p>
          <p style={{ fontFamily: 'var(--font-inter)', fontSize: '13px', color: 'var(--color-text)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
            {inq.message}
          </p>
        </div>
      )}

      {/* Status + Notiz bearbeiten */}
      <form action={handleUpdate} className={formStyles.form}>
        <div className={formStyles.formGrid}>
          <div className={formStyles.field}>
            <label>Status</label>
            <select name="status" defaultValue={inq.status} required>
              {Object.entries(STATUS_LABELS).map(([val, info]) => (
                <option key={val} value={val}>{info.label}</option>
              ))}
            </select>
          </div>
          <div className={formStyles.field} style={{ gridColumn: '1 / -1' }}>
            <label>Interne Notiz</label>
            <textarea
              name="internal_note"
              rows={4}
              defaultValue={inq.internal_note ?? ''}
              placeholder="Nur für das Team sichtbar…"
              style={{ resize: 'vertical' }}
            />
          </div>
        </div>
        <div className={formStyles.formActions}>
          <button type="submit" className={formStyles.btnPrimary}>Speichern</button>
          <Link href="/admin/anfragen" className={formStyles.btnCancel}>Abbrechen</Link>
        </div>
      </form>
    </div>
  )
}
