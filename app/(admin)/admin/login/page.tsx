'use client'

import { useState } from 'react'
import { login } from '@/lib/actions/auth'
import styles from './login.module.css'

export default function LoginPage() {
  const [error,   setError]   = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const formData = new FormData(e.currentTarget)
    const result   = await login(formData)

    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>

        <div className={styles.logo}>
          <span className={styles.logoAccent}>G</span>andl
          <span className={styles.logoSub}>Admin</span>
        </div>

        <h1 className={styles.title}>Anmelden</h1>
        <p className={styles.subtitle}>Nur für autorisierte Mitarbeiter.</p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label htmlFor="email">E-Mail</label>
            <input
              id="email" name="email" type="email"
              required autoComplete="email"
              placeholder="admin@gandl-natursteine.de"
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="password">Passwort</label>
            <input
              id="password" name="password" type="password"
              required autoComplete="current-password"
              placeholder="••••••••"
            />
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <button type="submit" disabled={loading} className={styles.btn}>
            {loading ? 'Anmelden...' : 'Anmelden →'}
          </button>
        </form>

        <p className={styles.hint}>
          <a href="/admin/login/passwort-vergessen" style={{ color: 'var(--color-gold)', textDecoration: 'none' }}>
            Passwort vergessen?
          </a>
        </p>
        <p className={styles.hint} style={{ marginTop: '8px' }}>
          Kein Zugang? Wende dich an den Administrator.
        </p>
      </div>
    </div>
  )
}
