import Link from 'next/link'
import { SITE_URL } from '@/lib/seo'
import { UNIT_LABELS, formatQuantity } from '@/lib/types'
import type { InquiryItem, InquiryNote } from '@/lib/types'
import { inquiryNumber, formatDateTime, formatChatTime } from '@/lib/utils/inquiry'
import formStyles from '../../form.module.css'
import styles from './anfrage.module.css'
import PrintButton from './PrintButton'
import InquiryNotes, { type NoteView } from './InquiryNotes'

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  new:         { label: 'Neu',             color: '#9bae9f' },
  in_progress: { label: 'In Bearbeitung',  color: '#7AAACE' },
  completed:   { label: 'Abgeschlossen',   color: '#7EC87E' },
  archived:    { label: 'Archiviert',      color: '#666' },
}

const SOURCE_TAG: Record<string, string> = { restposten: 'Restposten', guide: 'Ausstellungsguide' }

// Alte Korb-Anfragen enthielten die Positionen als Text in der Nachricht.
const LEGACY_BASKET_PREFIX = 'Anfrage-Korb:'

type ProductJoin = {
  id: string; name: string; slug: string; bereich: string | null
  article_number: string | null; thumbnail: string | null
  category: { type: string } | { type: string }[] | null
}

/** Positionen der Anfrage: gespeicherte Liste, sonst (alte Einzelanfrage) das verknüpfte Produkt. */
function itemsOf(inq: { items?: unknown; message: string | null; area_sqm: number | null; product: ProductJoin | null }): InquiryItem[] {
  const stored = Array.isArray(inq.items) ? (inq.items as InquiryItem[]) : []
  if (stored.length) return stored
  const p = inq.product
  if (!p || inq.message?.startsWith(LEGACY_BASKET_PREFIX)) return []
  const cat = Array.isArray(p.category) ? p.category[0] : p.category
  return [{
    productId: p.id, name: p.name, quantity: inq.area_sqm ?? 0, unit: 'qm', sourceType: 'product',
    articleNumber: p.article_number, path: `/${p.bereich ?? cat?.type ?? 'eigenproduktion'}/${p.slug}`,
    thumbnail: p.thumbnail,
  }]
}

export interface InquiryRecord {
  id: string; name: string; email: string; phone: string | null
  message: string | null; area_sqm: number | null; status: string
  created_at: string; internal_note: string | null
  items?: unknown; notes?: unknown
  product: ProductJoin | null
}

