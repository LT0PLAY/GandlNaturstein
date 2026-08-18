'use client'

import { useActionState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import ImageUploader from '@/components/admin/ImageUploader'
import type { Restposten } from '@/lib/types'
import type { RestpostenActionState } from '@/lib/actions/restposten'
import { removeRestpostenImage } from '@/lib/actions/restposten'
import styles from '../form.module.css'

type Props = {
  action: (prev: RestpostenActionState, formData: FormData) => Promise<RestpostenActionState>
  item?: Restposten
}

const INITIAL: RestpostenActionState = { error: null, success: false, id: null }

export default function RestpostenForm({ action, item }: Props) {
  const [state, dispatch] = useActionState(action, INITIAL)
  const router = useRouter()

  useEffect(() => {
    if (state.success) router.push('/admin/restposten')
  }, [state.success, router])

  return (
    <form action={dispatch} className={styles.form}>

      <p className={styles.sectionLabel}>Angebot</p>
      <div className={styles.formGrid}>
        <div className={`${styles.field} ${styles.fullWidth}`}>
          <label>Titel *</label>
          <input name="title" type="text" required
            defaultValue={item?.title}
            placeholder="z. B. Restposten Terrassenplatten Jura Kalkstein" />
        </div>
        <div className={`${styles.field} ${styles.fullWidth}`}>
          <label>Beschreibung</label>
          <textarea name="description" rows={5}
            defaultValue={item?.description ?? ''}
            placeholder="Menge, Zustand, Maße, Abholung/Lieferung …" />
        </div>
        <div className={styles.field}>
          <label>Preis <span>(€, optional)</span></label>
          <input name="price" type="number" step="0.01" min="0"
            defaultValue={item?.price ?? ''}
            placeholder="z. B. 19.90" />
        </div>
        <div className={styles.field}>
          <label>Sortierung</label>
          <input name="sort_order" type="number" defaultValue={item?.sort_order ?? 0} />
        </div>
        <div className={`${styles.field} ${styles.fullWidth}`}>
          <label>Externer Link <span>(z. B. eBay-Anzeige, optional)</span></label>
          <input name="external_link" type="url"
            defaultValue={item?.external_link ?? ''}
            placeholder="https://www.ebay.de/…" />
        </div>
      </div>

      <p className={styles.sectionLabel}>Fotos</p>

      {item && (item.images ?? []).length > 0 && (
        <div className={styles.imageGrid}>
          <p className={styles.hint} style={{ marginBottom: '10px' }}>Aktuelle Fotos</p>
          <div className={styles.images}>
            {item.images.map((url) => (
              <div key={url} className={styles.imageWrapper}>
                <img src={url} alt="" className={styles.imagePreview} />
                <button
                  type="button"
                  className={styles.imageRemove}
                  onClick={() => { removeRestpostenImage(item.id, url) }}
                >✕</button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className={styles.formGrid}>
        <div className={`${styles.field} ${styles.fullWidth}`}>
          <label>Neue Fotos hinzufügen <span>(max. 8)</span></label>
          <ImageUploader field="images" multiple={true} max={8} label="Fotos hochladen" />
        </div>
      </div>

      <p className={styles.sectionLabel}>Sichtbarkeit</p>
      <div className={styles.formGrid}>
        <div className={styles.field}>
          <label>Status</label>
          <select name="is_active" defaultValue={item?.is_active === false ? 'false' : 'true'}>
            <option value="true">Aktiv (öffentlich sichtbar)</option>
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
          {item ? 'Speichern' : 'Restposten anlegen'}
        </button>
        <a href="/admin/restposten" className={styles.btnCancel}>Abbrechen</a>
      </div>
    </form>
  )
}
