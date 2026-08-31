import ImageUploader from '@/components/admin/ImageUploader'
import DeleteButton from '@/components/admin/DeleteButton'
import { savePageHero, removePageHero } from '@/lib/actions/pageHeroes'
import type { PageHeroKey } from '@/lib/types'
import styles from '@/app/(admin)/admin/form.module.css'

interface Props {
  pageKey:         PageHeroKey
  title:           string
  currentImageUrl: string | null
}

// Titelbild-Verwaltung für feste Seiten (Partner, Restposten, Ausstellungsguide,
// Karriere, Referenzen) — dieselbe Idee wie das Kategorie-Titelbild, hier als
// eigenständiger Baustein, der oben auf der jeweiligen Admin-Übersicht sitzt.
export default function PageHeroSettings({ pageKey, title, currentImageUrl }: Props) {
  async function handleSave(formData: FormData) {
    'use server'
    await savePageHero(pageKey, formData)
  }

  return (
    <div style={{
      border: '0.5px solid rgba(155, 174, 159, 0.15)',
      background: 'rgba(155, 174, 159, 0.02)',
      padding: '20px 22px',
      marginBottom: '28px',
    }}>
      <p style={{
        fontFamily: 'var(--font-inter), sans-serif', fontSize: '13px', letterSpacing: '.12em',
        textTransform: 'uppercase', color: 'var(--color-sage)', marginBottom: '14px',
      }}>
        Titelbild — {title} <span style={{ color: 'var(--color-text-dim)', textTransform: 'none', letterSpacing: 'normal' }}>
          (großes Bannerbild oben auf der Seite, optional)
        </span>
      </p>

      <form action={handleSave}>
        {currentImageUrl && (
          <div style={{ margin: '0 0 16px', display: 'flex', gap: '14px', alignItems: 'center', flexWrap: 'wrap' }}>
            <img
              src={currentImageUrl}
              alt={title}
              style={{ width: '160px', height: '90px', objectFit: 'cover', border: '0.5px solid rgba(155,174,159,0.15)' }}
            />
            <DeleteButton
              action={removePageHero.bind(null, pageKey)}
              label="Titelbild entfernen"
              confirmMsg="Titelbild wirklich entfernen?"
              className={styles.btnCancel}
            />
          </div>
        )}
        <ImageUploader
          field="image"
          label={currentImageUrl ? 'Titelbild ersetzen' : 'Titelbild hochladen'}
          hint="JPG, PNG, WebP · empfohlen 1600×500px"
        />
        <div className={styles.formActions} style={{ marginTop: '14px' }}>
          <button type="submit" className={styles.btnPrimary}>Titelbild speichern</button>
        </div>
      </form>
    </div>
  )
}
