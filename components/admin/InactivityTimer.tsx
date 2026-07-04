'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { logout } from '@/lib/actions/auth'

const TIMEOUT_MS  = 10 * 60 * 1000  // 10 Minuten
const WARNING_MS  =  1 * 60 * 1000  // Warnung bei 1 Minute Restzeit
const EVENTS      = ['mousedown', 'mousemove', 'keydown', 'touchstart', 'scroll', 'click']

export default function InactivityTimer() {
  const timerRef   = useRef<ReturnType<typeof setTimeout> | null>(null)
  const warnRef    = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [warning, setWarning] = useState(false)
  const [countdown, setCountdown] = useState(60)
  const countRef   = useRef<ReturnType<typeof setInterval> | null>(null)

  const clearAll = useCallback(() => {
    if (timerRef.current)  clearTimeout(timerRef.current)
    if (warnRef.current)   clearTimeout(warnRef.current)
    if (countRef.current)  clearInterval(countRef.current)
  }, [])

  const startTimer = useCallback(() => {
    clearAll()
    setWarning(false)
    setCountdown(60)

    // Warnung bei 9 Minuten
    warnRef.current = setTimeout(() => {
      setWarning(true)
      setCountdown(60)
      countRef.current = setInterval(() => {
        setCountdown((c) => {
          if (c <= 1) {
            if (countRef.current) clearInterval(countRef.current)
            return 0
          }
          return c - 1
        })
      }, 1000)
    }, TIMEOUT_MS - WARNING_MS)

    // Logout bei 10 Minuten
    timerRef.current = setTimeout(async () => {
      clearAll()
      await logout()
    }, TIMEOUT_MS)
  }, [clearAll])

  useEffect(() => {
    startTimer()
    EVENTS.forEach((e) => window.addEventListener(e, startTimer, { passive: true }))
    return () => {
      clearAll()
      EVENTS.forEach((e) => window.removeEventListener(e, startTimer))
    }
  }, [startTimer, clearAll])

  if (!warning) return null

  return (
    <div style={{
      position:   'fixed',
      bottom:     '24px',
      right:      '24px',
      zIndex:     9999,
      background: '#1a120a',
      border:     '0.5px solid rgba(224,96,96,0.4)',
      padding:    '16px 20px',
      maxWidth:   '280px',
      boxShadow:  '0 8px 32px rgba(0,0,0,0.4)',
    }}>
      <p style={{ fontFamily: 'var(--font-inter)', fontSize: '10px', letterSpacing: '.10em', textTransform: 'uppercase', color: '#E06060', margin: '0 0 6px' }}>
        ⚠ Sitzung läuft ab
      </p>
      <p style={{ fontFamily: 'var(--font-inter)', fontSize: '13px', color: '#F0EBE3', margin: '0 0 12px', lineHeight: 1.5 }}>
        Automatischer Logout in <strong>{countdown}</strong> Sekunden.
      </p>
      <button
        onClick={startTimer}
        style={{
          fontFamily:     'var(--font-bebas)',
          fontSize:       '13px',
          letterSpacing:  '.10em',
          color:          '#0A0806',
          background:     'var(--color-sage)',
          border:         'none',
          padding:        '8px 16px',
          cursor:         'pointer',
          width:          '100%',
        }}
      >
        Angemeldet bleiben
      </button>
    </div>
  )
}
