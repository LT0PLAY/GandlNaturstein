'use client'

import { useActionState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { updateTeamMember } from '@/lib/actions/team'
import type { TeamMember } from '@/lib/types'
import styles from '../../form.module.css'

const initial = { error: null as string | null, success: false }

export default function EditTeamMemberForm({ member }: { member: TeamMember }) {
  const updateTeamMemberById = updateTeamMember.bind(null, member.id)
  const [state, action, isPending] = useActionState(updateTeamMemberById, initial)
  const router = useRouter()

  useEffect(() => {
    if (state.success) router.push('/admin/team')
  }, [state.success, router])

  return (
    <form action={action} className={styles.form}>
      <div className={styles.formGrid}>
        <div className={styles.field}>
          <label>Name *</label>
          <input
            name="name"
            type="text"
            required
            defaultValue={member.name}
            placeholder="Max Mustermann"
          />
        </div>
        <div className={styles.field}>
          <label>Rolle *</label>
          <select name="role" required defaultValue={member.role}>
            <option value="editor">Editor — Produkte &amp; Kategorien bearbeiten</option>
            <option value="viewer">Viewer — Nur lesen</option>
            <option value="admin">Admin — Voller Zugriff</option>
          </select>
        </div>
        <div className={`${styles.field} ${styles.fullWidth}`}>
          <label>E-Mail</label>
          <input
            type="text"
            value={member.email}
            disabled
            style={{ opacity: 0.5, cursor: 'not-allowed' }}
          />
          <p className={styles.hint} style={{ marginTop: '4px' }}>
            E-Mail kann nicht geändert werden.
          </p>
        </div>
      </div>

      {state.error && (
        <p style={{ color: '#e2837c', fontFamily: 'var(--font-inter)', fontSize: '14px', marginBottom: '16px' }}>
          {state.error}
        </p>
      )}

      <div className={styles.formActions}>
        <button type="submit" className={styles.btnPrimary} disabled={isPending}>
          {isPending ? 'Wird gespeichert …' : 'Speichern'}
        </button>
        <a href="/admin/team" className={styles.btnCancel}>Abbrechen</a>
      </div>
    </form>
  )
}
