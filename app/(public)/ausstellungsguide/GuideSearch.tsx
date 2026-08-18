'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { GuideEntry } from '@/lib/types'
import { useBasket } from '@/components/public/BasketContext'
import styles from './guide.module.css'

export default function GuideSearch({ entries }: { entries: GuideEntry[] }) {
  const [query, setQuery] = useState('')
  const [activeImg, setActiveImg] = useState(0)
  const { addItem, hasItem } = useBasket()
  const router = useRouter()

  const byNumber = useMemo(() => {
    const map = new Map<number, GuideEntry>()
    entries.forEach((e) => map.set(e.number, e))
    return map
  }, [entries])

  const trimmed = query.trim()
  const asNumber = trimmed ? Number(trimmed) : null
  const match = asNumber && !Number.isNaN(asNumber) ? byNumber.get(asNumber) : undefined
  const notFound = trimmed !== '' && !match
  const images = match?.images ?? []

  useEffect(() => { setActiveImg(0) }, [match?.id])

  return (
    <div>
      <div className={styles.searchWrap}>
        <span className={styles.searchHash}>#</span>
        <input
          type="number"
          inputMode="numeric"
          min="1"
          placeholder="Nummer eingeben …"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className={styles.searchInput}
          autoFocus
        />
      </div>

      <div className={styles.previewArea}>
        {match ? (
          <div className={styles.card}>
            <div className={styles.cardImgCol}>
              <div className={styles.cardImgWrap}>
                {images[activeImg] ? (
                  <img src={images[activeImg]} alt={match.name} className={styles.cardImg} />
                ) : (
                  <div className={styles.cardImgPlaceholder}>
                    <span>#{match.number}</span>
                  </div>
                )}
              </div>
              {images.length > 1 && (
                <div className={styles.thumbRow}>
                  {images.map((url, i) => (
                    <button
                      key={url}
                      type="button"
                      onClick={() => setActiveImg(i)}
                      className={`${styles.thumbBtn} ${i === activeImg ? styles.thumbBtnActive : ''}`}
                      aria-label={`Foto ${i + 1} anzeigen`}
                    >
                      <img src={url} alt="" />
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className={styles.cardBody}>
              <p className={styles.cardNumber}>Nr. {match.number}</p>
              <h2 className={styles.cardName}>{match.name}</h2>
              {match.description && <p className={styles.cardDesc}>{match.description}</p>}
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  disabled={hasItem(`guide:${match.id}`)}
                  onClick={() => addItem({
                    productId:    `guide:${match.id}`,
                    productName:  match.name,
                    productSlug:  '',
                    categoryType: 'extras',
                    thumbnail:    images[0] ?? null,
                    price:        null,
                    show_price:   false,
                    sourceType:   'guide',
                    unit:         'stueck',
                  })}
                  className={styles.cardCta}
                  style={hasItem(`guide:${match.id}`) ? {
                    background: 'transparent', border: '1px solid var(--color-sage)', color: 'var(--color-sage)', cursor: 'default',
                  } : undefined}
                >
                  {hasItem(`guide:${match.id}`) ? 'Im Anfragekorb ✓' : 'In den Anfragekorb →'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    // Legt das Produkt (falls noch nicht drin) in den Korb und springt direkt zum Formular
                    if (!hasItem(`guide:${match.id}`)) {
                      addItem({
                        productId:    `guide:${match.id}`,
                        productName:  match.name,
                        productSlug:  '',
                        categoryType: 'extras',
                        thumbnail:    images[0] ?? null,
                        price:        null,
                        show_price:   false,
                        sourceType:   'guide',
                        unit:         'stueck',
                      })
                    }
                    router.push('/kontakt')
                  }}
                  style={{
                    background: 'none', border: 'none', padding: 0, cursor: 'pointer',
                    color: '#9caea1', fontFamily: 'var(--font-inter)', fontSize: '14px', textDecoration: 'none',
                  }}
                >
                  Direkt anfragen →
                </button>
              </div>
            </div>
          </div>
        ) : notFound ? (
          <p className={styles.notFound}>Keine Nummer „{trimmed}" gefunden. Bitte am Ausstellungsschild prüfen.</p>
        ) : (
          <div className={styles.grid}>
            {entries.map((e) => (
              <button key={e.id} type="button" className={styles.numberChip} onClick={() => setQuery(String(e.number))}>
                {e.number}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
