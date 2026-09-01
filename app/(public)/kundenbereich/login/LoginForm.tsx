'use client'

import { useActionState } from 'react'
import { customerLogin } from '@/lib/actions/customerAccess'

const INITIAL = { error: null }

export default function LoginForm() {
  const [state, dispatch] = useActionState(customerLogin, INITIAL)

  return (
    <form action={dispatch} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div>
        <label style={{ display: 'block', fontSize: '13px', letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--color-text-dim)', marginBottom: '8px' }}>
          Benutzername
        </label>
        <input
          name="username" type="text" required autoFocus
          style={{
            width: '100%', height: '46px', padding: '0 14px',
            background: 'rgba(155,174,159,0.04)', border: '0.5px solid rgba(155,174,159,0.2)',
            color: '#efece4', fontFamily: 'var(--font-inter), sans-serif', fontSize: '15px',
          }}
        />
      </div>
      <div>
        <label style={{ display: 'block', fontSize: '13px', letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--color-text-dim)', marginBottom: '8px' }}>
          Passwort
        </label>
        <input
          name="password" type="password" required
          style={{
            width: '100%', height: '46px', padding: '0 14px',
            background: 'rgba(155,174,159,0.04)', border: '0.5px solid rgba(155,174,159,0.2)',
            color: '#efece4', fontFamily: 'var(--font-inter), sans-serif', fontSize: '15px',
          }}
        />
      </div>

      {state.error && (
        <p style={{ color: '#e07070', fontSize: '14px', fontFamily: 'var(--font-inter)' }}>
          ⚠ {state.error}
        </p>
      )}

      <button
        type="submit"
        style={{
          fontFamily: 'var(--font-inter)', fontSize: '15px', letterSpacing: '.04em',
          height: '48px', border: '0.5px solid rgba(155,174,159,0.4)',
          background: 'var(--color-gold)', color: '#141413', cursor: 'pointer', marginTop: '8px',
        }}
      >
        Anmelden →
      </button>
    </form>
  )
}
