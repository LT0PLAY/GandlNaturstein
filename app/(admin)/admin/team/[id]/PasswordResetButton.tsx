'use client'

import { useRef, useState, useTransition } from 'react'
import { generateNewPasswordLink } from '@/lib/actions/team'

export default function PasswordResetButton({ memberId }: { memberId: string }) {
  const [isPending, startTransition] = useTransition()
  const [link,   setLink]   = useState<string | null>(null)
  const [error,  setError]  = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const linkInputRef = useRef<HTMLInputElement>(null)

  function handleClick() {
    setError(null)
    startTransition(async () => {
      const result = await generateNewPasswordLink(memberId)
      if (result.error) setError(result.error)
      else setLink(result.inviteLink ?? null)
    })
  }

  async function copyLink() {
    if (!link) return
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(link)
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

  if (link) {
    return (
      <div>
        <p style={{ fontFamily: 'var(--font-inter)', fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '10px' }}>
          Sende diesen Link persönlich an den Mitarbeiter (z.B. per WhatsApp) — nur einmal gültig, zeitnah verwenden:
        </p>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            ref={linkInputRef}
            readOnly
            value={link}
            onFocus={(e) => e.currentTarget.select()}
            style={{
              flex: '1 1 320px', minWidth: 0, background: '#141413',
              border: '0.5px solid rgba(155,174,159,0.2)', padding: '10px 12px',
              color: '#dcdcd6', fontFamily: 'var(--font-inter)', fontSize: '13px',
            }}
          />
          <button
            type="button"
            onClick={copyLink}
            style={{
              fontFamily: 'var(--font-inter)', fontSize: '13px',
              padding: '0 14px', height: '32px',
              border: '0.5px solid rgba(155, 174, 159,0.4)',
              background: 'transparent', color: 'var(--color-gold)',
              cursor: 'pointer', letterSpacing: '.04em',
            }}
          >
            {copied ? 'Kopiert ✓' : 'Kopieren'}
          </button>
        </div>
      </div>
    )
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
        {isPending ? 'Wird erzeugt …' : 'Neuen Link erstellen'}
      </button>
      {error && (
        <p style={{
          marginTop: '10px', fontFamily: 'var(--font-inter)', fontSize: '13px',
          color: '#e2837c',
        }}>
          {error}
        </p>
      )}
    </div>
  )
}
