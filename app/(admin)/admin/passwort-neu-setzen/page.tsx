'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { updatePassword } from '@/lib/actions/auth'
import { createSupabaseBrowserClient } from '@/lib/supabase'
import styles from '../login/login.module.css'

// Liest den "type"-Parameter aus dem Einladungs-/Reset-Link — Supabase hängt ihn
// je nach Auth-Flow entweder als Query-Parameter (?type=invite, PKCE-Flow) oder im
// URL-Fragment (#type=invite, impliziter Flow) an.
function readLinkType(): string | null {
  if (typeof window === 'undefined') return null
  const search = new URLSearchParams(window.location.search)
  if (search.get('type')) return search.get('type')
  const hash = new URLSearchParams(window.location.hash.replace(/^#/, ''))
  return hash.get('type')
}

export default function PasswortNeuSetzenPage() {
  const [checking, setChecking] = useState(true)
  const [linkValid, setLinkValid] = useState(false)
  const [isInvite, setIsInvite] = useState(false)
  const [error,   setError]   = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setIsInvite(readLinkType() === 'invite')
    const supabase = createSupabaseBrowserClient()

    async function establishSession() {
      // Falls im Browser bereits eine ANDERE Session bestand (z.B. weil man als
      // Admin eingeloggt war, als der Einladungs-/Reset-Link geöffnet wurde),
      // darf diese alte Session NICHT versehentlich übernommen werden. Deshalb
      // wird ein im URL-Fragment mitgelieferter Token (#access_token/#refresh_token
      // — der klassische Supabase-Verify-Redirect) IMMER explizit gesetzt, statt
      // einfach "die aktuelle Session" per getSession() abzufragen — das schließt
      // die Race Condition mit einer evtl. schon bestehenden fremden Session aus.
      const hash = new URLSearchParams(window.location.hash.replace(/^#/, ''))
      const access_token  = hash.get('access_token')
      const refresh_token = hash.get('refresh_token')

      if (access_token && refresh_token) {
        const { error } = await supabase.auth.setSession({ access_token, refresh_token })
        setLinkValid(!error)
        setChecking(false)
        return
      }

      // PKCE-Flow (?code=...): supabase-js tauscht den Code automatisch beim
      // ersten getSession()-Aufruf gegen eine neue Session ein.
      const { data } = await supabase.auth.getSession()
      setLinkValid(!!data.session)
      setChecking(false)
    }

    establishSession()
  }, [])

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
    const result = await updatePassword(pw1, isInvite)
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

        {checking ? (
          <>
            <h1 className={styles.title}>Einen Moment …</h1>
            <p className={styles.subtitle}>Link wird geprüft.</p>
          </>
        ) : !linkValid ? (
          <>
            <h1 className={styles.title}>Link ungültig</h1>
            <p className={styles.subtitle}>
              Dieser Link ist abgelaufen oder wurde bereits verwendet. Bitte fordere einen neuen
              Einladungs- bzw. Reset-Link an.
            </p>
            <a href="/admin/login" className={styles.btn} style={{ display: 'inline-block', textDecoration: 'none', textAlign: 'center' }}>
              Zurück zum Login
            </a>
          </>
        ) : (
          <>
            <h1 className={styles.title}>{isInvite ? 'Willkommen im Team' : 'Neues Passwort'}</h1>
            <p className={styles.subtitle}>
              {isInvite
                ? 'Lege dein persönliches Passwort fest, um deinen Zugang zu aktivieren (mind. 8 Zeichen).'
                : 'Wähle ein sicheres Passwort (mind. 8 Zeichen).'}
            </p>

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
          </>
        )}
      </div>
    </div>
  )
}
