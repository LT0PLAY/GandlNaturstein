export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { createSupabaseAdminClient } from '@/lib/supabase'
import { getCurrentUser } from '@/lib/actions/auth'
import MonitoringActions from './MonitoringActions'
import styles from './monitoring.module.css'

const SUPABASE_CONFIGURED =
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')

const ACTION_LABELS: Record<string, { label: string; color: string }> = {
  create: { label: 'Erstellt',   color: '#C4923A' },
  update: { label: 'Bearbeitet', color: '#C4923A' },
  delete: { label: 'Gelöscht',   color: '#E06060' },
}
const ENTITY_LABELS: Record<string, string> = {
  product:  'Produkt',
  category: 'Kategorie',
  inquiry:  'Anfrage',
  team:     'Mitarbeiter',
}

async function getLogs() {
  try {
    const { data } = await createSupabaseAdminClient()
      .from('change_log')
      .select(`
        *,
        team_member:team_members(name, email, role)
      `)
      .order('created_at', { ascending: false })
      .limit(200)
    // Fallback: changed_by_email Spalte existiert evtl. noch nicht

    return data ?? []
  } catch { return [] }
}

function timeAgo(dateStr: string) {
  const diff  = Date.now() - new Date(dateStr).getTime()
  const mins  = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days  = Math.floor(diff / 86400000)
  if (mins < 1)   return 'Gerade eben'
  if (mins < 60)  return `vor ${mins} Min.`
  if (hours < 24) return `vor ${hours} Std.`
  return `vor ${days} Tag${days > 1 ? 'en' : ''}`
}

export default async function MonitoringPage() {
  // Nur Admins dürfen diese Seite sehen
  if (SUPABASE_CONFIGURED) {
    const user = await getCurrentUser()
    if (user && (user.role as string) !== 'admin') redirect('/admin')
  }

  const logs = await getLogs()
  const exportDate = new Date().toLocaleDateString('de-DE', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })

  return (
    <div>
      <div className={styles.header}>
        <div>
          <p className={styles.label}>// Admin</p>
          <h1 className={styles.title}>Monitoring</h1>
        </div>
        <div className={styles.headerRight}>
          <div className={styles.liveIndicator}>
            <span className={styles.liveDot} />
            Live-Protokoll
          </div>
          <MonitoringActions />
        </div>
      </div>

      {/* Retentions-Info */}
      <div className={styles.retentionBar}>
        <span className={styles.retentionIcon}>🗓</span>
        <div className={styles.retentionText}>
          Einträge werden <strong>365 Tage</strong> aufbewahrt und danach automatisch bereinigt.
          {logs.length > 0 && (
            <> Aktuell{' '}
              <span className={styles.retentionBadge}>{logs.length} Einträge</span>
              {logs.length === 200 && <> · max. 200 werden angezeigt</>}
            </>
          )}
        </div>
      </div>

      {/* Print-Header (nur im Druck sichtbar) */}
      <div className={styles.printHeader}>
        <span className={styles.printHeaderTitle}>Gandl Natursteine — Monitoring-Protokoll</span>
        <span>Exportiert: {exportDate}</span>
      </div>

      {logs.length === 0 ? (
        <div className={styles.empty}>
          <p>Noch keine Aktivitäten aufgezeichnet.</p>
          <p style={{ fontSize: '11px', marginTop: '8px', color: 'var(--color-text-dim)' }}>
            Sobald Mitarbeiter Produkte oder Kategorien bearbeiten, erscheint es hier.
          </p>
        </div>
      ) : (
        <div className={styles.feed}>
          {logs.map((log: any) => {
            const action = ACTION_LABELS[log.action]      ?? { label: log.action, color: '#888' }
            const entity = ENTITY_LABELS[log.entity_type] ?? log.entity_type
            const member = log.team_member
            return (
              <div key={log.id} className={styles.entry}>

                {/* Zeitlinie */}
                <div className={styles.timeline}>
                  <div className={styles.dot} style={{ background: action.color }} />
                  <div className={styles.line} />
                </div>

                {/* Inhalt */}
                <div className={styles.entryContent}>

                  {/* Zeile 1: Wer hat was gemacht */}
                  <div className={styles.entryTop}>
                    {member ? (
                      <span className={styles.user}>
                        <span className={styles.userAvatar}>
                          {member.name?.[0]?.toUpperCase()}
                        </span>
                        <strong className={styles.userName}>{member.name}</strong>
                        <span className={styles.userRole}>{member.role}</span>
                      </span>
                    ) : log.changed_by_email ? (
                      <span className={styles.user}>
                        <span className={styles.userAvatar}>
                          {log.changed_by_email[0]?.toUpperCase()}
                        </span>
                        <strong className={styles.userName}>{log.changed_by_email}</strong>
                      </span>
                    ) : (
                      <span className={styles.user}>
                        <span className={styles.userAvatar}>?</span>
                        <strong className={styles.userName} style={{ color: 'var(--color-text-dim)' }}>Unbekannt</strong>
                      </span>
                    )}
                    <span className={styles.entryVerb}>hat</span>
                    <span
                      className={styles.actionBadge}
                      style={{
                        color: action.color,
                        borderColor: action.color + '33',
                        background: action.color + '12',
                      }}
                    >
                      {action.label.toLowerCase()}
                    </span>
                    <span className={styles.entityType}>{entity}</span>
                    {log.entity_name && (
                      <span className={styles.entityName}>„{log.entity_name}"</span>
                    )}
                  </div>

                  {/* Zeile 2: Zeitstempel */}
                  <div className={styles.entryMeta}>
                    <span className={styles.time}>{timeAgo(log.created_at)}</span>
                    <span className={styles.exactTime}>
                      {new Date(log.created_at).toLocaleString('de-DE')}
                    </span>
                  </div>

                  {/* Änderungsdetails (nur bei update) */}
                  {log.action === 'update' && log.old_value && log.new_value && (
                    <details className={styles.diff}>
                      <summary>Änderungen anzeigen</summary>
                      <div className={styles.diffGrid}>
                        {Object.keys(log.new_value).map((key) => {
                          const oldVal = JSON.stringify(log.old_value?.[key] ?? '')
                          const newVal = JSON.stringify(log.new_value?.[key] ?? '')
                          if (oldVal === newVal) return null
                          return (
                            <div key={key} className={styles.diffRow}>
                              <span className={styles.diffKey}>{key}</span>
                              <span className={styles.diffOld}>{oldVal}</span>
                              <span className={styles.diffArrow}>→</span>
                              <span className={styles.diffNew}>{newVal}</span>
                            </div>
                          )
                        })}
                      </div>
                    </details>
                  )}
                </div>

              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
