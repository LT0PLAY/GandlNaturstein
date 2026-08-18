'use client'

import { useActionState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createTeamMember } from '@/lib/actions/team'
import styles from '../../form.module.css'

const initial = { error: null as string | null, success: false }

export default function NewTeamMemberForm() {
  const [state, action, isPending] = useActionState(createTeamMember, initial)
  const router = useRouter()

  useEffect(() => {
    if (state.success) router.push('/admin/team')
  }, [state.success, router])

  return (
    <form action={action} className={styles.form}>
      <div className={styles.formGrid}>
        <div className={styles.field}>
          <label>Name *</label>
          <input name="name" type="text" required placeholder="Max Mustermann" />
        </div>
        <div className={styles.field}>
          <label>E-Mail *</label>
          <input name="email" type="email" required placeholder="max@gandl-natursteine.de" />
        </div>
        <div className={`${styles.field} ${styles.fullWidth}`}>
          <label>Rolle *</label>
          <select name="role" required defaultValue="editor">
            <option value="editor">Editor — Produkte &amp; Kategorien bearbeiten</option>
            <option value="viewer">Viewer — Nur lesen</option>
            <option value="admin">Admin — Voller Zugriff</option>
          </select>
        </div>
      </div>

      {state.error && (
        <p style={{ color: '#e2837c', fontFamily: 'var(--font-inter)', fontSize: '14px', marginBottom: '16px' }}>
          {state.error}
        </p>
      )}

      <div className={styles.formActions}>
        <button type="submit" className={styles.btnPrimary} disabled={isPending}>
          {isPending ? 'Wird gesendet …' : 'Einladung senden'}
        </button>
        <a href="/admin/team" className={styles.btnCancel}>Abbrechen</a>
      </div>
    </form>
  )
}
