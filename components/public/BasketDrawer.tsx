'use client'

import Link from 'next/link'
import { useBasket } from './BasketContext'
import { UNIT_LABELS } from '@/lib/types'
import styles from './BasketDrawer.module.css'

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
                {items.map((item) => (
                  <li key={item.productId} className={styles.item}>
                    {item.thumbnail
                      ? <img src={item.thumbnail} alt={item.productName} className={styles.thumb} />
                      : <div className={styles.thumbPlaceholder} />}
                    <div className={styles.itemInfo}>
                      <p className={styles.itemName}>
                        {item.productName}
                        {item.size && <span className={styles.itemSize}> · {item.size}</span>}
                        {item.surface && <span className={styles.itemSize}> · {item.surface}</span>}
                      </p>
                      {/* Preisschätzung */}
                      {item.show_price && item.price != null && (
                        <p className={styles.itemPrice}>
                          {`≈ ${(item.quantity * item.price).toLocaleString('de-DE', { minimumFractionDigits: 2 })} € (${
                            item.unit === 'stueck' ? item.quantity : item.quantity.toFixed(1)
                          } ${UNIT_LABELS[item.unit].short} × ${item.price.toLocaleString('de-DE', { minimumFractionDigits: 2 })} €/${UNIT_LABELS[item.unit].short})`}
                        </p>
                      )}
                      {/* Menge + Einheit (fest, vom Produkt vorgegeben) */}
                      <div className={styles.qtyRow}>
                        <button
                          type="button"
                          className={styles.qtyBtn}
                          onClick={() => updateQty(item.productId, item.quantity - (item.unit === 'stueck' ? 1 : 0.5))}
                        >−</button>
                        <span className={styles.qtyVal}>
                          {item.unit === 'stueck' ? item.quantity : item.quantity.toFixed(1)}
                        </span>
                        <button
                          type="button"
                          className={styles.qtyBtn}
                          onClick={() => updateQty(item.productId, item.quantity + (item.unit === 'stueck' ? 1 : 0.5))}
                        >+</button>
                        <span className={styles.unitLabel}>{UNIT_LABELS[item.unit].short}</span>
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
              {/* Führt direkt zum Kontaktformular – der Korb wird dort automatisch übernommen */}
              <Link href="/kontakt" className={styles.ctaBtn} onClick={closeDrawer}>
                Anfrage stellen ({items.length} {items.length === 1 ? 'Produkt' : 'Produkte'}) →
              </Link>
            </>
          )}
        </div>
      </div>
    </>
  )
}
