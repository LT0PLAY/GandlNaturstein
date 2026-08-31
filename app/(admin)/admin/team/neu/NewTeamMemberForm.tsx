'use client'

import { useActionState, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createTeamMember } from '@/lib/actions/team'
import styles from '../../form.module.css'

const initial = {
  error: null as string | null,
  success: false,
  inviteLink: null as string | null | undefined,
  emailWarning: null as string | null | undefined,
}

export default function NewTeamMemberForm() {
  const [state, action, isPending] = useActionState(createTeamMember, initial)
  const router = useRouter()
  const [copied, setCopied] = useState(false)
  const linkInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // Nur automatisch weiterleiten, wenn die Einladung auch wirklich per Mail
    // rausgegangen ist. Ist kein E-Mail-Versand konfiguriert, bleibt die Seite
    // stehen, damit der Link zum manuellen Verschicken sichtbar ist.
    if (state.success && !state.inviteLink) router.push('/admin/team')
  }, [state.success, state.inviteLink, router])

  async function copyLink() {
    if (!state.inviteLink) return
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(state.inviteLink)
      } else {
        throw new Error('clipboard API nicht verfügbar')
      }
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback für Browser/Kontexte ohne Zwischenablage-Berechtigung (z.B. iframe,
      // kein https): Text im Feld markieren, damit man ihn per Hand kopieren kann.
      linkInputRef.current?.focus()
      linkInputRef.current?.select()
      try {
        document.execCommand('copy')
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } catch {
        // Auswahl steht zumindest bereit — der Nutzer kann Strg/Cmd+C selbst drücken.
      }
    }
  }

  if (state.success && state.inviteLink) {
    return (
      <div>
        <div style={{
          background: 'rgba(155,174,159,0.06)', border: '0.5px solid rgba(155,174,159,0.25)',
          padding: '20px 22px', marginBottom: '20px',
        }}>
          <p style={{ fontFamily: 'var(--font-inter)', fontSize: '15px', color: 'var(--color-text)', marginBottom: '8px' }}>
            ✓ Mitarbeiter wurde angelegt.
          </p>
          <p style={{ fontFamily: 'var(--font-inter)', fontSize: '14px', color: '#e2b87c', marginBottom: '14px' }}>
            Die Einladungs-E-Mail konnte nicht automatisch verschickt werden{state.emailWarning ? ` (${state.emailWarning})` : ''}.
            Bitte teile den folgenden Link manuell mit der Person — z.B. per WhatsApp oder E-Mail:
          </p>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
            <input
              ref={linkInputRef}
              readOnly
              value={state.inviteLink}
              onFocus={(e) => e.currentTarget.select()}
              style={{
                flex: '1 1 320px', minWidth: 0, background: '#141413',
                border: '0.5px solid rgba(155,174,159,0.2)', padding: '10px 12px',
                color: '#dcdcd6', fontFamily: 'var(--font-inter)', fontSize: '13px',
              }}
            />
            <button type="button" onClick={copyLink} className={styles.btnPrimary}>
              {copied ? 'Kopiert ✓' : 'Link kopieren'}
            </button>
          </div>
        </div>
        <a href="/admin/team" className={styles.btnCancel}>← Zurück zur Team-Übersicht</a>
      </div>
    )
  }

  return (
    <form action={action} className={styles.form}>
      <div className={styles.formGrid}>
        <div className={styles.field}>
          <label>Name *</label>
          <input name="name" type="text" required placeholder="Max Mustermann" />
        </div>
        <div className={styles.field}>
          <label>E-Mail *</label>
          <input name="email" type="email" required placeholder="max@gandl-natursteine.de" />
        </div>
        <div className={`${styles.field} ${styles.fullWidth}`}>
          <label>Rolle *</label>
          <select name="role" required defaultValue="editor">
            <option value="editor">Editor — Produkte &amp; Kategorien bearbeiten</option>
            <option value="viewer">Viewer — Nur lesen</option>
            <option value="admin">Admin — Voller Zugriff</option>
          </select>
        </div>
      </div>

      {state.error && (
        <p style={{ color: '#e2837c', fontFamily: 'var(--font-inter)', fontSize: '14px', marginBottom: '16px' }}>
          {state.error}
        </p>
      )}

      <div className={styles.formActions}>
        <button type="submit" className={styles.btnPrimary} disabled={isPending}>
          {isPending ? 'Wird gesendet …' : 'Einladung senden'}
        </button>
        <a href="/admin/team" className={styles.btnCancel}>Abbrechen</a>
      </div>
    </form>
  )
}
