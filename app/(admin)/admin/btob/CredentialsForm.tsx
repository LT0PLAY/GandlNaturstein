'use client'

import { useActionState } from 'react'
import { setCustomerCredentials } from '@/lib/actions/customerAccess'
import styles from '../form.module.css'

const INITIAL = { error: null, success: false }

export default function CredentialsForm({ currentUsername, isNew }: { currentUsername: string; isNew: boolean }) {
  const [state, dispatch] = useActionState(setCustomerCredentials, INITIAL)

  return (
    <form action={dispatch}>
      <div className={styles.field} style={{ marginBottom: '14px' }}>
        <label>Benutzername</label>
        <input name="username" type="text" required defaultValue={currentUsername} placeholder="z. B. firma-mueller" />
      </div>
      <div className={styles.field} style={{ marginBottom: '14px' }}>
        <label>{isNew ? 'Passwort' : 'Neues Passwort'} <span>{isNew ? '(Pflicht)' : '(leer lassen = unverändert)'}</span></label>
        <input name="password" type="text" placeholder={isNew ? 'Passwort vergeben' : '••••••••'} minLength={6} />
      </div>

      {state.error && (
        <p style={{ color: '#e07070', fontSize: '14px', marginBottom: '14px', fontFamily: 'var(--font-inter)' }}>
          ⚠ {state.error}
        </p>
      )}
      {state.success && (
        <p style={{ color: 'var(--color-sage)', fontSize: '14px', marginBottom: '14px', fontFamily: 'var(--font-inter)' }}>
          ✓ Gespeichert.
        </p>
      )}

      <button type="submit" className={styles.btnPrimary}>
        {isNew ? 'Zugang anlegen' : 'Speichern'}
      </button>
    </form>
  )
}
