'use client'

import { useState } from 'react'
import { requestPasswordReset } from '@/lib/actions/auth'
import styles from '../login.module.css'

export default function PasswortVergessenPage() {
  const [sent,    setSent]    = useState(false)
  const [error,   setError]   = useState('')
  const [loading, setLoading] = useState(false)

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
      setSent(true)
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
          <>
            <p className={styles.subtitle} style={{ color: '#7EC87E', marginBottom: '24px' }}>
              E-Mail verschickt! Prüfe deinen Posteingang und klicke auf den Link.
            </p>
            <a href="/admin/login" className={styles.btn} style={{ textDecoration: 'none', textAlign: 'center' }}>
              Zurück zum Login
            </a>
          </>
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
