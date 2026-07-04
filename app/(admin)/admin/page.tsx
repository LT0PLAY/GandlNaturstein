import Link from 'next/link'
import { createSupabaseAdminClient } from '@/lib/supabase'
import styles from './dashboard.module.css'

async function getStats() {
  try {
    const supabase = createSupabaseAdminClient()

    const [
      prodResult,
      catResult,
      inquiriesNew,
      inquiriesTotal,
      refsResult,
      jobsResult,
      trashProds,
      trashRefs,
      recentLog,
    ] = await Promise.all([
      supabase.from('products').select('*', { count: 'exact', head: true }).is('deleted_at', null).eq('is_active', true),
      supabase.from('categories').select('*', { count: 'exact', head: true }),
      supabase.from('inquiries').select('*', { count: 'exact', head: true }).eq('status', 'new'),
      supabase.from('inquiries').select('*', { count: 'exact', head: true }),
      supabase.from('project_references').select('*', { count: 'exact', head: true }).is('deleted_at', null),
      supabase.from('job_listings').select('*', { count: 'exact', head: true }).is('deleted_at', null).eq('is_published', true),
      supabase.from('products').select('*', { count: 'exact', head: true }).not('deleted_at', 'is', null),
      supabase.from('project_references').select('*', { count: 'exact', head: true }).not('deleted_at', 'is', null),
      supabase.from('change_log')
        .select('action, entity_type, entity_name, created_at, changed_by')
        .order('created_at', { ascending: false })
        .limit(8),
    ])

    return {
      products:       prodResult.count   ?? 0,
      categories:     catResult.count    ?? 0,
      inquiriesNew:   inquiriesNew.count  ?? 0,
      inquiriesTotal: inquiriesTotal.count ?? 0,
      references:     refsResult.count   ?? 0,
      jobs:           jobsResult.count   ?? 0,
      trash:          (trashProds.count ?? 0) + (trashRefs.count ?? 0),
      recentLog:      recentLog.data     ?? [],
    }
  } catch {
    return { products: 0, categories: 0, inquiriesNew: 0, inquiriesTotal: 0, references: 0, jobs: 0, trash: 0, recentLog: [] }
  }
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1)  return 'gerade eben'
  if (m < 60) return `vor ${m} Min.`
  const h = Math.floor(m / 60)
  if (h < 24) return `vor ${h} Std.`
  const d = Math.floor(h / 24)
  if (d < 7)  return `vor ${d} Tag${d > 1 ? 'en' : ''}`
  return `vor ${Math.floor(d / 7)} Woche${Math.floor(d / 7) > 1 ? 'n' : ''}`
}

const actionLabel: Record<string, string> = {
  create: 'Erstellt',
  update: 'Bearbeitet',
  delete: 'Gelöscht',
}

const entityLabel: Record<string, string> = {
  product:   'Produkt',
  category:  'Kategorie',
  reference: 'Referenz',
  job:       'Stelle',
  inquiry:   'Anfrage',
  team:      'Team',
}

export default async function AdminDashboard() {
  const stats = await getStats()

  return (
    <div>
      <div className={styles.pageHeader}>
        <p className={styles.pageLabel}>// Admin</p>
        <h1 className={styles.pageTitle}>Dashboard</h1>
      </div>

      {/* Alerts */}
      {stats.inquiriesNew > 0 && (
        <Link href="/admin/anfragen" className={styles.alertBanner}>
          <span>✉</span>
          <span>
            {stats.inquiriesNew} neue{stats.inquiriesNew > 1 ? ' Anfragen' : ' Anfrage'} warten auf Bearbeitung
          </span>
          <span>→</span>
        </Link>
      )}
      {stats.trash > 0 && (
        <Link href="/admin/papierkorb" className={`${styles.alertBanner} ${styles.alertSoft}`}>
          <span>🗑</span>
          <span>{stats.trash} {stats.trash === 1 ? 'Element' : 'Elemente'} im Papierkorb</span>
          <span>→</span>
        </Link>
      )}

      {/* Stats */}
      <div className={styles.statsGrid}>
        <Link href="/admin/produkte" className={styles.statCard}>
          <p className={styles.statValue}>{stats.products}</p>
          <p className={styles.statLabel}>Aktive Produkte</p>
        </Link>
        <Link href="/admin/referenzen" className={styles.statCard}>
          <p className={styles.statValue}>{stats.references}</p>
          <p className={styles.statLabel}>Referenzen</p>
        </Link>
        <Link href="/admin/anfragen" className={`${styles.statCard} ${stats.inquiriesNew > 0 ? styles.statCardHighlight : ''}`}>
          <p className={styles.statValue}>{stats.inquiriesNew}</p>
          <p className={styles.statLabel}>Neue Anfragen</p>
          {stats.inquiriesTotal > 0 && (
            <p className={styles.statSub}>{stats.inquiriesTotal} gesamt</p>
          )}
        </Link>
        <Link href="/admin/karriere" className={styles.statCard}>
          <p className={styles.statValue}>{stats.jobs}</p>
          <p className={styles.statLabel}>Offene Stellen</p>
        </Link>
        <Link href="/admin/kategorien" className={styles.statCard}>
          <p className={styles.statValue}>{stats.categories}</p>
          <p className={styles.statLabel}>Kategorien</p>
        </Link>
        <Link href="/admin/papierkorb" className={styles.statCard}>
          <p className={styles.statValue}>{stats.trash}</p>
          <p className={styles.statLabel}>Im Papierkorb</p>
        </Link>
      </div>

      {/* Schnellzugriff */}
      <p className={styles.sectionLabel}>Schnellzugriff</p>
      <div className={styles.quickGrid}>
        {[
          { label: 'Neues Produkt',     href: '/admin/produkte/neu',    desc: 'Produkt anlegen & Bilder hochladen' },
          { label: 'Neue Referenz',     href: '/admin/referenzen/neu',  desc: 'Projektdokumentation erstellen' },
          { label: 'Neue Stelle',       href: '/admin/karriere/neu',    desc: 'Stellenanzeige veröffentlichen' },
          { label: 'Anfragen',          href: '/admin/anfragen',        desc: 'Kundenwünsche bearbeiten' },
          { label: 'Neue Kategorie',    href: '/admin/kategorien/neu',  desc: 'Außen, Innen oder Sonder' },
          { label: 'Team verwalten',    href: '/admin/team',            desc: 'Mitarbeiter & Rollen' },
        ].map((item) => (
          <Link key={item.href} href={item.href} className={styles.quickCard}>
            <p className={styles.quickTitle}>{item.label}</p>
            <p className={styles.quickDesc}>{item.desc}</p>
            <span className={styles.quickArrow}>→</span>
          </Link>
        ))}
      </div>

      {/* Letzte Aktivitäten */}
      {stats.recentLog.length > 0 && (
        <>
          <div className={styles.sectionRow}>
            <p className={styles.sectionLabel}>Letzte Aktivitäten</p>
            <Link href="/admin/monitoring" className={styles.sectionLink}>Alle ansehen →</Link>
          </div>
          <div className={styles.logList}>
            {stats.recentLog.map((entry: any, i: number) => (
              <div key={i} className={styles.logItem}>
                <span className={`${styles.logAction} ${styles[`logAction_${entry.action}`]}`}>
                  {actionLabel[entry.action] ?? entry.action}
                </span>
                <span className={styles.logEntity}>
                  {entityLabel[entry.entity_type] ?? entry.entity_type}
                </span>
                <span className={styles.logName}>{entry.entity_name ?? '—'}</span>
                <span className={styles.logTime}>{timeAgo(entry.created_at)}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
