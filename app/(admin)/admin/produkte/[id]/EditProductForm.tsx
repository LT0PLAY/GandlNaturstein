'use client'

import { useActionState, useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { updateProduct, removeGalleryImage, removeThumbnail, removeIcon } from '@/lib/actions/products'
import ImageUploader from '@/components/admin/ImageUploader'
import DeleteButton from '@/components/admin/DeleteButton'
import type { Product, Category, CategoryBereich } from '@/lib/types'
import { BEREICH_LABELS } from '@/lib/types'
import styles from '../../form.module.css'
import imageStyles from '../images.module.css'

const initial = { error: null as string | null, success: false, id: null as string | null }
const MAX_SIZES = 6

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

export default function EditProductForm({
  product,
  categories,
  extraCategoryIds: initialExtraCategoryIds = [],
}: {
  product: Product
  categories: Category[]
  extraCategoryIds?: string[]
}) {
  const p    = product
  const alts = (p as any).image_alts as Record<string, string> ?? {}

  const updateProductById = updateProduct.bind(null, p.id)
  const [state, action, isPending] = useActionState(updateProductById, initial)
  const router = useRouter()

  const currentCat = categories.find(c => c.id === p.category_id) ?? null

  const [name,       setName]       = useState<string>(p.name)
  const [slug,       setSlug]       = useState<string>(p.slug)
  const [bereich,    setBereich]    = useState<CategoryBereich | ''>((p as any).bereich ?? currentCat?.type ?? '')
  const [categoryId, setCategoryId] = useState<string>(p.category_id ?? '')
  const [extraCategoryIds, setExtraCategoryIds] = useState<string[]>(initialExtraCategoryIds)

  useEffect(() => {
    if (state.success) router.push('/admin/produkte')
  }, [state.success, router])

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
          <input
            name="name"
            type="text"
            required
            value={name}
            onChange={(e) => {
              setName(e.target.value)
              setSlug(toSlug(e.target.value))
            }}
          />
        </div>

        <div className={styles.field}>
          <label>Slug *</label>
          <input
            name="slug"
            type="text"
            required
            value={slug}
            pattern="[a-z0-9-]+"
            onChange={(e) => setSlug(e.target.value)}
          />
        </div>

        <div className={styles.field}>
          <label>Artikelnummer <span>— optional, frei wählbar</span></label>
          <input
            name="article_number"
            type="text"
            defaultValue={p.article_number ?? ''}
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
          <select name="is_active" defaultValue={p.is_active ? 'true' : 'false'}>
            <option value="true">Aktiv</option>
            <option value="false">Inaktiv</option>
          </select>
        </div>

        <div className={styles.field}>
          <label>Material / Steinart</label>
          <input name="material" type="text" defaultValue={p.material ?? ''} />
        </div>
        <div className={styles.field}>
          <label>Oberfläche</label>
          <input name="surface" type="text" defaultValue={p.surface ?? ''} />
        </div>
        <div className={styles.field}>
          <label>Format / Maße</label>
          <input name="format" type="text" defaultValue={p.format ?? ''} />
        </div>
        <div className={styles.field}>
          <label>Herkunft</label>
          <input name="origin" type="text" defaultValue={p.origin ?? ''} />
        </div>
        <div className={styles.field}>
          <label>Einsatzbereich</label>
          <input name="einsatzbereich" type="text" defaultValue={(p as any).einsatzbereich ?? ''} placeholder="z.B. Terrasse, Bad, Fassade" />
        </div>
        <div className={styles.field}>
          <label>Farbe</label>
          <input name="farbe" type="text" defaultValue={(p as any).farbe ?? ''} placeholder="z.B. Grau, Beige, Anthrazit" />
        </div>
        <div className={`${styles.field} ${styles.fullWidth}`}>
          <label>Beschreibung</label>
          <textarea name="description" rows={3} defaultValue={p.description ?? ''} />
        </div>

        {/* ── Einheit + Preis ── */}
        <div className={styles.field}>
          <label>Einheit</label>
          <select name="unit" defaultValue={(p as any).unit ?? 'qm'}>
            <option value="qm">Quadratmeter (m²)</option>
            <option value="stueck">Stück</option>
            <option value="laufmeter">Laufmeter</option>
            <option value="gewicht">Gewicht (kg)</option>
          </select>
        </div>
        <div className={styles.field}>
          <label>Preis <span>optional, pro gewählter Einheit</span></label>
          <input name="price" type="number" min="0" step="0.01"
            defaultValue={(p as any).price ?? ''} placeholder="z.B. 89.90" />
        </div>
        <div className={styles.field} style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingTop: '22px' }}>
          <input name="show_price" type="checkbox" id="edit_show_price" value="true"
            defaultChecked={(p as any).show_price === true}
            style={{ width: '16px', height: '16px', accentColor: '#9bae9f' }} />
          <label htmlFor="edit_show_price" style={{ margin: 0, cursor: 'pointer' }}>Preis auf Website anzeigen</label>
        </div>

        <div className={styles.field}>
          <label>Reihenfolge</label>
          <input name="sort_order" type="number" min="0" defaultValue={p.sort_order} />
        </div>
      </div>

      <p className={styles.sectionLabel}>
        Größenvarianten <span style={{ fontWeight: 400, color: 'var(--color-text-muted)' }}>
          (optional — bis zu {MAX_SIZES}, statt mehrerer einzelner Produkte)
        </span>
      </p>
      <div className={styles.formGrid}>
        <div className={`${styles.field} ${styles.fullWidth}`} style={{ marginBottom: 0 }}>
          <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', marginBottom: '12px' }}>
            Bietet dieses Produkt mehrere Größen/Formate an (z.B. verschiedene Plattenmaße), können
            hier bis zu {MAX_SIZES} Varianten mit eigenem Preis hinterlegt werden — Besucher wählen die
            gewünschte Größe dann direkt auf der Produktseite aus.
          </p>
        </div>
        {Array.from({ length: MAX_SIZES }).map((_, i) => {
          const existingSize = ((p as any).sizes as Array<{ label: string; price?: number | null; article_number?: string | null }> | undefined)?.[i]
          return (
            <div key={i} className={`${styles.sizeRow} ${styles.fullWidth}`}>
              <input
                name={`size_label_${i}`}
                type="text"
                placeholder={`Größe ${i + 1}, z.B. 30x30x3 cm`}
                defaultValue={existingSize?.label ?? ''}
                className={styles.sizeLabelInput}
              />
              <input
                name={`size_price_${i}`}
                type="number"
                min="0"
                step="0.01"
                placeholder="Preis (optional)"
                defaultValue={existingSize?.price ?? ''}
                className={styles.sizePriceInput}
              />
              <input
                name={`size_article_${i}`}
                type="text"
                placeholder="Artikelnr. (optional)"
                defaultValue={existingSize?.article_number ?? ''}
                className={styles.sizeArticleInput}
              />
            </div>
          )
        })}
      </div>

      {/* ── Titelbild ── */}
      <div className={imageStyles.section}>
        <div className={imageStyles.sectionHeader}>
          <p className={imageStyles.sectionTitle}>Titelbild</p>
          <p className={imageStyles.sectionDesc}>Wird in Listen und als Hauptbild angezeigt.</p>
        </div>
        {(p as any).thumbnail ? (
          <div className={imageStyles.currentThumb}>
            <img src={(p as any).thumbnail} alt={alts[(p as any).thumbnail] ?? p.name} className={imageStyles.thumbPreview} />
            <div className={imageStyles.thumbInfo}>
              <p className={imageStyles.thumbLabel}>Aktuelles Titelbild</p>
              <p className={imageStyles.thumbAlt}>{alts[(p as any).thumbnail] ?? '—'}</p>
              <DeleteButton
                action={removeThumbnail.bind(null, p.id)}
                label="Titelbild entfernen"
                confirmMsg="Titelbild wirklich entfernen?"
                className={imageStyles.removeBtn}
              />
            </div>
          </div>
        ) : null}
        <div style={{ padding: '16px 20px' }}>
          <ImageUploader
            field="thumbnail"
            label={(p as any).thumbnail ? 'Titelbild ersetzen' : 'Titelbild hochladen'}
            hint="JPG, PNG, WebP · wird direkt zu Supabase hochgeladen"
          />
          <div className={styles.field} style={{ marginTop: '12px' }}>
            <label>Alt-Text</label>
            <input name="thumbnail_alt" type="text" defaultValue={alts[(p as any).thumbnail ?? ''] ?? p.name} />
          </div>
        </div>
      </div>

      {/* ── Icon ── */}
      <div className={imageStyles.section}>
        <div className={imageStyles.sectionHeader}>
          <p className={imageStyles.sectionTitle}>Icon</p>
          <p className={imageStyles.sectionDesc}>Kleines PNG-Icon, wird unten rechts im Produktbild eingeblendet.</p>
        </div>
        {(p as any).icon_url ? (
          <div className={imageStyles.currentThumb}>
            <img src={(p as any).icon_url} alt="Icon" className={imageStyles.thumbPreview} style={{ objectFit: 'contain', background: '#100E08' }} />
            <div className={imageStyles.thumbInfo}>
              <p className={imageStyles.thumbLabel}>Aktuelles Icon</p>
              <DeleteButton
                action={removeIcon.bind(null, p.id)}
                label="Icon entfernen"
                confirmMsg="Icon wirklich entfernen?"
                className={imageStyles.removeBtn}
              />
            </div>
          </div>
        ) : null}
        <div style={{ padding: '16px 20px' }}>
          <ImageUploader
            field="icon"
            label={(p as any).icon_url ? 'Icon ersetzen' : 'Icon hochladen'}
            hint="PNG mit transparentem Hintergrund empfohlen"
          />
        </div>
      </div>

      {/* ── Galerie ── */}
      <div className={imageStyles.section}>
        <div className={imageStyles.sectionHeader}>
          <p className={imageStyles.sectionTitle}>Galerie / Detailfotos</p>
          <p className={imageStyles.sectionDesc}>Detailaufnahmen, Textur, Verlegungsbeispiele.</p>
        </div>
        {(p.images as string[])?.length > 0 && (
          <div className={imageStyles.gallery}>
            {(p.images as string[]).map((url) => (
              <div key={url} className={imageStyles.galleryItem}>
                <img src={url} alt={alts[url] ?? p.name} className={imageStyles.galleryImg} />
                <p className={imageStyles.galleryAlt}>{alts[url] ?? '—'}</p>
                <DeleteButton
                  action={removeGalleryImage.bind(null, p.id, url)}
                  label="Entfernen"
                  confirmMsg="Foto wirklich entfernen?"
                  className={imageStyles.removeBtn}
                />
              </div>
            ))}
          </div>
        )}
        <div style={{ padding: '16px 20px' }}>
          <ImageUploader field="gallery" label="Neue Detailfotos hinzufügen" multiple max={6} hint="Bis zu 6 Bilder möglich (gesamt)" />
        </div>
      </div>

      <div className={styles.formActions}>
        <button type="submit" className={styles.btnPrimary} disabled={isPending}>
          {isPending ? 'Wird gespeichert…' : 'Änderungen speichern'}
        </button>
        <a href="/admin/produkte" className={styles.btnCancel}>Abbrechen</a>
      </div>
    </form>
  )
}
