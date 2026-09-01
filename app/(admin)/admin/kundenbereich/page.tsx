export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/actions/auth'
import { getCustomerAccess, getCustomerDocuments, deleteCustomerDocument } from '@/lib/actions/customerAccess'
import { getPageHeroImage } from '@/lib/actions/pageHeroes'
import DeleteButton from '@/components/admin/DeleteButton'
import PageHeroSettings from '@/components/admin/PageHeroSettings'
import CredentialsForm from './CredentialsForm'
import styles from '../table.module.css'

const SUPABASE_CONFIGURED =
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')

export default async function AdminKundenbereichPage() {
  if (SUPABASE_CONFIGURED) {
    const user = await getCurrentUser()
    if (!user || (user.role as string) !== 'admin') redirect('/admin/login')
  }

  const [access, documents, heroImage] = await Promise.all([getCustomerAccess(), getCustomerDocuments(), getPageHeroImage('kundenbereich')])

  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <p className={styles.pageLabel}>// Admin</p>
          <h1 className={styles.pageTitle}>Kundenbereich</h1>
        </div>
      </div>

      <p style={{ fontFamily: 'var(--font-inter)', fontSize: '14px', color: 'var(--color-text-muted)', lineHeight: 1.7, marginBottom: '32px', maxWidth: '640px' }}>
        Hier legst du den Zugang für den privaten Kundenbereich fest (<code>/kundenbereich</code>) — ein einzelner
        Login für euren Geschäftskunden. Teile Benutzername und Passwort nach dem Speichern selbst mit —
        aus Sicherheitsgründen wird das Passwort danach nicht mehr angezeigt.
      </p>

      <PageHeroSettings pageKey="kundenbereich" title="Kundenbereich" currentImageUrl={heroImage} />

      {/* ── Zugangsdaten ── */}
      <div style={{ border: '0.5px solid rgba(155,174,159,0.18)', background: 'var(--color-bg-card)', padding: '28px', marginBottom: '48px', maxWidth: '480px' }}>
        <p style={{ fontFamily: 'var(--font-inter)', fontSize: '13px', letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--color-gold)', marginBottom: '18px' }}>
          Zugangsdaten
        </p>
        <CredentialsForm currentUsername={access?.username ?? ''} isNew={!access} />
      </div>

      {/* ── Dokumente ── */}
      <div className={styles.pageHeader} style={{ marginBottom: '20px' }}>
        <h2 className={styles.pageTitle} style={{ fontSize: '28px' }}>
          Dokumente <span className={styles.count}>{documents.length}</span>
        </h2>
        <Link href="/admin/kundenbereich/neu" className={styles.btnPrimary}>
          + Neues Dokument
        </Link>
      </div>

      {documents.length === 0 ? (
        <div className={styles.empty}>
          <p>Noch keine Dokumente für den Kundenbereich hochgeladen.</p>
          <Link href="/admin/kundenbereich/neu" className={styles.btnPrimary}>
            Erstes Dokument anlegen
          </Link>
        </div>
      ) : (
        <div className={styles.tableScroll}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Titel</th>
                <th>Info</th>
                <th>PDF</th>
                <th style={{ textAlign: 'right' }}>Aktionen</th>
              </tr>
            </thead>
            <tbody>
              {documents.map((d) => (
                <tr key={d.id}>
                  <td className={styles.tdName} data-label="Titel">{d.title}</td>
                  <td className={styles.tdMuted} data-label="Info">
                    {d.info_text ? (d.info_text.length > 60 ? d.info_text.slice(0, 60) + '…' : d.info_text) : '—'}
                  </td>
                  <td className={styles.tdMuted} data-label="PDF">
                    <a href={d.pdf_url} target="_blank" rel="noreferrer" style={{ color: 'var(--color-sage)', fontSize: '13px' }}>PDF ↗</a>
                  </td>
                  <td className={styles.tdActionsCell}>
                    <div className={styles.btnGroup}>
                      <Link href={`/admin/kundenbereich/${d.id}`} className={styles.btnEdit}>
                        Bearbeiten
                      </Link>
                      <DeleteButton
                        action={deleteCustomerDocument.bind(null, d.id)}
                        confirmMsg={`Dokument „${d.title}" endgültig löschen?`}
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
