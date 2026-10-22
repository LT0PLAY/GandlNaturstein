'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { addInquiryNote } from '@/lib/actions/inquiries'
import styles from './anfrage.module.css'

export interface NoteView {
  id:        string
  author:    string
  text:      string
  timeLabel: string
  /** Eigene Nachricht (rechts, grün) oder die eines Kollegen (links, grau) */
  mine:      boolean
  /** Alte Einzel-Notiz aus der Zeit vor dem Verlauf */
  legacy?:   boolean
}

/** Interne Team-Notizen im Chat-Stil: Verlauf mit Sprechblasen, unten ein Eingabefeld. */
export default function InquiryNotes({ inquiryId, notes }: { inquiryId: string; notes: NoteView[] }) {
  const router = useRouter()
  const [text, setText]   = useState('')
  const [error, setError] = useState('')
  const [pending, startTransition] = useTransition()
  const listRef = useRef<HTMLDivElement>(null)

  // Beim Öffnen und nach jeder neuen Nachricht ans Ende springen
  useEffect(() => {
    const el = listRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [notes.length])

  function send() {
    const value = text.trim()
    if (!value || pending) return
    setError('')
    startTransition(async () => {
      const res = await addInquiryNote(inquiryId, value)
      if (res.success) {
        setText('')
        router.refresh()
      } else {
        setError(res.error ?? 'Die Notiz konnte nicht gespeichert werden.')
      }
    })
  }

  return (
    <div>
      <div className={styles.chat} ref={listRef} aria-live="polite">
        {notes.length === 0 ? (
          <p className={styles.chatEmpty}>
            Noch keine Notizen. Schreibe unten die erste — sie ist nur für das Team sichtbar.
          </p>
        ) : notes.map((n) => (
          <div
            key={n.id}
            className={`${styles.msg} ${n.mine ? styles.msgMine : styles.msgOther} ${n.legacy ? styles.msgLegacy : ''}`}
          >
            <span className={styles.msgMeta}>
              {n.legacy ? 'Ältere Notiz' : `${n.mine ? 'Du' : n.author} · ${n.timeLabel}`}
            </span>
            <div className={styles.bubble}>{n.text}</div>
          </div>
        ))}
      </div>

      <div className={styles.composer}>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); send() } }}
          placeholder="Notiz fürs Team schreiben…"
          rows={1}
          maxLength={2000}
          aria-label="Neue interne Notiz"
        />
        <button type="button" className={styles.send} onClick={send} disabled={pending || !text.trim()}>
          {pending ? '…' : 'Senden'}
        </button>
      </div>
      <p className={styles.composerHint}>Nur für das Team sichtbar · Strg/Cmd + Enter sendet</p>
      {error && <p className={styles.error}>{error}</p>}
    </div>
  )
}
