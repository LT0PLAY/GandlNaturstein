'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useBasket } from './BasketContext'
import { UNIT_LABELS, PRICE_DISCLAIMER, formatQuantity, isFractionalUnit, basketLineKey } from '@/lib/types'
import type { ProductUnit } from '@/lib/types'
import styles from './BasketDrawer.module.css'

/** Mengenfeld: Zahl direkt eintippen (Komma oder Punkt). Übernommen wird beim Verlassen
 *  des Feldes bzw. mit Enter; ungültige Eingaben springen auf den letzten Wert zurück. */
function QuantityInput({
  quantity, unit, onCommit,
}: {
  quantity: number
  unit: ProductUnit
  onCommit: (value: number) => void
}) {
  const [draft, setDraft] = useState<string | null>(null)
  const fractional = isFractionalUnit(unit)

  function commit() {
    if (draft === null) return
    const value = parseFloat(draft.trim().replace(',', '.'))
    if (Number.isFinite(value)) onCommit(value)
    setDraft(null)
  }

  return (
    <input
      type="text"
      inputMode={fractional ? 'decimal' : 'numeric'}
      enterKeyHint="done"
      autoComplete="off"
      aria-label={`Menge in ${UNIT_LABELS[unit].short}`}
      className={styles.qtyInput}
      value={draft ?? formatQuantity(quantity, unit)}
      onFocus={(e) => { setDraft(formatQuantity(quantity, unit)); e.currentTarget.select() }}
      onChange={(e) => {
        // nur Ziffern und (bei Kommazahlen) ein Dezimaltrenner
        const cleaned = e.target.value.replace(fractional ? /[^\d.,]/g : /\D/g, '')
        setDraft(cleaned)
      }}
      onBlur={commit}
      onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur() }}
    />
  )
}

export default function BasketDrawer() {
  const { items, isOpen, closeDrawer, removeItem, updateQty } = useBasket()

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

        <div className={styles.body}>
          {items.length === 0 ? (
            <div className={styles.empty}>
              <p>Noch keine Produkte im Korb.</p>
              <p>Klicke auf &ldquo;In Korb&rdquo; bei einem Produkt.</p>
            </div>
          ) : (
            <>
              <ul className={styles.list}>
                {items.map((item) => {
                  const lineKey = basketLineKey(item.productId, item.size, item.surface)
                  return (
                  <li key={lineKey} className={styles.item}>
                    {item.thumbnail
                      ? <img src={item.thumbnail} alt={item.productName} className={styles.thumb} />
                      : <div className={styles.thumbPlaceholder} />}
                    <div className={styles.itemInfo}>
                      <p className={styles.itemName}>{item.productName}</p>
                      {(item.size || item.surface || item.articleNumber) && (
                        <p className={styles.itemVariant}>
                          {item.size && <span>Größe: {item.size}</span>}
                          {item.surface && <span>Oberfläche: {item.surface}</span>}
                          {item.articleNumber && <span>Art.-Nr. {item.articleNumber}</span>}
                        </p>
                      )}
                      {/* Preisschätzung */}
                      {item.show_price && item.price != null && (
                        <p className={styles.itemPrice}>
                          {`≈ ${(item.quantity * item.price).toLocaleString('de-DE', { minimumFractionDigits: 2 })} € (${
                            formatQuantity(item.quantity, item.unit)
                          } ${UNIT_LABELS[item.unit].short} × ${item.price.toLocaleString('de-DE', { minimumFractionDigits: 2 })} €/${UNIT_LABELS[item.unit].short})`}
                        </p>
                      )}
                      {/* Menge + Einheit (fest, vom Produkt vorgegeben) */}
                      <div className={styles.qtyRow}>
                        <button
                          type="button"
                          className={styles.qtyBtn}
                          onClick={() => updateQty(lineKey, item.quantity - (item.unit === 'stueck' ? 1 : 0.5))}
                        >−</button>
                        <QuantityInput
                          quantity={item.quantity}
                          unit={item.unit}
                          onCommit={(value) => updateQty(lineKey, value)}
                        />
                        <button
                          type="button"
                          className={styles.qtyBtn}
                          onClick={() => updateQty(lineKey, item.quantity + (item.unit === 'stueck' ? 1 : 0.5))}
                        >+</button>
                        <span className={styles.unitLabel}>{UNIT_LABELS[item.unit].short}</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      className={styles.removeBtn}
                      onClick={() => removeItem(lineKey)}
                      aria-label="Entfernen"
                    >✕</button>
                  </li>
                  )
                })}
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
                  <>
                    <div className={styles.totalRow}>
                      <span>{allHavePrices ? 'Geschätzte Gesamtsumme' : 'Geschätzte Teilsumme'}</span>
                      <strong>ab {total.toLocaleString('de-DE', { minimumFractionDigits: 2 })} €</strong>
                    </div>
                    <p style={{ fontSize: '11px', color: 'var(--color-text-dim)', letterSpacing: '.03em', textAlign: 'right', marginTop: '-4px' }}>
                      {PRICE_DISCLAIMER}
                    </p>
                  </>
                )
              })()}
              {/* Führt direkt zum Kontaktformular – der Korb wird dort automatisch übernommen */}
              <Link href="/kontakt" className={styles.ctaBtn} onClick={closeDrawer}>
                Anfrage stellen ({items.length} {items.length === 1 ? 'Position' : 'Positionen'}) →
              </Link>
            </>
          )}
        </div>
      </div>
    </>
  )
}
