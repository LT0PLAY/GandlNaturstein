'use client'

import { useActionState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import ImageUploader from '@/components/admin/ImageUploader'
import PdfUploader from '@/components/admin/PdfUploader'
import type { CustomerDocument } from '@/lib/types'
import type { DocumentActionState } from '@/lib/actions/customerAccess'
import styles from '../form.module.css'

type Props = {
  action: (prev: DocumentActionState, formData: FormData) => Promise<DocumentActionState>
  doc?: CustomerDocument
}

const INITIAL: DocumentActionState = { error: null, success: false, id: null }

export default function DocumentForm({ action, doc }: Props) {
  const [state, dispatch] = useActionState(action, INITIAL)
  const router = useRouter()

  useEffect(() => {
    if (state.success) router.push('/admin/btob')
  }, [state.success, router])

  return (
    <form action={dispatch} className={styles.form}>

      <p className={styles.sectionLabel}>Dokument</p>
      <div className={styles.formGrid}>
        <div className={`${styles.field} ${styles.fullWidth}`}>
          <label>Titel *</label>
          <input name="title" type="text" required
            defaultValue={doc?.title}
            placeholder="z. B. Preisliste 2026" />
        </div>
        <div className={`${styles.field} ${styles.fullWidth}`}>
          <label>Infotext <span>(kurze Beschreibung, für den Kunden sichtbar)</span></label>
          <textarea name="info_text" rows={4}
            defaultValue={doc?.info_text ?? ''}
            placeholder="Worum geht es in diesem Dokument?" />
        </div>
        <div className={styles.field}>
          <label>Sortierung</label>
          <input name="sort_order" type="number" defaultValue={doc?.sort_order ?? 0} />
        </div>
      </div>

      <p className={styles.sectionLabel}>Titelbild</p>
      <div className={styles.formGrid}>
        <div className={`${styles.field} ${styles.fullWidth}`}>
          <ImageUploader field="thumbnail" label={doc?.thumbnail ? 'Titelbild ersetzen' : 'Titelbild hochladen'} currentUrl={doc?.thumbnail ?? undefined} />
        </div>
      </div>

      <p className={styles.sectionLabel}>PDF</p>
      <div className={styles.formGrid}>
        <div className={`${styles.field} ${styles.fullWidth}`}>
          <label>PDF-Datei *</label>
          <PdfUploader field="pdf_url" currentUrl={doc?.pdf_url ?? undefined} />
        </div>
      </div>

      {state.error && (
        <p style={{ color: '#e07070', fontSize: '15px', marginBottom: '16px', fontFamily: 'var(--font-inter)' }}>
          ⚠ {state.error}
        </p>
      )}

      <div className={styles.formActions}>
        <button type="submit" className={styles.btnPrimary}>
          {doc ? 'Speichern' : 'Dokument anlegen'}
        </button>
        <a href="/admin/btob" className={styles.btnCancel}>Abbrechen</a>
      </div>
    </form>
  )
}
