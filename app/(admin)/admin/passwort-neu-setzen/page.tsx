'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updatePassword } from '@/lib/actions/auth'
import styles from '../login/login.module.css'

export default function PasswortNeuSetzenPage() {
  const [error,   setError]   = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    const fd = new FormData(e.currentTarget)
    const pw1 = fd.get('password')  as string
    const pw2 = fd.get('password2') as string

    if (pw1 !== pw2) {
      setError('Passwörter stimmen nicht überein.')
      return
    }
    if (pw1.length < 8) {
      setError('Passwort muss mindestens 8 Zeichen lang sein.')
      return
    }

    setLoading(true)
    const result = await updatePassword(pw1)
    if (result.error) {
      setError(result.error)
      setLoading(false)
    } else {
      router.push('/admin')
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logo}>
          <span className={styles.logoAccent}>G</span>andl
          <span className={styles.logoSub}>Admin</span>
        </div>

        <h1 className={styles.title}>Neues Passwort</h1>
        <p className={styles.subtitle}>Wähle ein sicheres Passwort (mind. 8 Zeichen).</p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label htmlFor="password">Neues Passwort</label>
            <input
              id="password" name="password" type="password"
              required minLength={8} autoComplete="new-password"
              placeholder="••••••••"
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="password2">Passwort wiederholen</label>
            <input
              id="password2" name="password2" type="password"
              required minLength={8} autoComplete="new-password"
              placeholder="••••••••"
            />
          </div>
          {error && <p className={styles.error}>{error}</p>}
          <button type="submit" disabled={loading} className={styles.btn}>
            {loading ? 'Wird gespeichert...' : 'Passwort speichern →'}
          </button>
        </form>
      </div>
    </div>
  )
}
