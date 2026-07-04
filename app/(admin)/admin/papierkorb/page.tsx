import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createSupabaseAdminClient } from '@/lib/supabase'
import { getCurrentUser } from '@/lib/actions/auth'
import {
  approveDeleteProduct, rejectDeleteProduct,
  restoreProduct, permanentDeleteProduct,
} from '@/lib/actions/products'
import { restoreCategory, permanentDeleteCategory } from '@/lib/actions/categories'
import { restoreReference, permanentDeleteReference } from '@/lib/actions/references'
import { restoreJobListing, permanentDeleteJobListing } from '@/lib/actions/karriere'
import DeleteButton from '@/components/admin/DeleteButton'
import { BEREICH_LABELS, LOCATION_LABELS } from '@/lib/types'
import styles from '../table.module.css'
import trashStyles from './papierkorb.module.css'

const SUPABASE_CONFIGURED =
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')

async function getPendingProducts() {
  try {
    const { data } = await createSupabaseAdminClient()
      .from('products')
      .select('*, category:categories(name, type)')
      .eq('delete_pending', true)
      .is('deleted_at', null)
      .order('delete_requested_at', { ascending: false })
    return data ?? []
  } catch { return [] }
}

async function getTrashedProducts() {
  try {
    const { data } = await createSupabaseAdminClient()
      .from('products')
      .select('*, category:categories(name, type)')
      .not('deleted_at', 'is', null)
      .order('deleted_at', { ascending: false })
    return data ?? []
  } catch { return [] }
}

async function getTrashedCategories() {
  try {
    const { data } = await createSupabaseAdminClient()
      .from('categories')
      .select('*')
      .not('deleted_at', 'is', null)
      .order('deleted_at', { ascending: false })
    return data ?? []
  } catch { return [] }
}

async function getTrashedReferences() {
  try {
    const { data } = await createSupabaseAdminClient()
      .from('project_references')
      .select('id, title, subtitle, cover_image, deleted_at, category_tags')
      .not('deleted_at', 'is', null)
      .order('deleted_at', { ascending: false })
    return data ?? []
  } catch { return [] }
}

async function getTrashedJobs() {
  try {
    const { data } = await createSupabaseAdminClient()
      .from('job_listings')
      .select('id, title, department, employment_type, deleted_at')
      .not('deleted_at', 'is', null)
      .order('deleted_at', { ascending: false })
    return data ?? []
  } catch { return [] }
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1)  return 'gerade eben'
  if (m < 60) return `vor ${m} Min.`
  const h = Math.floor(m / 60)
  if (h < 24) return `vor ${h} Std.`
  return `vor ${Math.floor(h / 24)} Tagen`
}

