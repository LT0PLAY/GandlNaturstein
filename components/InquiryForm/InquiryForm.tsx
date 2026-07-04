'use client'

import { useState } from 'react'
import { submitInquiry } from '@/lib/actions/inquiries'
import type { InquiryFormData } from '@/lib/types'
import styles from './InquiryForm.module.css'

interface InquiryFormProps {
  productId?:   string
  productName?: string
}

export default function InquiryForm({ productId, productName }: InquiryFormProps) {
  const [status, setStatus]   = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setStatus('loading')

    const form = e.currentTarget
    const data = Object.fromEntries(new FormData(form)) as unknown as InquiryFormData
    if (productId) data.product_id = productId

    const result = await submitInquiry(data)

    if (result.success) {
      setStatus('success')
      setMessage('Vielen Dank! Wir melden uns innerhalb von 1–2 Werktagen.')
      form.reset()
    } else {
      setStatus('error')
      setMessage(result.error ?? 'Etwas ist schiefgelaufen.')
    }
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      {productName && (
        <p className={styles.productLabel}>Anfrage zu: <strong>{productName}</strong></p>
      )}

      <div className={styles.row}>
        <div className={styles.field}>
          <label htmlFor="name">Name *</label>
          <input id="name" name="name" type="text" required placeholder="Max Mustermann" />
        </div>
        <div className={styles.field}>
          <label htmlFor="email">E-Mail *</label>
          <input id="email" name="email" type="email" required placeholder="max@beispiel.de" />
        </div>
      </div>

      <div className={styles.row}>
        <div className={styles.field}>
          <label htmlFor="phone">Telefon</label>
          <input id="phone" name="phone" type="tel" placeholder="Optional" />
        </div>
        <div className={styles.field}>
          <label htmlFor="area_sqm">Fläche (m²)</label>
          <input id="area_sqm" name="area_sqm" type="number" min="0" step="0.5" placeholder="z.B. 25" />
        </div>
      </div>

      <div className={styles.field}>
        <label htmlFor="message">Ihr Projekt</label>
        <textarea id="message" name="message" rows={4}
          placeholder="Beschreiben Sie kurz Ihr Projekt..." />
      </div>

      <button type="submit" disabled={status === 'loading'} className={styles.submit}>
        {status === 'loading' ? 'Wird gesendet...' : 'Anfrage absenden →'}
      </button>

      {message && (
        <p className={status === 'success' ? styles.successMsg : styles.errorMsg}>
          {message}
        </p>
      )}
    </form>
  )
}
