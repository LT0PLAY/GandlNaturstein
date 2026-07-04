import { redirect } from 'next/navigation'
import { createTeamMember } from '@/lib/actions/team'
import styles from '../../form.module.css'

export default function NeuerMitarbeiterPage() {
  async function handleInvite(formData: FormData) {
    'use server'
    const result = await createTeamMember(formData)
    if (result.success) redirect('/admin/team')
  }

  return (
    <div>
      <div className={styles.pageHeader}>
        <p className={styles.pageLabel}>// Team</p>
        <h1 className={styles.pageTitle}>Mitarbeiter einladen</h1>
      </div>
      <p className={styles.hint} style={{ marginBottom: '28px' }}>
        Der Mitarbeiter erhält eine Einladungs-E-Mail und kann sich dann einloggen.
      </p>

      <form action={handleInvite} className={styles.form}>
        <div className={styles.formGrid}>
          <div className={styles.field}>
            <label>Name *</label>
            <input name="name" type="text" required placeholder="Max Mustermann" />
          </div>
          <div className={styles.field}>
            <label>E-Mail *</label>
            <input name="email" type="email" required placeholder="max@gandl-natursteine.de" />
          </div>
          <div className={styles.field}>
            <label>Rolle *</label>
            <select name="role" required>
              <option value="editor">Editor — Produkte & Kategorien bearbeiten</option>
              <option value="viewer">Viewer — Nur lesen</option>
              <option value="admin">Admin — Voller Zugriff</option>
            </select>
          </div>
        </div>
        <div className={styles.formActions}>
          <button type="submit" className={styles.btnPrimary}>Einladung senden</button>
          <a href="/admin/team" className={styles.btnCancel}>Abbrechen</a>
        </div>
      </form>
    </div>
  )
}
