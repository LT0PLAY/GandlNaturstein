'use client'

import { useActionState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import ImageUploader from '@/components/admin/ImageUploader'
import PdfUploader from '@/components/admin/PdfUploader'
import type { Partner } from '@/lib/types'
import type { PartnerActionState } from '@/lib/actions/partners'
import styles from '../form.module.css'

type Props = {
  action: (prev: PartnerActionState, formData: FormData) => Promise<PartnerActionState>
  partner?: Partner
}

const INITIAL: PartnerActionState = { error: null, success: false, id: null }
const MAX_PDFS = 10

export default function PartnerForm({ action, partner }: Props) {
  const [state, dispatch] = useActionState(action, INITIAL)
  const router = useRouter()

  useEffect(() => {
    if (state.success) router.push('/admin/partner')
  }, [state.success, router])

  const pdfs = partner?.pdfs ?? []

  return (
    <form action={dispatch} className={styles.form}>

      <p className={styles.sectionLabel}>Partner</p>
      <div className={styles.formGrid}>
        <div className={`${styles.field} ${styles.fullWidth}`}>
          <label>Name *</label>
          <input name="name" type="text" required
            defaultValue={partner?.name}
            placeholder="z. B. Stadtwerke Fürstenfeldbruck" />
        </div>
        <div className={styles.field}>
          <label>Website <span>(optional)</span></label>
          <input name="website_url" type="text"
            defaultValue={partner?.website_url ?? ''}
            placeholder="z. B. www.stadtwerke-ffb.de" />
        </div>
        <div className={styles.field}>
          <label>Sortierung</label>
          <input name="sort_order" type="number" defaultValue={partner?.sort_order ?? 0} />
        </div>
      </div>

      <p className={styles.sectionLabel}>Logo</p>
      <div className={styles.formGrid}>
        <div className={`${styles.field} ${styles.fullWidth}`}>
          <ImageUploader field="logo_url" label="Partner-Logo" hint="Am besten transparentes PNG"
            currentUrl={partner?.logo_url ?? undefined} />
        </div>
      </div>

      <p className={styles.sectionLabel}>PDFs <span style={{ fontWeight: 400, color: 'var(--color-text-muted)' }}>(bis zu {MAX_PDFS})</span></p>
      <div className={styles.formGrid}>
        {Array.from({ length: MAX_PDFS }).map((_, i) => (
          <div key={i} className={`${styles.field} ${styles.fullWidth}`} style={{ borderBottom: '0.5px solid rgba(155,174,159,0.08)', paddingBottom: '16px', marginBottom: '4px' }}>
            <label>Dokument {i + 1}</label>
            <input
              name={`pdf_title_${i}`}
              type="text"
              placeholder="Titel (z. B. Zertifikat, Broschüre …)"
              defaultValue={pdfs[i]?.title ?? ''}
              style={{ marginBottom: '8px' }}
            />
            <PdfUploader field={`pdf_${i}`} currentUrl={pdfs[i]?.url} />
          </div>
        ))}
      </div>

      <p className={styles.sectionLabel}>Sichtbarkeit</p>
      <div className={styles.formGrid}>
        <div className={styles.field}>
          <label>Status</label>
          <select name="is_active" defaultValue={partner?.is_active === false ? 'false' : 'true'}>
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
          {partner ? 'Speichern' : 'Partner anlegen'}
        </button>
        <a href="/admin/partner" className={styles.btnCancel}>Abbrechen</a>
      </div>
    </form>
  )
}
