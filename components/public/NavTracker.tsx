'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

// Zählt die Seitenaufrufe innerhalb der Website pro Tab. Der Zurück-Link auf
// Produktseiten nutzt das, um zu erkennen, ob es eine vorherige Seite dieser
// Website gibt (dann echter Schritt zurück) oder ob man direkt gelandet ist.
export const NAV_COUNT_KEY = 'gandl-nav-count'

export default function NavTracker() {
  const pathname = usePathname()
  useEffect(() => {
    try {
      const n = Number(sessionStorage.getItem(NAV_COUNT_KEY) ?? '0') || 0
      sessionStorage.setItem(NAV_COUNT_KEY, String(n + 1))
    } catch { /* sessionStorage nicht verfügbar */ }
  }, [pathname])
  return null
}
