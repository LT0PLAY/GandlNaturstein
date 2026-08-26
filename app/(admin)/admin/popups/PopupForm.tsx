'use client'

import { useActionState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import ImageUploader from '@/components/admin/ImageUploader'
import type { Popup } from '@/lib/types'
import type { PopupActionState } from '@/lib/actions/popups'
import styles from '../form.module.css'

type Props = {
  action: (prev: PopupActionState, formData: FormData) => Promise<PopupActionState>
  popup?: Popup
}

const INITIAL: PopupActionState = { error: null, success: false, id: null }

// datetime-local erwartet "YYYY-MM-DDTHH:mm" in Lokalzeit, ohne Sekunden/Zeitzone.
function toLocalInputValue(iso: string | null): string {
  if (!iso) return ''
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export default function PopupForm({ action, popup }: Props) {
  const [state, dispatch] = useActionState(action, INITIAL)
  const router = useRouter()

  useEffect(() => {
    if (state.success) router.push('/admin/popups')
  }, [state.success, router])

  return (
    <form action={dispatch} className={styles.form}>

      <p className={styles.sectionLabel}>Popup</p>
      <div className={styles.formGrid}>
        <div className={`${styles.field} ${styles.fullWidth}`}>
          <label>Name <span>— interne Bezeichnung, z. B. „Sommerurlaub“ (dient auch als Überschrift im Popup)</span></label>
          <input name="title" type="text" required
            defaultValue={popup?.title}
            placeholder="z. B. Sommerurlaub, Öffnungszeiten Feiertage …" />
        </div>
        <div className={`${styles.field} ${styles.fullWidth}`}>
          <label>Info-Text</label>
          <textarea
            name="message"
            rows={4}
            defaultValue={popup?.message ?? ''}
            placeholder="Kurzer Infotext, der Besuchern im Popup angezeigt wird…"
          />
        </div>
      </div>

      <p className={styles.sectionLabel}>Bild <span style={{ fontWeight: 400, color: 'var(--color-text-muted)' }}>(optional)</span></p>
      <div className={styles.formGrid}>
        <div className={`${styles.field} ${styles.fullWidth}`}>
          <ImageUploader
            field="image"
            label="Popup-Bild"
            hint="JPG, PNG, WebP · optional"
            currentUrl={popup?.image_url ?? undefined}
          />
        </div>
      </div>

      <p className={styles.sectionLabel}>Sichtbarkeit</p>
      <div className={styles.formGrid}>
        <div className={styles.field}>
          <label>Status</label>
          <select name="is_active" defaultValue={popup?.is_active ? 'true' : 'false'}>
            <option value="false">Inaktiv (nur gespeichert)</option>
            <option value="true">Aktiv (auf der Website sichtbar)</option>
          </select>
          <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
            Es kann immer nur ein Popup gleichzeitig aktiv sein — ein zuvor aktives Popup wird beim
            Aktivieren automatisch deaktiviert (bleibt aber gespeichert und kann später erneut aktiviert werden).
          </p>
        </div>
        <div className={styles.field}>
          <label>Automatisch deaktivieren am <span>(optional)</span></label>
          <input name="active_until" type="datetime-local" defaultValue={toLocalInputValue(popup?.active_until ?? null)} />
          <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
            Ab diesem Zeitpunkt verschwindet das Popup automatisch von der Website (Status wechselt auf „Inaktiv“).
          </p>
        </div>
      </div>

      {state.error && (
        <p style={{ color: '#e07070', fontSize: '15px', marginBottom: '16px', fontFamily: 'var(--font-inter)' }}>
          ⚠ {state.error}
        </p>
      )}

      <div className={styles.formActions}>
        <button type="submit" className={styles.btnPrimary}>
          {popup ? 'Speichern' : 'Popup anlegen'}
        </button>
        <a href="/admin/popups" className={styles.btnCancel}>Abbrechen</a>
      </div>
    </form>
  )
}