/** Darstellung einer Anfrage (Bildschirm + Druck/PDF). Daten und Aktionen kommen von der Seite. */
export default function AnfrageView({
  inq, myId, statusAction,
}: {
  inq: InquiryRecord
  myId: string | null
  statusAction: (formData: FormData) => void | Promise<void>
}) {
  const items    = itemsOf(inq)
  const status   = STATUS_LABELS[inq.status] ?? { label: inq.status, color: '#888' }
  const number   = inquiryNumber(inq.id, inq.created_at)
  const received = formatDateTime(inq.created_at)
  const isLegacyBasket = !!inq.message?.startsWith(LEGACY_BASKET_PREFIX)

  // Kunden-Kommentar: bei neuen Anfragen steht in "message" nur der Kommentar.
  const comment = inq.message?.trim() || null

  // Interne Notizen als Chat: Verlauf + ggf. alte Einzel-Notiz ganz oben
  const stored = Array.isArray(inq.notes) ? (inq.notes as InquiryNote[]) : []
  const noteViews: NoteView[] = [
    ...(inq.internal_note
      ? [{ id: 'legacy', author: '', text: inq.internal_note as string, timeLabel: '', mine: false, legacy: true }]
      : []),
    ...stored.map((n) => ({
      id: n.id, author: n.author, text: n.text,
      timeLabel: formatChatTime(n.at), mine: !!myId && n.authorId === myId,
    })),
  ]

  const absolute = (path: string) => `${SITE_URL}${path}`
  const shortUrl = (path: string) => absolute(path).replace(/^https?:\/\//, '')

  const summary: { label: string; value: React.ReactNode }[] = [
    { label: 'Name',    value: inq.name },
    { label: 'E-Mail',  value: <a href={`mailto:${inq.email}`}>{inq.email}</a> },
    { label: 'Telefon', value: inq.phone ? <a href={`tel:${inq.phone.replace(/\s/g, '')}`}>{inq.phone}</a> : '—' },
    { label: 'Eingang', value: received },
    { label: 'Status',  value: (
      <span className={styles.statusBadge} style={{ color: status.color, borderColor: status.color + '66', background: status.color + '14' }}>
        {status.label}
      </span>
    ) },
    { label: 'Positionen', value: items.length ? String(items.length) : '—' },
  ]

  return (
    <div className={styles.wrap}>
      {/* ── Kopf (nur Bildschirm) ── */}
      <div className={styles.head}>
        <div>
          <p className={styles.label}>// Anfragen</p>
          <h1 className={styles.title}>Anfrage von {inq.name}</h1>
          <p className={styles.sub}>Nr. {number} · eingegangen {received}</p>
        </div>
        <div className={styles.headActions}>
          <PrintButton />
          <Link href="/admin/anfragen" className={formStyles.btnCancel}>← Zurück</Link>
        </div>
      </div>

      {/* ── Kopf (nur Druck/PDF) ── */}
      <div className={styles.printOnly}>
        <div className={styles.printTop}>
          <img src="/gandl-logo.png" alt="Gandl Natursteine" className={styles.printLogo} />
          <div className={styles.printCompany}>
            Gandl Natursteine GmbH · Rudolf-Diesel-Ring 6 · 82266 Inning am Ammersee<br />
            Tel. +49 81 43 – 99 74 – 0 · info@gandl-natursteine.de
          </div>
        </div>
        <h1 className={styles.printTitle}>Kundenanfrage</h1>
        <p className={styles.printMeta}>Nr. {number} · eingegangen am {received}</p>
      </div>

      {/* ── Kontakt & Überblick ── */}
      <div className={styles.summary}>
        {summary.map(({ label, value }) => (
          <div key={label} className={styles.cell}>
            <p className={styles.cellLabel}>{label}</p>
            <div className={styles.cellValue}>{value}</div>
          </div>
        ))}
      </div>

      {/* ── Angefragte Produkte ── */}
      {items.length > 0 && (
        <section className={styles.section}>
          <div className={styles.sectionHead}>
            <h2 className={styles.sectionTitle}>Angefragte Produkte</h2>
            <span className={styles.sectionCount}>{items.length} {items.length === 1 ? 'Position' : 'Positionen'}</span>
          </div>
          <div className={styles.tableWrap}>
            <table className={styles.items}>
              <thead>
                <tr>
                  <th className={styles.colPos}>Nr.</th>
                  <th className={styles.colThumb} aria-label="Bild" />
                  <th>Produkt &amp; Link</th>
                  <th>Art.-Nr.</th>
                  <th>Größe / Oberfläche</th>
                  <th className={styles.colQty}>Menge</th>
                </tr>
              </thead>
              <tbody>
                {items.map((it, i) => {
                  const unit = UNIT_LABELS[it.unit]?.short ?? ''
                  const variant = [it.size, it.surface].filter(Boolean)
                  return (
                    <tr key={`${it.productId}-${i}`}>
                      <td className={styles.colPos}>{i + 1}</td>
                      <td className={styles.colThumb}>
                        {it.thumbnail
                          ? <img src={it.thumbnail} alt="" className={styles.thumb} loading="lazy" />
                          : <div className={styles.thumbEmpty} />}
                      </td>
                      <td className={styles.cName}>
                        <span className={styles.prodName}>
                          {it.name}
                          {SOURCE_TAG[it.sourceType] && <span className={styles.tag}>{SOURCE_TAG[it.sourceType]}</span>}
                        </span>
                        {it.path && (
                          <a href={absolute(it.path)} target="_blank" rel="noopener noreferrer" className={styles.prodLink}>
                            {shortUrl(it.path)} ↗
                          </a>
                        )}
                      </td>
                      <td className={`${styles.colArt} ${it.articleNumber ? '' : styles.isEmpty}`}>
                        {it.articleNumber ?? <span className={styles.none}>—</span>}
                      </td>
                      <td className={`${styles.colVariant} ${variant.length ? '' : styles.isEmpty}`}>
                        {variant.length
                          ? variant.map((v) => <span key={v} className={styles.variantLine}>{v}</span>)
                          : <span className={styles.none}>—</span>}
                      </td>
                      <td className={styles.colQty}>
                        {it.quantity > 0
                          ? <><span className={styles.qtyBig}>{formatQuantity(it.quantity, it.unit)}</span><span className={styles.qtyUnit}>{unit}</span></>
                          : <span className={styles.none}>—</span>}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* ── Nachricht / Kommentar des Kunden ── */}
      {comment && (
        <section className={styles.section}>
          <div className={styles.sectionHead}>
            <h2 className={styles.sectionTitle}>{isLegacyBasket ? 'Nachricht' : 'Kommentar des Kunden'}</h2>
          </div>
          <div className={styles.comment}>{comment}</div>
        </section>
      )}

      {/* ── Druck-Fuß ── */}
      <p className={`${styles.printOnly} ${styles.printFooter}`}>
        Anfrage {number} · ausgedruckt am {formatDateTime(new Date().toISOString())}
        {items.length > 0 && ` · ${items.length} ${items.length === 1 ? 'Position' : 'Positionen'}`}
      </p>

      {/* ── Bearbeitung (nur Bildschirm) ── */}
      <section className={`${styles.section} ${styles.noPrint}`}>
        <div className={styles.sectionHead}>
          <h2 className={styles.sectionTitle}>Status</h2>
        </div>
        <form action={statusAction} className={styles.statusRow}>
          <select name="status" defaultValue={inq.status} required aria-label="Status der Anfrage">
            {Object.entries(STATUS_LABELS).map(([val, info]) => (
              <option key={val} value={val}>{info.label}</option>
            ))}
          </select>
          <button type="submit" className={formStyles.btnPrimary}>Status speichern</button>
        </form>
      </section>

      <section className={`${styles.section} ${styles.noPrint}`}>
        <div className={styles.sectionHead}>
          <h2 className={styles.sectionTitle}>Team-Notizen</h2>
          <span className={styles.sectionCount}>intern</span>
        </div>
        <InquiryNotes inquiryId={inq.id} notes={noteViews} />
      </section>
    </div>
  )
}
