'use client'

import { useState } from 'react'
import type { Category, CategoryBereich } from '@/lib/types'
import { BEREICH_LABELS } from '@/lib/types'
import { removeCategoryImage } from '@/lib/actions/categories'
import ImageUploader from '@/components/admin/ImageUploader'
import DeleteButton from '@/components/admin/DeleteButton'
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

export default function KategorieForm({ category, action, isPending }: Props) {
  const [bereich,      setBereich]      = useState<CategoryBereich | ''>(category?.type ?? '')
  const [slug,         setSlug]         = useState<string>(category?.slug ?? '')
  const [slugTouched,  setSlugTouched]  = useState(false)

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
            onChange={(e) => setBereich(e.target.value as CategoryBereich)}
          >
            <option value="">— Bitte wählen —</option>
            {(Object.keys(BEREICH_LABELS) as CategoryBereich[]).map((key) => (
              <option key={key} value={key}>{BEREICH_LABELS[key]}</option>
            ))}
          </select>
          {bereich && (
            <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
              Kategorien können frei angelegt werden — Produkte lassen sich später dieser Kategorie
              zuordnen (oder direkt dem Bereich, ohne Kategorie).
            </p>
          )}
        </div>

        {/* ── Name ── */}
        <div className={styles.field}>
          <label>Name der Kategorie *
            {bereich && (
              <span> — erscheint unter {BEREICH_LABELS[bereich as CategoryBereich]}</span>
            )}
          </label>
          <input
            name="name"
            type="text"
            required
            defaultValue={category?.name}
            placeholder={
              bereich === 'massivproduktion'
                ? 'z.B. Jura Kalkstein, Kirchheimer Muschelkalk'
                : bereich === 'sonderanfertigung'
                ? 'z.B. Infinity Keramik, Naturstein'
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

      {/* ── Titelbild ── */}
      <div className={styles.formGrid} style={{ marginTop: '4px' }}>
        <div className={`${styles.field} ${styles.fullWidth}`}>
          <label>Titelbild <span>— großes Bannerbild oben auf der Kategorie-Seite</span></label>
          {category?.image_url && (
            <div style={{ margin: '8px 0 16px', display: 'flex', gap: '14px', alignItems: 'center' }}>
              <img
                src={category.image_url}
                alt={category.name}
                style={{ width: '160px', height: '90px', objectFit: 'cover', border: '0.5px solid rgba(155,174,159,0.15)' }}
              />
              <DeleteButton
                action={removeCategoryImage.bind(null, category.id)}
                label="Titelbild entfernen"
                confirmMsg="Titelbild wirklich entfernen?"
                className={styles.btnCancel}
              />
            </div>
          )}
          <ImageUploader field="image" label={category?.image_url ? 'Titelbild ersetzen' : 'Titelbild hochladen'} hint="JPG, PNG, WebP · empfohlen 1600×500px" />
        </div>
      </div>

      {/* ── Vorschau der Hierarchie ── */}
      {bereich && (
        <div style={{
          background: 'rgba(155, 174, 159,0.04)',
          border: '0.5px solid rgba(155, 174, 159,0.12)',
          padding: '14px 18px',
          marginBottom: '28px',
          fontSize: '15px',
          color: 'var(--color-text-muted)',
          fontFamily: 'var(--font-inter)',
        }}>
          <span style={{ color: 'var(--color-text-dim)', fontSize: '13px', letterSpacing: '.1em', textTransform: 'uppercase' }}>
            Einordnung:
          </span>
          <br />
          <span style={{ color: 'var(--color-sage)', marginTop: '6px', display: 'block' }}>
            {BEREICH_LABELS[bereich as CategoryBereich]}
            {' › '}
            <span style={{ color: '#dcdcd6' }}>[ Name der Kategorie ]</span>
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
