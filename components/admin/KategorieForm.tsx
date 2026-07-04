'use client'

import { useState } from 'react'
import type { Category, CategoryBereich, CategoryLocation } from '@/lib/types'
import { BEREICH_LABELS, LOCATION_LABELS } from '@/lib/types'
import styles from '@/app/(admin)/admin/form.module.css'

function toSlug(s: string): string {
  return s
    .toLowerCase()
    .replace(/[äöü]/g, (c) => ({ ä: 'ae', ö: 'oe', ü: 'ue' }[c] ?? c))
    .replace(/ß/g, 'ss')
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

interface Props {
  category?: Category          // vorhanden = Bearbeiten, sonst Neu
  action: (fd: FormData) => void | Promise<void>
  isPending?: boolean
}

// Bereiche die Außen/Innen haben können
const BEREICHE_WITH_LOCATION: CategoryBereich[] = [
  'massivproduktion', 'sonderanfertigung', 'gartengestaltung',
]

export default function KategorieForm({ category, action, isPending }: Props) {
  const [bereich,      setBereich]      = useState<CategoryBereich | ''>(category?.type ?? '')
  const [location,     setLocation]     = useState<CategoryLocation | ''>(category?.location ?? '')
  const [slug,         setSlug]         = useState<string>(category?.slug ?? '')
  const [slugTouched,  setSlugTouched]  = useState(false)

  const needsLocation = bereich !== '' && bereich !== 'extras'

  return (
    <form action={action} className={styles.form}>

      <div className={styles.formGrid}>

        {/* ── Hauptbereich ── */}
        <div className={styles.field} style={{ gridColumn: '1 / -1' }}>
          <label>Hauptbereich *</label>
          <select
            name="type"
            required
            value={bereich}
            onChange={(e) => {
              setBereich(e.target.value as CategoryBereich)
              setLocation('')          // reset bei Bereich-Wechsel
            }}
          >
            <option value="">— Bitte wählen —</option>
            {(Object.keys(BEREICH_LABELS) as CategoryBereich[]).map((key) => (
              <option key={key} value={key}>{BEREICH_LABELS[key]}</option>
            ))}
          </select>
          {bereich && (
            <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
              {bereich === 'extras'
                ? 'Extras haben keinen Außen/Innen-Split.'
                : 'Wähle danach ob die Kategorie im Außen- oder Innenbereich liegt.'}
            </p>
          )}
        </div>

        {/* ── Außen / Innen (nur wenn kein Extras) ── */}
        {needsLocation && (
          <div className={styles.field} style={{ gridColumn: '1 / -1' }}>
            <label>Bereich (Außen / Innen) *</label>
            <select
              name="location"
              required
              value={location}
              onChange={(e) => setLocation(e.target.value as CategoryLocation)}
            >
              <option value="">— Bitte wählen —</option>
              {(Object.keys(LOCATION_LABELS) as CategoryLocation[]).map((key) => (
                <option key={key} value={key}>{LOCATION_LABELS[key]}</option>
              ))}
            </select>
          </div>
        )}

        {/* hidden location für Extras (null) */}
        {bereich === 'extras' && (
          <input type="hidden" name="location" value="" />
        )}

        {/* ── Name ── */}
        <div className={styles.field}>
          <label>Name der Unterkategorie *
            {bereich && location && (
              <span> — erscheint unter {BEREICH_LABELS[bereich as CategoryBereich]} › {LOCATION_LABELS[location as CategoryLocation]}</span>
            )}
            {bereich === 'extras' && (
              <span> — erscheint unter Extras</span>
            )}
          </label>
          <input
            name="name"
            type="text"
            required
            defaultValue={category?.name}
            placeholder={
              bereich === 'massivproduktion' && location === 'innen'
                ? 'z.B. Küchenzeilen, Fliesen, Treppen'
                : bereich === 'gartengestaltung'
                ? 'z.B. Terrassenplatten, Mauersteine'
                : bereich === 'extras'
                ? 'z.B. Pflegemittel, Zubehör'
                : 'z.B. Pflaster, Stufen'
            }
            onChange={(e) => {
              if (!slugTouched) setSlug(toSlug(e.target.value))
            }}
          />
        </div>

        {/* ── Slug ── */}
        <div className={styles.field}>
          <label>Slug <span>— wird automatisch generiert</span></label>
          <input
            name="slug"
            type="text"
            required
            value={slug}
            placeholder="terrassenplatten"
            pattern="[a-z0-9-]+"
            title="Nur Kleinbuchstaben, Zahlen und Bindestriche"
            onChange={(e) => { setSlugTouched(true); setSlug(e.target.value) }}
            onFocus={() => setSlugTouched(true)}
          />
        </div>

        {/* ── Reihenfolge ── */}
        <div className={styles.field}>
          <label>Reihenfolge</label>
          <input name="sort_order" type="number" min="0" defaultValue={category?.sort_order ?? 0} />
        </div>

        {/* ── Beschreibung ── */}
        <div className={`${styles.field} ${styles.fullWidth}`}>
          <label>Beschreibung</label>
          <textarea
            name="description"
            rows={3}
            defaultValue={category?.description ?? ''}
            placeholder="Kurze Beschreibung der Kategorie..."
          />
        </div>

      </div>

      {/* ── Vorschau der Hierarchie ── */}
      {bereich && (
        <div style={{
          background: 'rgba(196,146,58,0.04)',
          border: '0.5px solid rgba(196,146,58,0.12)',
          padding: '14px 18px',
          marginBottom: '28px',
          fontSize: '13px',
          color: 'var(--color-text-muted)',
          fontFamily: 'var(--font-inter)',
        }}>
          <span style={{ color: 'var(--color-text-dim)', fontSize: '11px', letterSpacing: '.1em', textTransform: 'uppercase' }}>
            Einordnung:
          </span>
          <br />
          <span style={{ color: 'var(--color-sage)', marginTop: '6px', display: 'block' }}>
            {BEREICH_LABELS[bereich as CategoryBereich]}
            {location ? ` › ${LOCATION_LABELS[location as CategoryLocation]}` : ''}
            {' › '}
            <span style={{ color: '#F0EBE3' }}>[ Name der Unterkategorie ]</span>
          </span>
        </div>
      )}

      <div className={styles.formActions}>
        <button type="submit" className={styles.btnPrimary} disabled={isPending}>
          {isPending ? 'Wird gespeichert…' : (category ? 'Änderungen speichern' : 'Kategorie speichern')}
        </button>
        <a href="/admin/kategorien" className={styles.btnCancel}>Abbrechen</a>
      </div>
    </form>
  )
}
