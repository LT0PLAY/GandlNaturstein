export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import { createSupabaseAdminClient } from '@/lib/supabase'
import type { TeamMember } from '@/lib/types'
import EditTeamMemberForm from './EditTeamMemberForm'
import PasswordResetButton from './PasswordResetButton'
import styles from '../../form.module.css'

async function getMember(id: string): Promise<TeamMember | null> {
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

  return (
    <div>
      <div className={styles.pageHeader}>
        <p className={styles.pageLabel}>// Team</p>
        <h1 className={styles.pageTitle}>Mitarbeiter bearbeiten</h1>
      </div>

      <EditTeamMemberForm member={member} />

      {/* Passwort-Reset */}
      <div style={{
        marginTop: '32px',
        padding: '20px 24px',
        border: '0.5px solid rgba(155, 174, 159,0.15)',
        borderRadius: '4px',
        background: 'rgba(155, 174, 159,0.03)',
      }}>
        <p style={{ fontFamily: 'var(--font-inter)', fontSize: '15px', color: 'var(--color-text-muted)', marginBottom: '12px' }}>
          <strong style={{ color: 'var(--color-text)' }}>Passwort zurücksetzen</strong><br />
          Erzeugt einen neuen Link zum Passwort-Setzen für <strong>{member.email}</strong>, den du
          persönlich weitergibst (kein automatischer Mailversand).
        </p>
        <PasswordResetButton memberId={member.id} />
      </div>
    </div>
  )
}
