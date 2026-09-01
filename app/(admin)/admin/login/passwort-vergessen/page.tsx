'use client'

import { useRef, useState } from 'react'
import { requestPasswordReset } from '@/lib/actions/auth'
import styles from '../login.module.css'

export default function PasswortVergessenPage() {
  const [sent,      setSent]      = useState(false)
  const [resetLink, setResetLink] = useState<string | null>(null)
  const [copied,    setCopied]    = useState(false)
  const [error,     setError]     = useState('')
  const [loading,   setLoading]   = useState(false)
  const linkInputRef = useRef<HTMLInputElement>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const email = new FormData(e.currentTarget).get('email') as string
    const result = await requestPasswordReset(email)
    if (result.error) {
      setError(result.error)
      setLoading(false)
    } else {
      setResetLink(result.resetLink ?? null)
      setSent(true)
    }
  }

  async function copyLink() {
    if (!resetLink) return
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(resetLink)
      } else {
        throw new Error('clipboard API nicht verfügbar')
      }
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      linkInputRef.current?.focus()
      linkInputRef.current?.select()
      try {
        document.execCommand('copy')
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } catch {}
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logo}>
          <span className={styles.logoAccent}>G</span>andl
          <span className={styles.logoSub}>Admin</span>
        </div>

        <h1 className={styles.title}>Passwort zurücksetzen</h1>

        {sent ? (
          resetLink ? (
            <>
              <p className={styles.subtitle} style={{ color: '#E0B84D', marginBottom: '16px' }}>
                Automatischer Mailversand aktuell nicht verfügbar — hier ist dein Reset-Link
                zum manuellen Öffnen (nur einmal gültig, zeitnah verwenden):
              </p>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                <input
                  ref={linkInputRef}
                  readOnly
                  value={resetLink}
                  onFocus={(e) => e.currentTarget.select()}
                  style={{
                    flex: 1, padding: '10px 12px', fontSize: '13px',
                    background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.15)',
                    borderRadius: '6px', color: '#dcdcd6',
                  }}
                />
                <button type="button" onClick={copyLink} className={styles.btn} style={{ whiteSpace: 'nowrap' }}>
                  {copied ? 'Kopiert ✓' : 'Kopieren'}
                </button>
              </div>
              <a href="/admin/login" className={styles.btn} style={{ textDecoration: 'none', textAlign: 'center' }}>
                Zurück zum Login
              </a>
            </>
          ) : (
            <>
              <p className={styles.subtitle} style={{ color: '#7EC87E', marginBottom: '24px' }}>
                Falls diese E-Mail-Adresse bei uns hinterlegt ist, wurde ein Reset-Link
                verschickt. Prüfe deinen Posteingang.
              </p>
              <a href="/admin/login" className={styles.btn} style={{ textDecoration: 'none', textAlign: 'center' }}>
                Zurück zum Login
              </a>
            </>
          )
        ) : (
          <>
            <p className={styles.subtitle}>
              Gib deine E-Mail-Adresse ein — wir schicken dir einen Reset-Link.
            </p>
            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.field}>
                <label htmlFor="email">E-Mail</label>
                <input
                  id="email" name="email" type="email"
                  required autoComplete="email"
                  placeholder="deine@email.de"
                />
              </div>
              {error && <p className={styles.error}>{error}</p>}
              <button type="submit" disabled={loading} className={styles.btn}>
                {loading ? 'Wird gesendet...' : 'Reset-Link senden →'}
              </button>
            </form>
            <p className={styles.hint} style={{ marginTop: '16px' }}>
              <a href="/admin/login" style={{ color: 'var(--color-gold)', textDecoration: 'none' }}>
                ← Zurück zum Login
              </a>
            </p>
          </>
        )}
      </div>
    </div>
  )
}
