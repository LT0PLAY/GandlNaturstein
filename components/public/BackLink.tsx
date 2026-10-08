'use client'

import { useRouter } from 'next/navigation'
import { NAV_COUNT_KEY } from './NavTracker'

// Echter Schritt zurück im Browserverlauf (Scrollposition/Filter der Liste
// bleiben erhalten). Nur wenn man direkt hier gelandet ist (kein vorheriger
// Seitenaufruf dieser Website), führt der Link zur angegebenen Übersicht.
export default function BackLink({
  href, className, children = '← Zurück',
}: { href: string; className?: string; children?: React.ReactNode }) {
  const router = useRouter()
  return (
    <a
      href={href}
      className={className}
      onClick={(e) => {
        let visited = 0
        try { visited = Number(sessionStorage.getItem(NAV_COUNT_KEY) ?? '0') || 0 } catch { /* ignorieren */ }
        if (visited >= 2 && window.history.length > 1) {
          e.preventDefault()
          router.back()
        }
      }}
    >
      {children}
    </a>
  )
}
