import { notFound, redirect } from 'next/navigation'
import { createSupabaseAdminClient } from '@/lib/supabase'
import { updateTeamMember } from '@/lib/actions/team'
import { requestPasswordReset } from '@/lib/actions/auth'
import styles from '../../form.module.css'

async function getMember(id: string) {
  const { data } = await createSupabaseAdminClient()
    .from('team_members').select('*').eq('id', id).single()
  return data
}

export default async function TeamMemberEditPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const member = await getMember(id)
  if (!member) notFound()

  async function handleUpdate(formData: FormData) {
    'use server'
    const result = await updateTeamMember(id, formData)
    if (!result.error) redirect('/admin/team')
  }

  async function handlePasswordReset() {
    'use server'
    await requestPasswordReset(member.email)
  }

  return (
    <div>
      <div className={styles.pageHeader}>
        <p className={styles.pageLabel}>// Team</p>
        <h1 className={styles.pageTitle}>Mitarbeiter bearbeiten</h1>
      </div>

      <form action={handleUpdate} className={styles.form}>
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
          <div className={styles.field}>
            <label>Rolle *</label>
            <select name="role" required defaultValue={member.role}>
              <option value="editor">Editor — Produkte &amp; Kategorien bearbeiten</option>
              <option value="viewer">Viewer — Nur lesen</option>
              <option value="admin">Admin — Voller Zugriff</option>
            </select>
          </div>
        </div>

        <div className={styles.formActions}>
          <button type="submit" className={styles.btnPrimary}>Speichern</button>
          <a href="/admin/team" className={styles.btnCancel}>Abbrechen</a>
        </div>
      </form>

      {/* Passwort-Reset */}
      <div style={{
        marginTop: '32px',
        padding: '20px 24px',
        border: '0.5px solid rgba(196,146,58,0.15)',
        borderRadius: '4px',
        background: 'rgba(196,146,58,0.03)',
      }}>
        <p style={{ fontFamily: 'var(--font-inter)', fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '12px' }}>
          <strong style={{ color: 'var(--color-text)' }}>Passwort zurücksetzen</strong><br />
          Schickt eine Reset-E-Mail an <strong>{member.email}</strong>.
        </p>
        <form action={handlePasswordReset}>
          <button type="submit" style={{
            fontFamily: 'var(--font-inter)', fontSize: '11px',
            padding: '0 14px', height: '28px',
            border: '0.5px solid rgba(196,146,58,0.4)',
            background: 'transparent', color: 'var(--color-gold)',
            cursor: 'pointer', letterSpacing: '.04em',
          }}>
            Reset-Link senden
          </button>
        </form>
      </div>
    </div>
  )
}
