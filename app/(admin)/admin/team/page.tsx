export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { createSupabaseAdminClient } from '@/lib/supabase'
import { toggleTeamMember } from '@/lib/actions/team'
import DeleteButton from '@/components/admin/DeleteButton'
import type { TeamMember } from '@/lib/types'
import styles from '../table.module.css'

const ROLE_LABELS: Record<string, { label: string; desc: string }> = {
  admin:  { label: 'Admin',  desc: 'Voller Zugriff' },
  editor: { label: 'Editor', desc: 'Produkte & Kategorien' },
  viewer: { label: 'Viewer', desc: 'Nur lesen' },
}

async function getTeam(): Promise<TeamMember[]> {
  try {
    const { data } = await createSupabaseAdminClient()
      .from('team_members').select('*').order('created_at')
    return (data as TeamMember[]) ?? []
  } catch { return [] }
}

export default async function TeamPage() {
  const members = await getTeam()

  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <p className={styles.pageLabel}>// Admin</p>
          <h1 className={styles.pageTitle}>Team</h1>
        </div>
        <Link href="/admin/team/neu" className={styles.btnPrimary}>
          + Mitarbeiter einladen
        </Link>
      </div>

      <div className={styles.rolesGrid}>
        {Object.entries(ROLE_LABELS).map(([role, info]) => (
          <div key={role} className={styles.roleCard}>
            <span className={styles.badge} data-role={role}>{info.label}</span>
            <p className={styles.roleDesc}>{info.desc}</p>
          </div>
        ))}
      </div>

      {members.length === 0 ? (
        <div className={styles.empty}>
          <p>Noch keine Mitarbeiter.</p>
          <Link href="/admin/team/neu" className={styles.btnPrimary}>Ersten einladen</Link>
        </div>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Name</th>
              <th>E-Mail</th>
              <th>Rolle</th>
              <th>Status</th>
              <th>Aktionen</th>
            </tr>
          </thead>
          <tbody>
            {members.map((m) => (
              <tr key={m.id}>
                <td className={styles.tdName}>{m.name}</td>
                <td className={styles.tdMuted}>{m.email}</td>
                <td>
                  <span className={styles.badge} data-role={m.role}>
                    {ROLE_LABELS[m.role]?.label ?? m.role}
                  </span>
                </td>
                <td>
                  <span className={styles.badge} data-active={m.is_active}>
                    {m.is_active ? 'Aktiv' : 'Deaktiviert'}
                  </span>
                </td>
                <td className={styles.tdActions}>
                  <Link href={`/admin/team/${m.id}`} className={styles.btnEdit}>
                    Bearbeiten
                  </Link>
                  <DeleteButton
                    action={toggleTeamMember.bind(null, m.id, !m.is_active)}
                    label={m.is_active ? 'Deaktivieren' : 'Aktivieren'}
                    confirmMsg={m.is_active
                      ? `${m.name} wirklich deaktivieren?`
                      : `${m.name} wieder aktivieren?`}
                    className={m.is_active ? styles.btnDelete : styles.btnEdit}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
