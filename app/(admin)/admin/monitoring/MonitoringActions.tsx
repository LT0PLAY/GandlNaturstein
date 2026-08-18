'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { purgeExpiredLogs } from '@/lib/actions/products'
import styles from './monitoring.module.css'

export default function MonitoringActions() {
  const [isPurging, startPurge] = useTransition()
  const [isRefreshing, startRefresh] = useTransition()
  const router = useRouter()

  function handlePrint() {
    window.print()
  }

  function handleRefresh() {
    startRefresh(() => {
      router.refresh()
    })
  }

  async function handlePurge() {
    if (!confirm('Abgelaufene Einträge (älter als 365 Tage) endgültig löschen?')) return
    startPurge(async () => {
      const result = await purgeExpiredLogs()
      if (result?.error) {
        alert(`Fehler: ${result.error}`)
      } else {
        alert(`${result?.count ?? 0} abgelaufene Einträge wurden gelöscht.`)
      }
    })
  }

  return (
    <div className={styles.actions}>
      <button onClick={handleRefresh} disabled={isRefreshing} className={styles.btnRefresh}>
        {isRefreshing ? '…' : '↻'} {isRefreshing ? 'Lädt…' : 'Neu laden'}
      </button>
      <button onClick={handlePrint} className={styles.btnPrint}>
        <span className={styles.btnPrintIcon}>⎙</span>
        Als PDF exportieren
      </button>
      <button onClick={handlePurge} disabled={isPurging} className={styles.btnPurge}>
        {isPurging ? '…' : '⊗'} {isPurging ? 'Bereinige…' : 'Abgelaufene löschen'}
      </button>
    </div>
  )
}
