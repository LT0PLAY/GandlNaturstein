'use client'

import { useActionState, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import ImageUploader from '@/components/admin/ImageUploader'
import type { Reference, Product } from '@/lib/types'
import type { ReferenceActionState } from '@/lib/actions/references'
import styles from '../form.module.css'

type Props = {
  action: (prev: ReferenceActionState, formData: FormData) => Promise<ReferenceActionState>
  reference?: Reference
  products: Pick<Product, 'id' | 'name'>[]
}

const INITIAL: ReferenceActionState = { error: null, success: false, id: null }

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

export default function ReferenzForm({ action, reference, products }: Props) {
  const [state, dispatch] = useActionState(action, INITIAL)
  const router = useRouter()
  const [title, setTitle] = useState(reference?.title ?? '')
  const [slug,  setSlug]  = useState(reference?.slug ?? '')

  useEffect(() => {
    if (state.success) router.push('/admin/referenzen')
  }, [state.success, router])

  const year = new Date().getFullYear()

  return (
    <form action={dispatch} className={styles.form}>

      {/* ── Basis ── */}
      <p className={styles.sectionLabel}>Basisdaten</p>
      <div className={styles.formGrid}>
        <div className={styles.field}>
          <label>Titel *</label>
          <input name="title" type="text" required
            value={title}
            placeholder="z. B. Villa Rosenheim – Terrassenplatten"
            onChange={(e) => {
              setTitle(e.target.value)
              setSlug(toSlug(e.target.value))
            }}
          />
        </div>
        <div className={styles.field}>
          <label>Slug <span>(URL-Pfad, auto)</span></label>
          <input name="slug" type="text"
            value={slug}
            placeholder="villa-rosenheim-terrassenplatten"
            onChange={(e) => setSlug(e.target.value)}
          />
        </div>
        <div className={styles.field}>
          <label>Untertitel</label>
          <input name="subtitle" type="text"
            defaultValue={reference?.subtitle ?? ''}
            placeholder="z. B. Naturstein Außenanlage" />
        </div>
        <div className={styles.field}>
          <label>Jahr</label>
          <input name="year" type="number" min="2000" max={year + 1}
            defaultValue={reference?.year ?? year} />
        </div>
        <div className={`${styles.field} ${styles.fullWidth}`}>
          <label>Kategorie-Tags <span>(kommagetrennt)</span></label>
          <input name="category_tags" type="text"
            defaultValue={reference?.category_tags?.join(', ') ?? ''}
            placeholder="Massivproduktion, Außenbereich, Terrassenplatten" />
          <p className={styles.hint}>Werden klein als Labels angezeigt, z. B. „Massivproduktion / Außenbereich"</p>
        </div>
        <div className={`${styles.field} ${styles.fullWidth}`}>
          <label>Beschreibung <span>(„Die Vision")</span></label>
          <textarea name="description" rows={5}
            defaultValue={reference?.description ?? ''}
            placeholder="Beschreibe das Projekt, die Besonderheiten und das Ergebnis …" />
        </div>
      </div>

      {/* ── Bilder ── */}
      <p className={styles.sectionLabel} style={{ marginTop: '8px' }}>Bilder</p>
      <div className={styles.formGrid}>
        <div className={`${styles.field} ${styles.fullWidth}`}>
          <label>Titelbild (Hero)</label>
          <ImageUploader
            field="cover_image"
            label="Titelbild hochladen"
            currentUrl={reference?.cover_image ?? undefined}
            max={1}
          />
        </div>
        <div className={`${styles.field} ${styles.fullWidth}`}>
          <label>Behind the Scenes Galerie <span>(max. 6 Fotos)</span></label>
          <ImageUploader
            field="gallery"
            label="Fotos hochladen"
            multiple={true}
            max={6}
          />
          {reference?.images && reference.images.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
              {reference.images.map((url, i) => (
                <div key={i} style={{ position: 'relative' }}>
                  <img src={url} alt="" style={{ width: '80px', height: '60px', objectFit: 'cover', opacity: 0.8 }} />
                </div>
              ))}
              <p className={styles.hint} style={{ width: '100%', marginTop: '4px' }}>
                Bestehende Galeriebilder. Neue Uploads werden hinzugefügt.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── Technische Specs ── */}
      <p className={styles.sectionLabel} style={{ marginTop: '8px' }}>Technische Details</p>
      <div className={styles.formGrid}>
        <div className={styles.field}>
          <label>Material</label>
          <input name="spec_material" type="text"
            defaultValue={reference?.spec_material ?? ''}
            placeholder="z. B. Granit, Basalt, Sandstein" />
        </div>
        <div className={styles.field}>
          <label>Oberfläche / Format</label>
          <input name="spec_surface" type="text"
            defaultValue={reference?.spec_surface ?? ''}
            placeholder="z. B. gesägt, gebürstet / 60×40 cm" />
        </div>
        <div className={styles.field}>
          <label>Leistungsumfang</label>
          <input name="spec_scope" type="text"
            defaultValue={reference?.spec_scope ?? ''}
            placeholder="z. B. Lieferung & Verlegung, Beratung" />
        </div>
        <div className={styles.field}>
          <label>Standort</label>
          <input name="spec_location" type="text"
            defaultValue={reference?.spec_location ?? ''}
            placeholder="z. B. München, Bayern" />
        </div>
      </div>

      {/* ── Produkte verknüpfen ── */}
      <p className={styles.sectionLabel} style={{ marginTop: '8px' }}>Produkte verknüpfen</p>
      <div className={styles.formGrid}>
        <div className={`${styles.field} ${styles.fullWidth}`}>
          <label>Produkte <span>(optional, Mehrfachauswahl)</span></label>
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: '8px', padding: '12px',
            border: '1px solid rgba(196,146,58,0.15)',
            borderRadius: '2px', maxHeight: '260px', overflowY: 'auto',
            background: 'rgba(0,0,0,0.2)',
          }}>
            {products.length === 0 && (
              <p style={{ fontSize: '12px', color: 'var(--color-text-dim)', gridColumn: '1/-1' }}>
                Keine aktiven Produkte vorhanden.
              </p>
            )}
            {products.map((p) => {
              const checked = (reference?.product_ids ?? (reference?.product_id ? [reference.product_id] : [])).includes(p.id)
              return (
                <label key={p.id} style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '8px 10px', cursor: 'pointer',
                  background: 'rgba(196,146,58,0.03)',
                  border: '0.5px solid rgba(196,146,58,0.08)',
                  transition: 'background .15s',
                  fontSize: '13px', fontFamily: 'var(--font-inter)',
                  color: 'var(--color-text-muted)',
                }}>
                  <input
                    type="checkbox"
                    name="product_ids"
                    value={p.id}
                    defaultChecked={checked}
                    style={{ width: '14px', height: '14px', accentColor: '#C4923A', flexShrink: 0 }}
                  />
                  {p.name}
                </label>
              )
            })}
          </div>
          <p className={styles.hint}>Verknüpfte Produkte werden auf der Referenz-Detailseite angezeigt.</p>
        </div>
        <div className={styles.field}>
          <label>Reihenfolge</label>
          <input name="sort_order" type="number" min="0"
            defaultValue={reference?.sort_order ?? 0} />
        </div>
        <div className={styles.field}>
          <label>Status</label>
          <select name="is_published" defaultValue={reference?.is_published ? 'true' : 'false'}>
            <option value="false">Entwurf — nicht öffentlich sichtbar</option>
            <option value="true">Veröffentlicht — öffentlich sichtbar</option>
          </select>
        </div>
      </div>

      {/* ── SEO ── */}
      <p className={styles.sectionLabel} style={{ marginTop: '8px' }}>SEO</p>
      <div className={styles.formGrid}>
        <div className={`${styles.field} ${styles.fullWidth}`}>
          <label>Meta-Titel <span>(max. 60 Zeichen)</span></label>
          <input name="meta_title" type="text" maxLength={60}
            defaultValue={reference?.meta_title ?? ''}
            placeholder="z. B. Granit Terrasse Rosenheim – Gandl Natursteine" />
          <p className={styles.hint}>Leer lassen = Titel wird automatisch verwendet.</p>
        </div>
        <div className={`${styles.field} ${styles.fullWidth}`}>
          <label>Meta-Beschreibung <span>(max. 160 Zeichen)</span></label>
          <textarea name="meta_description" rows={3} maxLength={160}
            defaultValue={reference?.meta_description ?? ''}
            placeholder="Kurze Beschreibung für Google (max. 160 Zeichen) …" />
        </div>
      </div>

      {state.error && (
        <p style={{ color: '#E06060', fontFamily: 'var(--font-inter)', fontSize: '13px', marginBottom: '16px' }}>
          {state.error}
        </p>
      )}

      <div className={styles.formActions}>
        <button type="submit" className={styles.btnPrimary}>Speichern</button>
        <a href="/admin/referenzen" className={styles.btnCancel}>Abbrechen</a>
      </div>
    </form>
  )
}
