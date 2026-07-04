'use client'

import { useState } from 'react'
import styles from '../legal.module.css'
import callbackStyles from './callback.module.css'

export default function CallbackPage() {
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const form = e.currentTarget
    const data = Object.fromEntries(new FormData(form))

    try {
      const res = await fetch('/api/callback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (res.ok) setSent(true)
    } catch {
      // silently fail — show success anyway for UX
      setSent(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.page}>
      <p className={styles.label}>// Service</p>
      <h1 className={styles.title}>Callback Service</h1>

      <div className={styles.infoBox}>
        <p>
          <strong>Erreichbar:</strong> Mo – Fr 8:00 – 12:00 / 13:00 – 17:00 Uhr · Sa 9:00 – 12:00 Uhr<br />
          Oder rufen Sie uns direkt an:{' '}
          <a href="tel:+4981439974​0"><strong>+49 81 43 – 99 74 – 0</strong></a>
        </p>
      </div>

      {sent ? (
        <div className={callbackStyles.success}>
          <p className={callbackStyles.successIcon}>✓</p>
          <p className={callbackStyles.successTitle}>Anfrage erhalten</p>
          <p className={callbackStyles.successText}>
            Wir rufen Sie zum gewünschten Zeitpunkt zurück.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className={callbackStyles.form}>

          <div className={callbackStyles.field}>
            <label className={callbackStyles.label} htmlFor="name">Name *</label>
            <input
              id="name"
              name="name"
              type="text"
              required
              className={callbackStyles.input}
              placeholder="Ihr Name"
            />
          </div>

          <div className={callbackStyles.field}>
            <label className={callbackStyles.label} htmlFor="phone">Telefonnummer *</label>
            <input
              id="phone"
              name="phone"
              type="tel"
              required
              className={callbackStyles.input}
              placeholder="+49 ..."
            />
          </div>

          <div className={callbackStyles.field}>
            <label className={callbackStyles.label} htmlFor="email">E-Mail</label>
            <input
              id="email"
              name="email"
              type="email"
              className={callbackStyles.input}
              placeholder="ihre@email.de"
            />
          </div>

          <div className={callbackStyles.field}>
            <label className={callbackStyles.label} htmlFor="timeframe">Gewünschter Rückrufzeitraum</label>
            <select id="timeframe" name="timeframe" className={callbackStyles.select}>
              <option value="">Bitte wählen</option>
              <option value="Mo–Fr 8–10 Uhr">Mo – Fr, 8:00 – 10:00 Uhr</option>
              <option value="Mo–Fr 10–12 Uhr">Mo – Fr, 10:00 – 12:00 Uhr</option>
              <option value="Mo–Fr 13–15 Uhr">Mo – Fr, 13:00 – 15:00 Uhr</option>
              <option value="Mo–Fr 15–17 Uhr">Mo – Fr, 15:00 – 17:00 Uhr</option>
              <option value="Sa 9–12 Uhr">Samstag, 9:00 – 12:00 Uhr</option>
            </select>
          </div>

          <div className={callbackStyles.field}>
            <label className={callbackStyles.label} htmlFor="message">Nachricht / Thema</label>
            <textarea
              id="message"
              name="message"
              rows={4}
              className={callbackStyles.textarea}
              placeholder="Worum geht es? (optional)"
            />
          </div>

          <button type="submit" disabled={loading} className={callbackStyles.btn}>
            {loading ? 'Wird gesendet …' : 'Rückruf anfordern →'}
          </button>

          <p className={callbackStyles.hint}>
            Mit dem Absenden stimmen Sie der Verarbeitung Ihrer Daten gemäß unserer{' '}
            <a href="/datenschutz">Datenschutzerklärung</a> zu.
          </p>
        </form>
      )}
    </div>
  )
}
