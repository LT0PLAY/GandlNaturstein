'use client'

import { useActionState, useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { createProduct } from '@/lib/actions/products'
import ImageUploader from '@/components/admin/ImageUploader'
import type { Category, CategoryBereich, CategoryLocation } from '@/lib/types'
import { BEREICH_LABELS, LOCATION_LABELS } from '@/lib/types'
import styles from '../../form.module.css'
import imageStyles from '../images.module.css'

const initial = { error: null as string | null, success: false, id: null as string | null }

export default function NewProductForm({ categories }: { categories: Category[] }) {
  const [state, action, isPending] = useActionState(createProduct, initial)
  const router = useRouter()

  const [bereich,    setBereich]    = useState<CategoryBereich | ''>('')
  const [location,   setLocation]   = useState<CategoryLocation | ''>('')
  const [categoryId, setCategoryId] = useState<string>('')
  const [slug,       setSlug]       = useState<string>('')
  const [slugTouched, setSlugTouched] = useState(false)

  function toSlug(s: string) {
    return s.toLowerCase()
      .replace(/ä/g,'ae').replace(/ö/g,'oe').replace(/ü/g,'ue').replace(/ß/g,'ss')
      .replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').replace(/-+/g,'-').replace(/^-|-$/g,'')
  }

  function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!slugTouched) setSlug(toSlug(e.target.value))
  }

  useEffect(() => {
    if (state.success && state.id) router.push('/admin/produkte')
  }, [state.success, state.id, router])

  // Gefilterte Location-Optionen basierend auf gewähltem Bereich
  const locationOptions = useMemo(() => {
    if (!bereich || bereich === 'extras') return []
    const locs = [...new Set(
      categories.filter(c => c.type === bereich && c.location).map(c => c.location!)
    )]
    return locs
  }, [bereich, categories])

  // Gefilterte Unterkategorien
  const filteredCategories = useMemo(() => {
    if (!bereich) return []
    if (bereich === 'extras') return categories.filter(c => c.type === 'extras')
    if (!location) return []
    return categories.filter(c => c.type === bereich && c.location === location)
  }, [bereich, location, categories])

  // Reset bei Bereich/Location-Wechsel
  const handleBereichChange = (val: CategoryBereich | '') => {
    setBereich(val)
    setLocation('')
    setCategoryId('')
  }
  const handleLocationChange = (val: CategoryLocation | '') => {
    setLocation(val)
    setCategoryId('')
  }

  return (
    <form action={action} className={styles.form}>

      {state.error && (
        <div style={{
          background: 'rgba(224,96,96,0.08)', border: '1px solid rgba(224,96,96,0.3)',
          color: '#E06060', padding: '12px 16px', fontSize: '13px',
          borderRadius: '4px', marginBottom: '8px',
        }}>
          {state.error}
        </div>
      )}

      <p className={styles.sectionLabel}>Produktdaten</p>
      <div className={styles.formGrid}>

        <div className={styles.field}>
          <label>Name *</label>
          <input name="name" type="text" required placeholder="z.B. Granit Pflaster Anthrazit" onChange={handleNameChange} />
        </div>

        <div className={styles.field}>
          <label>Slug * <span>— wird automatisch generiert</span></label>
          <input
            name="slug"
            type="text"
            required
            placeholder="granit-pflaster-anthrazit"
            value={slug}
            onChange={(e) => { setSlugTouched(true); setSlug(e.target.value) }}
          />
        </div>

        <div className={styles.field}>
          <label>Artikelnummer <span>— optional, frei wählbar</span></label>
          <input
            name="article_number"
            type="text"
            placeholder="z.B. GN-1042 oder 4711"
          />
        </div>

        {/* ── Kategorie-Kaskade ── */}
        <div className={styles.field}>
          <label>Hauptbereich</label>
          <select
            value={bereich}
            onChange={(e) => handleBereichChange(e.target.value as CategoryBereich | '')}
          >
            <option value="">— Keiner —</option>
            {(Object.keys(BEREICH_LABELS) as CategoryBereich[]).map((key) => (
              <option key={key} value={key}>{BEREICH_LABELS[key]}</option>
            ))}
          </select>
        </div>

        {bereich && bereich !== 'extras' && (
          <div className={styles.field}>
            <label>Außen / Innen</label>
            <select
              value={location}
              onChange={(e) => handleLocationChange(e.target.value as CategoryLocation | '')}
            >
              <option value="">— Bitte wählen —</option>
              {locationOptions.map((loc) => (
                <option key={loc} value={loc}>{LOCATION_LABELS[loc]}</option>
              ))}
              {locationOptions.length === 0 && (
                <option disabled value="">Noch keine Kategorien in diesem Bereich</option>
              )}
            </select>
          </div>
        )}

        <div className={`${styles.field} ${bereich && bereich !== 'extras' && !location ? '' : ''}`}
          style={(bereich === '' || (bereich !== 'extras' && !location)) ? { opacity: 0.5, pointerEvents: 'none' } : {}}>
          <label>
            Unterkategorie
            {bereich && (location || bereich === 'extras') && (
              <span> — {BEREICH_LABELS[bereich as CategoryBereich]}{location ? ` › ${LOCATION_LABELS[location as CategoryLocation]}` : ''}</span>
            )}
          </label>
          <select
            name="category_id"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
          >
            <option value="">— Keine —</option>
            {filteredCategories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
            {filteredCategories.length === 0 && bereich && (location || bereich === 'extras') && (
              <option disabled value="">Keine Unterkategorien vorhanden — erst anlegen</option>
            )}
          </select>
        </div>

        <div className={styles.field}>
          <label>Status</label>
          <select name="is_active" defaultValue="true">
            <option value="true">Aktiv</option>
            <option value="false">Inaktiv</option>
          </select>
        </div>

        <div className={styles.field}>
          <label>Material</label>
          <input name="material" type="text" placeholder="z.B. Granit, Marmor" />
        </div>
        <div className={styles.field}>
          <label>Oberfläche</label>
          <input name="surface" type="text" placeholder="z.B. geflammt, poliert" />
        </div>
        <div className={styles.field}>
          <label>Format / Maße</label>
          <input name="format" type="text" placeholder="z.B. 9/11 cm, nach Maß" />
        </div>
        <div className={styles.field}>
          <label>Herkunft</label>
          <input name="origin" type="text" placeholder="z.B. Portugal" />
        </div>
        <div className={`${styles.field} ${styles.fullWidth}`}>
          <label>Beschreibung</label>
          <textarea name="description" rows={3} placeholder="Kurze Produktbeschreibung..." />
        </div>

        {/* ── Preis ── */}
        <div className={styles.field}>
          <label>Preis (€ / m²) <span>optional</span></label>
          <input name="price" type="number" min="0" step="0.01" placeholder="z.B. 89.90" />
        </div>
        <div className={styles.field} style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingTop: '22px' }}>
          <input name="show_price" type="checkbox" id="new_show_price" value="true" style={{ width: '16px', height: '16px', accentColor: '#C4923A' }} />
          <label htmlFor="new_show_price" style={{ margin: 0, cursor: 'pointer' }}>Preis auf Website anzeigen</label>
        </div>

        <div className={styles.field}>
          <label>Reihenfolge</label>
          <input name="sort_order" type="number" min="0" defaultValue="0" />
        </div>
      </div>

      <div className={imageStyles.section}>
        <div className={imageStyles.sectionHeader}>
          <p className={imageStyles.sectionTitle}>Titelbild</p>
          <p className={imageStyles.sectionDesc}>Wird in der Liste und als Hauptbild angezeigt. Empfohlen: 800×600px</p>
        </div>
        <div style={{ padding: '16px 20px' }}>
          <ImageUploader field="thumbnail" label="Titelbild hochladen" hint="JPG, PNG, WebP · wird direkt zu Supabase hochgeladen" />
          <div className={styles.field} style={{ marginTop: '12px' }}>
            <label>Alt-Text <span>— für SEO</span></label>
            <input name="thumbnail_alt" type="text" placeholder="z.B. Granit Pflaster anthrazit geflammt" />
          </div>
        </div>
      </div>

      <div className={imageStyles.section}>
        <div className={imageStyles.sectionHeader}>
          <p className={imageStyles.sectionTitle}>Galerie / Detailfotos</p>
          <p className={imageStyles.sectionDesc}>Detailaufnahmen, Textur, Verlegungsbeispiele.</p>
        </div>
        <div style={{ padding: '16px 20px' }}>
          <ImageUploader field="gallery" label="Detailfotos hochladen" multiple max={6} hint="Bis zu 6 Bilder möglich" />
        </div>
      </div>

      <div className={styles.formActions}>
        <button type="submit" className={styles.btnPrimary} disabled={isPending}>
          {isPending ? 'Wird gespeichert…' : 'Produkt speichern'}
        </button>
        <a href="/admin/produkte" className={styles.btnCancel}>Abbrechen</a>
      </div>
    </form>
  )
}