export default async function PapierkorbPage() {
  if (SUPABASE_CONFIGURED) {
    const user = await getCurrentUser()
    if (user && (user.role as string) !== 'admin') redirect('/admin')
  }

  const [pending, trashedProducts, trashedCategories, trashedReferences, trashedJobs] = await Promise.all([
    getPendingProducts(),
    getTrashedProducts(),
    getTrashedCategories(),
    getTrashedReferences(),
    getTrashedJobs(),
  ])

  const totalTrashed = trashedProducts.length + trashedCategories.length + trashedReferences.length + trashedJobs.length

  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <p className={styles.pageLabel}>// Admin</p>
          <h1 className={styles.pageTitle}>
            Papierkorb
            {totalTrashed > 0 && <span className={styles.count}>{totalTrashed}</span>}
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginTop: '6px', fontFamily: 'var(--font-inter)' }}>
            Nur Admins können Einträge endgültig löschen.
          </p>
        </div>
        <Link href="/admin/produkte" className={trashStyles.backLink}>← Zurück zu Produkten</Link>
      </div>

      {/* ── AUSSTEHENDE LÖSCHANTRÄGE ── */}
      {pending.length > 0 && (
        <section className={trashStyles.section}>
          <div className={trashStyles.sectionHeader}>
            <h2 className={trashStyles.sectionTitle}>
              Ausstehende Löschanträge
              <span className={trashStyles.badge} data-warn="true">{pending.length}</span>
            </h2>
            <p className={trashStyles.sectionDesc}>
              Von einem Editor zum Löschen vorgeschlagen — bitte genehmigen oder ablehnen.
            </p>
          </div>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Bild</th>
                <th>Produkt</th>
                <th>Beantragt</th>
                <th style={{ textAlign: 'right' }}>Entscheidung</th>
              </tr>
            </thead>
            <tbody>
              {pending.map((p: any) => (
                <tr key={p.id}>
                  <td>
                    {p.thumbnail || p.images?.[0]
                      ? <img src={p.thumbnail ?? p.images[0]} alt={p.name} className={styles.thumb} />
                      : <div className={styles.thumbEmpty}>—</div>}
                  </td>
                  <td className={styles.tdName}>
                    {p.name}
                    {p.material && <span className={styles.tdMuted} style={{ display: 'block', fontSize: '11px' }}>{p.material}</span>}
                  </td>
                  <td className={styles.tdMuted}>
                    {p.delete_requested_at ? timeAgo(p.delete_requested_at) : '—'}
                  </td>
                  <td>
                    <div className={trashStyles.btnGroup}>
                      <DeleteButton
                        action={approveDeleteProduct.bind(null, p.id)}
                        confirmMsg={`Löschantrag genehmigen? „${p.name}" wird in den Papierkorb verschoben.`}
                        label="✓ Genehmigen"
                        className={styles.btnApprove}
                      />
                      <DeleteButton
                        action={rejectDeleteProduct.bind(null, p.id)}
                        confirmMsg={`Löschantrag für „${p.name}" ablehnen?`}
                        label="✕ Ablehnen"
                        className={styles.btnDelete}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {/* ── GELÖSCHTE PRODUKTE ── */}
      <section className={trashStyles.section}>
        <div className={trashStyles.sectionHeader}>
          <h2 className={trashStyles.sectionTitle}>
            Produkte
            {trashedProducts.length > 0 && <span className={trashStyles.badge}>{trashedProducts.length}</span>}
          </h2>
          <p className={trashStyles.sectionDesc}>
            Gelöschte Produkte können wiederhergestellt (zunächst inaktiv) oder endgültig entfernt werden.
          </p>
        </div>
        {trashedProducts.length === 0 ? (
          <div className={trashStyles.empty}>Keine gelöschten Produkte.</div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Bild</th>
                <th>Produkt</th>
                <th>Gelöscht</th>
                <th style={{ textAlign: 'right' }}>Aktionen</th>
              </tr>
            </thead>
            <tbody>
              {trashedProducts.map((p: any) => (
                <tr key={p.id} style={{ opacity: 0.65 }}>
                  <td>
                    {p.thumbnail || p.images?.[0]
                      ? <img src={p.thumbnail ?? p.images[0]} alt={p.name} className={styles.thumb} style={{ filter: 'grayscale(0.6)' }} />
                      : <div className={styles.thumbEmpty}>—</div>}
                  </td>
                  <td className={styles.tdName}>
                    {p.name}
                    {p.material && <span className={styles.tdMuted} style={{ display: 'block', fontSize: '11px' }}>{p.material}</span>}
                  </td>
                  <td className={styles.tdMuted}>
                    {p.deleted_at ? new Date(p.deleted_at).toLocaleDateString('de-DE') : '—'}
                  </td>
                  <td>
                    <div className={trashStyles.btnGroup}>
                      <DeleteButton
                        action={restoreProduct.bind(null, p.id)}
                        confirmMsg={`„${p.name}" wiederherstellen? Das Produkt wird reaktiviert (zunächst inaktiv).`}
                        label="↩ Wiederherstellen"
                        className={styles.btnRestore}
                      />
                      <DeleteButton
                        action={permanentDeleteProduct.bind(null, p.id)}
                        confirmMsg={`„${p.name}" ENDGÜLTIG löschen? Kann nicht rückgängig gemacht werden.`}
                        label="⊗ Endgültig löschen"
                        className={styles.btnDelete}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {/* ── GELÖSCHTE REFERENZEN ── */}
      <section className={trashStyles.section}>
        <div className={trashStyles.sectionHeader}>
          <h2 className={trashStyles.sectionTitle}>
            Referenzen
            {trashedReferences.length > 0 && <span className={trashStyles.badge}>{trashedReferences.length}</span>}
          </h2>
          <p className={trashStyles.sectionDesc}>
            Gelöschte Referenzen können wiederhergestellt oder endgültig entfernt werden.
          </p>
        </div>
        {trashedReferences.length === 0 ? (
          <div className={trashStyles.empty}>Keine gelöschten Referenzen.</div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Bild</th>
                <th>Referenz</th>
                <th>Gelöscht</th>
                <th style={{ textAlign: 'right' }}>Aktionen</th>
              </tr>
            </thead>
            <tbody>
              {trashedReferences.map((r: any) => (
                <tr key={r.id} style={{ opacity: 0.65 }}>
                  <td>
                    {r.cover_image
                      ? <img src={r.cover_image} alt={r.title} className={styles.thumb} style={{ filter: 'grayscale(0.6)' }} />
                      : <div className={styles.thumbEmpty}>—</div>}
                  </td>
                  <td className={styles.tdName}>
                    {r.title}
                    {r.subtitle && <span className={styles.tdMuted} style={{ display: 'block', fontSize: '11px' }}>{r.subtitle}</span>}
                  </td>
                  <td className={styles.tdMuted}>
                    {r.deleted_at ? new Date(r.deleted_at).toLocaleDateString('de-DE') : '—'}
                  </td>
                  <td>
                    <div className={trashStyles.btnGroup}>
                      <DeleteButton
                        action={restoreReference.bind(null, r.id)}
                        confirmMsg={`Referenz „${r.title}" wiederherstellen? Sie wird als Entwurf wiederhergestellt.`}
                        label="↩ Wiederherstellen"
                        className={styles.btnRestore}
                      />
                      <DeleteButton
                        action={permanentDeleteReference.bind(null, r.id)}
                        confirmMsg={`Referenz „${r.title}" ENDGÜLTIG löschen? Kann nicht rückgängig gemacht werden.`}
                        label="⊗ Endgültig löschen"
                        className={styles.btnDelete}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {/* ── GELÖSCHTE KATEGORIEN ── */}
      <section className={trashStyles.section}>
        <div className={trashStyles.sectionHeader}>
          <h2 className={trashStyles.sectionTitle}>
            Kategorien
            {trashedCategories.length > 0 && <span className={trashStyles.badge}>{trashedCategories.length}</span>}
          </h2>
          <p className={trashStyles.sectionDesc}>
            Gelöschte Kategorien können wiederhergestellt werden. Zugehörige Produkte bleiben erhalten.
          </p>
        </div>
        {trashedCategories.length === 0 ? (
          <div className={trashStyles.empty}>Keine gelöschten Kategorien.</div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Kategorie</th>
                <th>Bereich</th>
                <th>Gelöscht</th>
                <th style={{ textAlign: 'right' }}>Aktionen</th>
              </tr>
            </thead>
            <tbody>
              {trashedCategories.map((c: any) => (
                <tr key={c.id} style={{ opacity: 0.65 }}>
                  <td className={styles.tdName}>{c.name}</td>
                  <td className={styles.tdMuted}>
                    {BEREICH_LABELS[c.type as keyof typeof BEREICH_LABELS] ?? c.type}
                    {c.location ? ` › ${LOCATION_LABELS[c.location as keyof typeof LOCATION_LABELS]}` : ''}
                  </td>
                  <td className={styles.tdMuted}>
                    {c.deleted_at ? new Date(c.deleted_at).toLocaleDateString('de-DE') : '—'}
                  </td>
                  <td>
                    <div className={trashStyles.btnGroup}>
                      <DeleteButton
                        action={restoreCategory.bind(null, c.id)}
                        confirmMsg={`Kategorie „${c.name}" wiederherstellen?`}
                        label="↩ Wiederherstellen"
                        className={styles.btnRestore}
                      />
                      <DeleteButton
                        action={permanentDeleteCategory.bind(null, c.id)}
                        confirmMsg={`Kategorie „${c.name}" ENDGÜLTIG löschen? Alle zugehörigen Produkte verlieren ihre Kategorie.`}
                        label="⊗ Endgültig löschen"
                        className={styles.btnDelete}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {/* ── GELÖSCHTE STELLENANGEBOTE ── */}
      <section className={trashStyles.section}>
        <div className={trashStyles.sectionHeader}>
          <h2 className={trashStyles.sectionTitle}>
            Stellenangebote
            {trashedJobs.length > 0 && <span className={trashStyles.badge}>{trashedJobs.length}</span>}
          </h2>
          <p className={trashStyles.sectionDesc}>
            Gelöschte Stellen können wiederhergestellt oder endgültig entfernt werden.
          </p>
        </div>
        {trashedJobs.length === 0 ? (
          <div className={trashStyles.empty}>Keine gelöschten Stellenangebote.</div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Stelle</th>
                <th>Art</th>
                <th>Gelöscht</th>
                <th style={{ textAlign: 'right' }}>Aktionen</th>
              </tr>
            </thead>
            <tbody>
              {trashedJobs.map((j: any) => (
                <tr key={j.id} style={{ opacity: 0.65 }}>
                  <td className={styles.tdName}>
                    {j.title}
                    {j.department && <span className={styles.tdMuted} style={{ display: 'block', fontSize: '11px' }}>{j.department}</span>}
                  </td>
                  <td className={styles.tdMuted}>{j.employment_type ?? '—'}</td>
                  <td className={styles.tdMuted}>
                    {j.deleted_at ? new Date(j.deleted_at).toLocaleDateString('de-DE') : '—'}
                  </td>
                  <td>
                    <div className={trashStyles.btnGroup}>
                      <DeleteButton
                        action={restoreJobListing.bind(null, j.id)}
                        confirmMsg={`Stelle „${j.title}" wiederherstellen?`}
                        label="↩ Wiederherstellen"
                        className={styles.btnRestore}
                      />
                      <DeleteButton
                        action={permanentDeleteJobListing.bind(null, j.id)}
                        confirmMsg={`Stelle „${j.title}" ENDGÜLTIG löschen?`}
                        label="⊗ Endgültig löschen"
                        className={styles.btnDelete}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  )
}
