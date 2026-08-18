'use client'

import { useState, useTransition } from 'react'
import { requestPasswordReset } from '@/lib/actions/auth'

export default function PasswordResetButton({ email }: { email: string }) {
  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null)

  function handleClick() {
    setMessage(null)
    startTransition(async () => {
      const result = await requestPasswordReset(email)
      if (result.error) setMessage({ text: result.error, ok: false })
      else setMessage({ text: 'Reset-E-Mail wurde verschickt.', ok: true })
    })
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending}
        style={{
          fontFamily: 'var(--font-inter)', fontSize: '13px',
          padding: '0 14px', height: '28px',
          border: '0.5px solid rgba(155, 174, 159,0.4)',
          background: 'transparent', color: 'var(--color-gold)',
          cursor: isPending ? 'default' : 'pointer', letterSpacing: '.04em',
          opacity: isPending ? 0.6 : 1,
        }}
      >
        {isPending ? 'Wird gesendet …' : 'Reset-Link senden'}
      </button>
      {message && (
        <p style={{
          marginTop: '10px', fontFamily: 'var(--font-inter)', fontSize: '13px',
          color: message.ok ? 'var(--color-sage)' : '#e2837c',
        }}>
          {message.text}
        </p>
      )}
    </div>
  )
}
