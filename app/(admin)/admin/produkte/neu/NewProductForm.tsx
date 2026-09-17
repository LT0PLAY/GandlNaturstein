'use client'

import { useActionState, useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { createProduct } from '@/lib/actions/products'
import ImageUploader from '@/components/admin/ImageUploader'
import VariantsEditor from '@/components/admin/VariantsEditor'
import type { Category, CategoryBereich, ProductUnit } from '@/lib/types'
import { BEREICH_LABELS } from '@/lib/types'
import styles from '../../form.module.css'
import imageStyles from '../images.module.css'

const initial = { error: null as string | null, success: false, id: null as string | null }
const MAX_SIZES = 8
const MAX_SURFACES = 8

const UNIT_VARIANT_HINT: Record<ProductUnit, string> = {
  groesse:   'z.B. 30x30x3 cm',
  gewicht:   'z.B. 5 kg, 10 kg, 25 kg',
  stueck:    'z.B. 10er-Set, Einzelstück',
  laufmeter: 'z.B. 2,5 lfm',
  qm:        'z.B. 1 m², 5 m² Gebinde',
}
const UNIT_VARIANT_SECTION_TITLE: Record<ProductUnit, string> = {
  groesse:   'Größenvarianten',
  gewicht:   'Gewichtsvarianten',
  stueck:    'Stückvarianten',
  laufmeter: 'Längenvarianten',
  qm:        'Mengenvarianten',
}

export default function NewProductForm({ categories }: { categories: Category[] }) {
  const [state, action, isPending] = useActionState(createProduct, initial)
  const router = useRouter()

  const [bereich,    setBereich]    = useState<CategoryBereich | ''>('')
  const [categoryId, setCategoryId] = useState<string>('')
  const [extraCategoryIds, setExtraCategoryIds] = useState<string[]>([])
  const [slug,       setSlug]       = useState<string>('')
  const [slugTouched, setSlugTouched] = useState(false)
  const [unit,        setUnit]        = useState<ProductUnit | ''>('')
  const [surfaceLabels, setSurfaceLabels] = useState<string[]>([])

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

  // Kategorien, die zum gewählten Bereich passen — Produkt kann aber auch ohne
  // Kategorie direkt am Bereich hängen (z.B. Gartengestaltung ohne Unterkategorie)
  const filteredCategories = useMemo(() => {
    if (!bereich) return []
    return categories.filter(c => c.type === bereich)
  }, [bereich, categories])

  const handleBereichChange = (val: CategoryBereich | '') => {
    setBereich(val)
    setCategoryId('')
  }

  function toggleExtraCategory(id: string) {
    setExtraCategoryIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  return (
    <form action={action} className={styles.form}>

      {state.error && (
        <div style={{
          background: 'rgba(224,96,96,0.08)', border: '1px solid rgba(224,96,96,0.3)',
          color: '#E06060', padding: '12px 16px', fontSize: '15px',
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

        {/* ── Bereich + Kategorie ── */}
        <div className={styles.field}>
          <label>Hauptbereich</label>
          <select
            name="bereich"
            value={bereich}
            onChange={(e) => handleBereichChange(e.target.value as CategoryBereich | '')}
          >
            <option value="">— Keiner —</option>
            {(Object.keys(BEREICH_LABELS) as CategoryBereich[]).map((key) => (
              <option key={key} value={key}>{BEREICH_LABELS[key]}</option>
            ))}
          </select>
        </div>

        <div className={styles.field} style={bereich ? {} : { opacity: 0.5, pointerEvents: 'none' }}>
          <label>
            Kategorie <span>— optional, Produkt kann auch direkt im Bereich stehen</span>
          </label>
          <select
            name="category_id"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
          >
            <option value="">— Keine (direkt im Bereich) —</option>
            {filteredCategories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        <div className={`${styles.field} ${styles.fullWidth}`}>
          <label>
            Weitere Kategorien <span>— optional, Produkt zusätzlich in anderen Kategorien anzeigen (z.B. auch bei &bdquo;Gartengestaltung&ldquo;)</span>
          </label>
          <div className={styles.categoryCheckList}>
            {categories.filter((cat) => cat.id !== categoryId).map((cat) => (
              <label key={cat.id} className={styles.categoryCheckItem}>
                <input
                  type="checkbox"
                  name="category_ids"
                  value={cat.id}
                  checked={extraCategoryIds.includes(cat.id)}
                  onChange={() => toggleExtraCategory(cat.id)}
                />
                {cat.name}
              </label>
            ))}
          </div>
        </div>

        <div className={styles.field}>
          <label>Status</label>
          <select name="is_active" defaultValue="true">
            <option value="true">Aktiv</option>
            <option value="false">Inaktiv</option>
          </select>
        </div>

        <div className={styles.field}>
          <label>Material / Steinart</label>
          <input name="material" type="text" placeholder="z.B. Granit, Marmor" />
        </div>
        <div className={styles.field}>
          <label>Format / Maße</label>
          <input name="format" type="text" placeholder="z.B. 9/11 cm, nach Maß" />
        </div>
        <div className={styles.field}>
          <label>Herkunft</label>
          <input name="origin" type="text" placeholder="z.B. Portugal" />
        </div>
        <div className={styles.field}>
          <label>Einsatzbereich</label>
          <input name="einsatzbereich" type="text" placeholder="z.B. Terrasse, Bad, Fassade" />
        </div>
        <div className={styles.field}>
          <label>Farbe</label>
          <input name="farbe" type="text" placeholder="z.B. Grau, Beige, Anthrazit" />
        </div>
        <div className={`${styles.field} ${styles.fullWidth}`}>
          <label>Beschreibung</label>
          <textarea name="description" rows={3} placeholder="Kurze Produktbeschreibung..." />
        </div>

        {/* ── Einheit + Preis ── */}
        <div className={styles.field}>
          <label>Einheit *</label>
          <select
            name="unit"
            required
            value={unit}
            onChange={(e) => setUnit(e.target.value as ProductUnit)}
          >
            <option value="" disabled>Bitte wählen…</option>
            <option value="groesse">Größe / Maße</option>
            <option value="stueck">Stück</option>
            <option value="qm">Quadratmeter (m²)</option>
            <option value="laufmeter">Laufmeter</option>
            <option value="gewicht">Gewicht (kg)</option>
          </select>
          <span style={{ fontSize: '12px', color: 'var(--color-text-muted)', display: 'block', marginTop: '4px' }}>
            Wichtig für den Anfragekorb: z.B. Reinigungs-/Pflegemittel meist &bdquo;Stück&ldquo;, Platten/Beläge meist &bdquo;m²&ldquo;.
          </span>
        </div>
        <div className={styles.field}>
          <label>Preis <span>optional, pro gewählter Einheit</span></label>
          <input name="price" type="number" min="0" step="0.01" placeholder="z.B. 89.90" />
        </div>
        <div className={styles.field} style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingTop: '22px' }}>
          <input name="show_price" type="checkbox" id="new_show_price" value="true" style={{ width: '16px', height: '16px', accentColor: '#9bae9f' }} />
          <label htmlFor="new_show_price" style={{ margin: 0, cursor: 'pointer' }}>Preis auf Website anzeigen</label>
        </div>

        <div className={styles.field}>
          <label>Reihenfolge</label>
          <input name="sort_order" type="number" min="0" defaultValue="0" />
        </div>
      </div>

      <p className={styles.sectionLabel}>
        Oberflächen <span style={{ fontWeight: 400, color: 'var(--color-text-muted)' }}>
          (optional — bis zu {MAX_SURFACES})
        </span>
      </p>
      <div className={styles.formGrid}>
        <div className={`${styles.field} ${styles.fullWidth}`}>
          <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', marginBottom: '12px' }}>
            Bietet dieses Produkt mehrere Oberflächen an (z.B. Poliert, Geflammt, Rau), wählt der Besucher
            sie direkt auf der Produktseite aus. Erst hier anlegen — bei den Varianten unten kann dann pro
            Größe ausgewählt werden, welche Oberflächen dazu passen.
          </p>
          <VariantsEditor
            namePrefix="surface"
            initial={[]}
            max={MAX_SURFACES}
            labelPlaceholder={(i) => `Oberfläche ${i + 1}, z.B. Poliert`}
            addLabel="Oberfläche hinzufügen"
            onRowsChange={(rows) => setSurfaceLabels(rows.map((r) => r.label.trim()).filter(Boolean))}
          />
        </div>
      </div>

      <p className={styles.sectionLabel}>
        {unit ? UNIT_VARIANT_SECTION_TITLE[unit] : 'Varianten'} <span style={{ fontWeight: 400, color: 'var(--color-text-muted)' }}>
          (optional — bis zu {MAX_SIZES}, statt mehrerer einzelner Produkte)
        </span>
      </p>
      <div className={styles.formGrid}>
        <div className={`${styles.field} ${styles.fullWidth}`}>
          <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', marginBottom: '12px' }}>
            Bietet dieses Produkt mehrere Varianten an (z.B. verschiedene Größen, Gewichte oder Mengen),
            können hier eigene Preise hinterlegt werden — Besucher wählen die gewünschte Variante dann
            direkt auf der Produktseite aus. Sind oben Oberflächen angelegt, kann pro Variante ausgewählt
            werden, welche Oberflächen dazu passen (leer = alle erlaubt).
          </p>
          <VariantsEditor
            namePrefix="size"
            initial={[]}
            max={MAX_SIZES}
            withPriceAndArticle
            labelPlaceholder={(i) => `Variante ${i + 1}, ${unit ? UNIT_VARIANT_HINT[unit] : 'z.B. 30x30x3 cm'}`}
            addLabel="Variante hinzufügen"
            surfaceOptions={surfaceLabels}
          />
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
          <p className={imageStyles.sectionTitle}>Icon</p>
          <p className={imageStyles.sectionDesc}>Kleines PNG-Icon, wird unten rechts im Produktbild eingeblendet (z.B. Pflastersteine-Symbol).</p>
        </div>
        <div style={{ padding: '16px 20px' }}>
          <ImageUploader field="icon" label="Icon hochladen" hint="PNG mit transparentem Hintergrund empfohlen" />
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
