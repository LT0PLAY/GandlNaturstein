'use client'

import { useState } from 'react'
import Link from 'next/link'
import { submitInquiry, submitBasketInquiry } from '@/lib/actions/inquiries'
import { useBasket } from '@/components/public/BasketContext'
import type { InquiryFormData } from '@/lib/types'
import { UNIT_LABELS } from '@/lib/types'
import styles from './InquiryForm.module.css'

interface InquiryFormProps {
  productId?:   string
  productName?: string
}

export default function InquiryForm({ productId, productName }: InquiryFormProps) {
  const [status, setStatus]   = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const { items: basketItems, removeItem, clearBasket } = useBasket()

  // Nur im allgemeinen Kontaktformular (kein einzelnes Produkt) den
  // Anfragekorb anzeigen, wenn Produkte darin liegen.
  const showBasket = !productId && basketItems.length > 0

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    const form = e.currentTarget
    const fd = new FormData(form)
    const honeypot = fd.get('website') as string

    // Honeypot direkt im Browser prüfen – Bots, die das Feld befüllen,
    // bekommen eine "Erfolg"-Meldung, es wird aber nichts gesendet.
    if (honeypot && honeypot.trim() !== '') {
      setStatus('success')
      setMessage('Vielen Dank! Wir melden uns innerhalb von 1–2 Werktagen.')
      form.reset()
      return
    }

    setStatus('loading')

    if (showBasket) {
      const result = await submitBasketInquiry({
        name:    fd.get('name')    as string,
        email:   fd.get('email')   as string,
        phone:   fd.get('phone')   as string,
        message: fd.get('message') as string,
        consent: fd.get('consent') as string,
        items: basketItems.map((it) => ({
          productId:   it.productId,
          productName: it.productName,
          quantity:    it.quantity,
          unit:        it.unit,
          sourceType:  it.sourceType,
        })),
      })

      if (result.success) {
        setStatus('success')
        setMessage('Vielen Dank! Wir melden uns innerhalb von 1–2 Werktagen.')
        form.reset()
        clearBasket()
      } else {
        setStatus('error')
        setMessage(result.error ?? 'Etwas ist schiefgelaufen.')
      }
      return
    }

    const raw = Object.fromEntries(fd) as unknown as InquiryFormData
    if (productId) raw.product_id = productId

    const result = await submitInquiry(raw)

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

      {/* Honeypot – für Menschen unsichtbar, Bots füllen es trotzdem aus */}
      <div className={styles.honeypot} aria-hidden="true">
        <label htmlFor="website">Firma (bitte freilassen)</label>
        <input
          id="website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

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

      <div className={styles.field}>
        <label htmlFor="phone">Telefon</label>
        <input id="phone" name="phone" type="tel" placeholder="Optional" />
      </div>

      {showBasket && (
        <div className={styles.basket}>
          <p className={styles.basketLabel}>Ihr Anfragekorb</p>
          <ul className={styles.basketList}>
            {basketItems.map((item) => (
              <li key={item.productId} className={styles.basketItem}>
                {item.thumbnail
                  ? <img src={item.thumbnail} alt={item.productName} className={styles.basketThumb} />
                  : <div className={styles.basketThumbPlaceholder} />}
                <div className={styles.basketItemInfo}>
                  <p className={styles.basketItemName}>{item.productName}</p>
                  <p className={styles.basketItemQty}>
                    {item.unit === 'stueck' ? item.quantity : item.quantity.toFixed(1)} {UNIT_LABELS[item.unit].short}
                  </p>
                </div>
                <button
                  type="button"
                  className={styles.basketRemove}
                  onClick={() => removeItem(item.productId)}
                  aria-label={`${item.productName} entfernen`}
                >✕</button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className={styles.field}>
        <label htmlFor="message">Ihr Projekt</label>
        <textarea id="message" name="message" rows={4}
          placeholder="Beschreiben Sie kurz Ihr Projekt..." />
      </div>

      <label className={styles.consent}>
        <input type="checkbox" name="consent" required />
        <span>
          Ich stimme zu, dass meine Angaben zur Bearbeitung meiner Anfrage
          gespeichert und verarbeitet werden. Weitere Informationen in unserer{' '}
          <Link href="/datenschutz">Datenschutzerklärung</Link>. *
        </span>
      </label>

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
