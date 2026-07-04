'use client'

import { useState } from 'react'
import { useBasket } from './BasketContext'
import { submitBasketInquiry } from '@/lib/actions/inquiries'
import type { BasketUnit } from '@/lib/types'
import styles from './BasketDrawer.module.css'

export default function BasketDrawer() {
  const { items, isOpen, closeDrawer, removeItem, updateQty, updateUnit, clearBasket } = useBasket()
  const [step,    setStep]    = useState<'basket' | 'form' | 'success'>('basket')
  const [sending, setSending] = useState(false)
  const [error,   setError]   = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (items.length === 0) return
    setSending(true)
    setError('')
    const fd = new FormData(e.currentTarget)
    const result = await submitBasketInquiry({
      name:    fd.get('name')    as string,
      email:   fd.get('email')   as string,
      phone:   fd.get('phone')   as string,
      message: fd.get('message') as string,
      items: items.map((it) => ({
        productId:   it.productId,
        productName: it.productName,
        quantity:    it.quantity,
        unit:        it.unit,
      })),
    })
    setSending(false)
    if (result.success) {
      setStep('success')
      clearBasket()
    } else {
      setError(result.error ?? 'Unbekannter Fehler')
    }
  }

  function reset() {
    setStep('basket')
    setError('')
    closeDrawer()
  }

  return (
    <>
      {/* Backdrop */}
      {isOpen && <div className={styles.backdrop} onClick={closeDrawer} />}

      {/* Drawer */}
      <div className={`${styles.drawer} ${isOpen ? styles.open : ''}`}>
        <div className={styles.header}>
          <div>
            <p className={styles.headerLabel}>// Anfrage</p>
            <h2 className={styles.headerTitle}>Anfragekorb</h2>
          </div>
          <button className={styles.closeBtn} onClick={closeDrawer} aria-label="Schließen">✕</button>
        </div>

        {/* ── SCHRITT 1: Korb ── */}
        {step === 'basket' && (
          <div className={styles.body}>
            {items.length === 0 ? (
              <div className={styles.empty}>
                <p>Noch keine Produkte im Korb.</p>
                <p>Klicke auf &ldquo;In Korb&rdquo; bei einem Produkt.</p>
              </div>
            ) : (
              <>
                <ul className={styles.list}>
                  {items.map((item) => (
                    <li key={item.productId} className={styles.item}>
                      {item.thumbnail
                        ? <img src={item.thumbnail} alt={item.productName} className={styles.thumb} />
                        : <div className={styles.thumbPlaceholder} />}
                      <div className={styles.itemInfo}>
                        <p className={styles.itemName}>{item.productName}</p>
                        {/* Preisschätzung */}
                        {item.show_price && item.price != null && (
                          <p className={styles.itemPrice}>
                            {item.unit === 'm2'
                              ? `≈ ${(item.quantity * item.price).toLocaleString('de-DE', { minimumFractionDigits: 2 })} € (${item.quantity.toFixed(1)} m² × ${item.price.toLocaleString('de-DE', { minimumFractionDigits: 2 })} €/m²)`
                              : `≈ ${(item.quantity * item.price).toLocaleString('de-DE', { minimumFractionDigits: 2 })} € (${item.quantity} Stk. × ${item.price.toLocaleString('de-DE', { minimumFractionDigits: 2 })} €)`
                            }
                          </p>
                        )}
                        {/* Menge + Einheit */}
                        <div className={styles.qtyRow}>
                          <button
                            type="button"
                            className={styles.qtyBtn}
                            onClick={() => updateQty(item.productId, item.quantity - (item.unit === 'm2' ? 0.5 : 1))}
                          >−</button>
                          <span className={styles.qtyVal}>
                            {item.unit === 'm2' ? item.quantity.toFixed(1) : item.quantity}
                          </span>
                          <button
                            type="button"
                            className={styles.qtyBtn}
                            onClick={() => updateQty(item.productId, item.quantity + (item.unit === 'm2' ? 0.5 : 1))}
                          >+</button>
                          {/* Einheit Toggle */}
                          <div className={styles.unitToggle}>
                            {(['m2', 'stueck'] as BasketUnit[]).map((u) => (
                              <button
                                key={u}
                                type="button"
                                className={`${styles.unitBtn} ${item.unit === u ? styles.unitActive : ''}`}
                                onClick={() => updateUnit(item.productId, u)}
                              >
                                {u === 'm2' ? 'm²' : 'Stk.'}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        className={styles.removeBtn}
                        onClick={() => removeItem(item.productId)}
                        aria-label="Entfernen"
                      >✕</button>
                    </li>
                  ))}
                </ul>
                {/* Gesamtschätzung */}
                {(() => {
                  const total = items.reduce((sum, it) => {
                    if (it.show_price && it.price != null) return sum + it.quantity * it.price
                    return sum
                  }, 0)
                  const hasPrices = items.some((it) => it.show_price && it.price != null)
                  const allHavePrices = items.every((it) => it.show_price && it.price != null)
                  if (!hasPrices) return null
                  return (
                    <div className={styles.totalRow}>
                      <span>{allHavePrices ? 'Geschätzte Gesamtsumme' : 'Geschätzte Teilsumme'}</span>
                      <strong>ab {total.toLocaleString('de-DE', { minimumFractionDigits: 2 })} €</strong>
                    </div>
                  )
                })()}
                <button
                  className={styles.ctaBtn}
                  onClick={() => setStep('form')}
                >
                  Anfrage stellen ({items.length} {items.length === 1 ? 'Produkt' : 'Produkte'}) →
                </button>
              </>
            )}
          </div>
        )}

        {/* ── SCHRITT 2: Kontaktformular ── */}
        {step === 'form' && (
          <div className={styles.body}>
            <button className={styles.backBtn} onClick={() => setStep('basket')}>← zurück zum Korb</button>
            <p className={styles.formIntro}>Ihre Kontaktdaten für die Anfrage:</p>

            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.field}>
                <label>Name *</label>
                <input name="name" type="text" required placeholder="Max Mustermann" />
              </div>
              <div className={styles.field}>
                <label>E-Mail *</label>
                <input name="email" type="email" required placeholder="max@beispiel.de" />
              </div>
              <div className={styles.field}>
                <label>Telefon</label>
                <input name="phone" type="tel" placeholder="Optional" />
              </div>
              <div className={styles.field}>
                <label>Kommentar</label>
                <textarea name="message" rows={3} placeholder="Fragen, Liefertermin, besondere Wünsche…" />
              </div>

              {/* Zusammenfassung */}
              <div className={styles.summary}>
                {items.map((it) => (
                  <p key={it.productId} className={styles.summaryLine}>
                    {it.productName} — {it.unit === 'm2' ? it.quantity.toFixed(1) + ' m²' : it.quantity + ' Stk.'}
                    {it.show_price && it.price != null && (
                      <span className={styles.summaryPrice}>
                        {' '}≈ {(it.quantity * it.price).toLocaleString('de-DE', { minimumFractionDigits: 2 })} €
                      </span>
                    )}
                  </p>
                ))}
              </div>

              {error && <p className={styles.errorMsg}>{error}</p>}

              <button type="submit" className={styles.ctaBtn} disabled={sending}>
                {sending ? 'Wird gesendet…' : 'Unverbindlich anfragen →'}
              </button>
            </form>
          </div>
        )}

        {/* ── SCHRITT 3: Erfolg ── */}
        {step === 'success' && (
          <div className={`${styles.body} ${styles.successBody}`}>
            <p className={styles.successIcon}>✓</p>
            <h3 className={styles.successTitle}>Anfrage gesendet</h3>
            <p className={styles.successText}>
              Vielen Dank! Wir melden uns innerhalb von 1–2 Werktagen bei Ihnen.
            </p>
            <button className={styles.ctaBtn} onClick={reset}>Schließen</button>
          </div>
        )}
      </div>
    </>
  )
}
