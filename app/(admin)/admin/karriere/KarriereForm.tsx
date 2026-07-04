'use client'

import { useActionState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import ImageUploader from '@/components/admin/ImageUploader'
import PdfUploader from '@/components/admin/PdfUploader'
import type { JobListing } from '@/lib/types'
import type { KarriereActionState } from '@/lib/actions/karriere'
import { removeJobImage } from '@/lib/actions/karriere'
import styles from '../form.module.css'

type Props = {
  action: (prev: KarriereActionState, formData: FormData) => Promise<KarriereActionState>
  job?: JobListing
}

const INITIAL: KarriereActionState = { error: null, success: false, id: null }

const EMPLOYMENT_TYPES = ['Vollzeit', 'Teilzeit', 'Minijob', 'Praktikum', 'Werkstudent', 'Ausbildung']

export default function KarriereForm({ action, job }: Props) {
  const [state, dispatch] = useActionState(action, INITIAL)
  const router = useRouter()

  useEffect(() => {
    if (state.success) router.push('/admin/karriere')
  }, [state.success, router])

  return (
    <form action={dispatch} className={styles.form}>

      {/* ── Basis ── */}
      <p className={styles.sectionLabel}>Stelle</p>
      <div className={styles.formGrid}>
        <div className={`${styles.field} ${styles.fullWidth}`}>
          <label>Titel *</label>
          <input name="title" type="text" required
            defaultValue={job?.title}
            placeholder="z. B. Steinmetz / Steinrestaurator (m/w/d)" />
        </div>
        <div className={styles.field}>
          <label>Abteilung / Bereich</label>
          <input name="department" type="text"
            defaultValue={job?.department ?? ''}
            placeholder="z. B. Produktion, Außendienst …" />
        </div>
        <div className={styles.field}>
          <label>Standort</label>
          <input name="location" type="text"
            defaultValue={job?.location ?? ''}
            placeholder="z. B. Inning am Ammersee" />
        </div>
        <div className={styles.field}>
          <label>Beschäftigungsart</label>
          <select name="employment_type" defaultValue={job?.employment_type ?? ''}>
            <option value="">— bitte wählen —</option>
            {EMPLOYMENT_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
        <div className={styles.field}>
          <label>Sortierung</label>
          <input name="sort_order" type="number" defaultValue={job?.sort_order ?? 0} />
        </div>
      </div>

      {/* ── Beschreibung ── */}
      <p className={styles.sectionLabel}>Inhalte</p>
      <div className={styles.formGrid}>
        <div className={`${styles.field} ${styles.fullWidth}`}>
          <label>Stellenbeschreibung</label>
          <textarea name="description" rows={6}
            defaultValue={job?.description ?? ''}
            placeholder="Was erwartet den Bewerber? Aufgaben, Arbeitsumfeld …" />
        </div>
        <div className={`${styles.field} ${styles.fullWidth}`}>
          <label>Anforderungen <span>(Was wird erwartet?)</span></label>
          <textarea name="requirements" rows={5}
            defaultValue={job?.requirements ?? ''}
            placeholder="Ausbildung, Erfahrung, Kenntnisse …" />
        </div>
        <div className={`${styles.field} ${styles.fullWidth}`}>
          <label>Benefits <span>(Was bieten wir?)</span></label>
          <textarea name="benefits" rows={4}
            defaultValue={job?.benefits ?? ''}
            placeholder="Faire Vergütung, Teamevents, Weiterbildung …" />
        </div>
      </div>

      {/* ── Links & Dateien ── */}
      <p className={styles.sectionLabel}>Links & Dateien</p>
      <div className={styles.formGrid}>
        <div className={`${styles.field} ${styles.fullWidth}`}>
          <label>PDF <span>(Stellenanzeige zum Download)</span></label>
          <PdfUploader field="pdf_url" currentUrl={job?.pdf_url ?? undefined} />
        </div>
        <div className={`${styles.field} ${styles.fullWidth}`}>
          <label>LinkedIn-URL <span>(Stellenausschreibung auf LinkedIn)</span></label>
          <input name="linkedin_url" type="url"
            defaultValue={job?.linkedin_url ?? ''}
            placeholder="https://www.linkedin.com/jobs/view/…" />
        </div>
      </div>

      {/* ── Fotos ── */}
      <p className={styles.sectionLabel}>Fotos</p>

      {/* Bestehende Bilder (Edit-Modus) */}
      {job && (job.images ?? []).length > 0 && (
        <div className={styles.imageGrid}>
          <p className={styles.hint} style={{ marginBottom: '10px' }}>Aktuelle Fotos</p>
          <div className={styles.images}>
            {job.images.map((url) => (
              <div key={url} className={styles.imageWrapper}>
                <img src={url} alt="" className={styles.imagePreview} />
                <form action={removeJobImage.bind(null, job.id, url)}>
                  <button type="submit" className={styles.imageRemove}>✕</button>
                </form>
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

      {/* ── Veröffentlichung ── */}
      <p className={styles.sectionLabel}>Sichtbarkeit</p>
      <div className={styles.formGrid}>
        <div className={styles.field}>
          <label>Status</label>
          <select name="is_published" defaultValue={job?.is_published ? 'true' : 'false'}>
            <option value="false">Entwurf (nicht sichtbar)</option>
            <option value="true">Veröffentlicht</option>
          </select>
        </div>
      </div>

      {state.error && (
        <p style={{ color: '#e07070', fontSize: '13px', marginBottom: '16px', fontFamily: 'var(--font-inter)' }}>
          ⚠ {state.error}
        </p>
      )}

      <div className={styles.formActions}>
        <button type="submit" className={styles.btnPrimary}>
          {job ? 'Speichern' : 'Stelle anlegen'}
        </button>
        <a href="/admin/karriere" className={styles.btnCancel}>Abbrechen</a>
      </div>
    </form>
  )
}
