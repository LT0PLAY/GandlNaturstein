'use client'

import { useActionState, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import ImageUploader from '@/components/admin/ImageUploader'
import type { GuideEntry, Product } from '@/lib/types'
import type { GuideActionState } from '@/lib/actions/guide'
import { removeGuideImage } from '@/lib/actions/guide'
import styles from '../form.module.css'

type ProductOption = Pick<Product, 'id' | 'name' | 'thumbnail' | 'images'>

type Props = {
  action: (prev: GuideActionState, formData: FormData) => Promise<GuideActionState>
  entry?: GuideEntry
  products: ProductOption[]
}

const INITIAL: GuideActionState = { error: null, success: false, id: null }

export default function GuideForm({ action, entry, products }: Props) {
  const [state, dispatch] = useActionState(action, INITIAL)
  const router = useRouter()

  const [productId, setProductId] = useState(entry?.product_id ?? '')
  const [pickedProductImages, setPickedProductImages] = useState<string[]>([])

  const selectedProduct = products.find((p) => p.id === productId)
  const productPhotos = selectedProduct
    ? [selectedProduct.thumbnail, ...(selectedProduct.images ?? [])].filter(Boolean) as string[]
    : []

  function togglePhoto(url: string) {
    setPickedProductImages((cur) =>
      cur.includes(url) ? cur.filter((u) => u !== url) : [...cur, url]
    )
  }

  useEffect(() => {
    if (state.success) router.push('/admin/guide')
  }, [state.success, router])

  return (
    <form action={dispatch} className={styles.form}>

      <p className={styles.sectionLabel}>Guide-Eintrag</p>
      <div className={styles.formGrid}>
        <div className={styles.field}>
          <label>Nummer *</label>
          <input name="number" type="number" min="1" required
            defaultValue={entry?.number}
            placeholder="z. B. 11" />
        </div>
        <div className={styles.field}>
          <label>Sortierung</label>
          <input name="sort_order" type="number" defaultValue={entry?.sort_order ?? 0} />
        </div>
        <div className={`${styles.field} ${styles.fullWidth}`}>
          <label>Vorhandenes Produkt verknüpfen <span>(optional)</span></label>
          <select name="product_id" value={productId} onChange={(e) => { setProductId(e.target.value); setPickedProductImages([]) }}>
            <option value="">— kein Produkt, eigener Eintrag —</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          <p className={styles.hint} style={{ marginTop: '6px' }}>
            Verknüpft: Name/Beschreibung leer lassen, dann werden sie automatisch vom Produkt
            übernommen. Fotos wählst du unten gezielt aus (Produktfotos übernehmen und/oder eigene hochladen).
          </p>
        </div>
        <div className={`${styles.field} ${styles.fullWidth}`}>
          <label>Name <span>(Pflicht, außer bei verknüpftem Produkt)</span></label>
          <input name="name" type="text"
            defaultValue={entry?.name}
            placeholder="z. B. Jura Kalkstein – Terrassenplatte geflammt" />
        </div>
        <div className={`${styles.field} ${styles.fullWidth}`}>
          <label>Beschreibung</label>
          <textarea name="description" rows={5}
            defaultValue={entry?.description ?? ''}
            placeholder="Material, Maße, Oberfläche, Herkunft … (leer = vom Produkt übernehmen)" />
        </div>
      </div>

      <p className={styles.sectionLabel}>Fotos</p>

      {selectedProduct && productPhotos.length > 0 && (
        <div className={styles.imageGrid}>
          <p className={styles.hint} style={{ marginBottom: '10px' }}>
            Fotos von „{selectedProduct.name}" übernehmen <span>(anklicken zum Auswählen)</span>
          </p>
          <div className={styles.images}>
            {productPhotos.map((url) => {
              const picked = pickedProductImages.includes(url)
              return (
                <div key={url} className={styles.imageWrapper}>
                  <img
                    src={url}
                    alt=""
                    className={styles.imagePreview}
                    onClick={() => togglePhoto(url)}
                    style={{
                      cursor: 'pointer',
                      outline: picked ? '3px solid var(--color-sage)' : '3px solid transparent',
                      opacity: picked ? 1 : 0.55,
                    }}
                  />
                  {picked && (
                    <span style={{
                      position: 'absolute', top: '4px', right: '4px', background: 'var(--color-sage)',
                      color: 'var(--color-bg)', width: '18px', height: '18px', borderRadius: '50%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px',
                    }}>✓</span>
                  )}
                </div>
              )
            })}
          </div>
          {/* Ausgewählte Produktfotos ans Formular übergeben */}
          {pickedProductImages.map((url, i) => (
            <input key={url} type="hidden" name={`product_images_${i}`} value={url} />
          ))}
          <input type="hidden" name="product_images_count" value={pickedProductImages.length} />
        </div>
      )}

      {entry && (entry.images ?? []).length > 0 && (
        <div className={styles.imageGrid}>
          <p className={styles.hint} style={{ marginBottom: '10px' }}>Aktuelle Fotos</p>
          <div className={styles.images}>
            {entry.images.map((url) => (
              <div key={url} className={styles.imageWrapper}>
                <img src={url} alt="" className={styles.imagePreview} />
                <button
                  type="button"
                  className={styles.imageRemove}
                  onClick={() => { removeGuideImage(entry.id, url) }}
                >✕</button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className={styles.formGrid}>
        <div className={`${styles.field} ${styles.fullWidth}`}>
          <label>Neue Fotos hinzufügen <span>(max. 6)</span></label>
          <ImageUploader field="images" multiple={true} max={6} label="Fotos hochladen" />
        </div>
      </div>

      <p className={styles.sectionLabel}>Sichtbarkeit</p>
      <div className={styles.formGrid}>
        <div className={styles.field}>
          <label>Status</label>
          <select name="is_active" defaultValue={entry?.is_active === false ? 'false' : 'true'}>
            <option value="true">Aktiv (im Guide sichtbar)</option>
            <option value="false">Inaktiv</option>
          </select>
        </div>
      </div>

      {state.error && (
        <p style={{ color: '#e07070', fontSize: '15px', marginBottom: '16px', fontFamily: 'var(--font-inter)' }}>
          ⚠ {state.error}
        </p>
      )}

      <div className={styles.formActions}>
        <button type="submit" className={styles.btnPrimary}>
          {entry ? 'Speichern' : 'Eintrag anlegen'}
        </button>
        <a href="/admin/guide" className={styles.btnCancel}>Abbrechen</a>
      </div>
    </form>
  )
}
