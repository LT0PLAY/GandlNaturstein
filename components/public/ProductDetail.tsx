'use client'

import { useState } from 'react'
import { useBasket } from './BasketContext'
import type { Product } from '@/lib/types'
import styles from './ProductDetail.module.css'

export default function ProductDetail({ product, backHref, backLabel }: {
  product: Product
  backHref:  string
  backLabel: string
}) {
  const { addItem, hasItem, openDrawer } = useBasket()
  const [activeImg, setActiveImg] = useState<string | null>(product.thumbnail)
  const alts = product.image_alts ?? {}
  const allImages = [
    ...(product.thumbnail ? [product.thumbnail] : []),
    ...(product.images ?? []).filter((u) => u !== product.thumbnail),
  ].slice(0, 7) // thumbnail + max 6 gallery

  const inBasket = hasItem(product.id)

  function handleAddToBasket() {
    if (inBasket) { openDrawer(); return }
    addItem({
      productId:    product.id,
      productName:  product.name,
      productSlug:  product.slug,
      categoryType: (product.category?.type ?? 'massivproduktion'),
      thumbnail:    product.thumbnail,
      price:        product.show_price ? (product.price ?? null) : null,
      show_price:   product.show_price ?? false,
    })
  }

  return (
    <article className={styles.page}>
      {/* Back link */}
      <a href={backHref} className={styles.backLink}>← {backLabel}</a>

      <div className={styles.layout}>
        {/* ── Bildbereich ── */}
        <div className={styles.images}>
          {/* Hauptbild */}
          <div className={styles.mainImg}>
            {activeImg
              ? <img src={activeImg} alt={alts[activeImg] ?? product.name} className={styles.mainImgEl} />
              : <div className={styles.mainImgPlaceholder}><span>{product.material ?? 'Naturstein'}</span></div>}
          </div>
          {/* Galerie-Thumbnails */}
          {allImages.length > 1 && (
            <div className={styles.thumbRow}>
              {allImages.map((url) => (
                <button
                  key={url}
                  type="button"
                  className={`${styles.thumbBtn} ${activeImg === url ? styles.thumbActive : ''}`}
                  onClick={() => setActiveImg(url)}
                >
                  <img src={url} alt={alts[url] ?? ''} className={styles.thumbImg} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Info + CTA ── */}
        <div className={styles.info}>
          {product.category && (
            <p className={styles.categoryLabel}>{product.category.name}</p>
          )}
          <h1 className={styles.name}>{product.name}</h1>

          {/* Eigenschaften */}
          <dl className={styles.specs}>
            {product.material && (
              <><dt>Material</dt><dd>{product.material}</dd></>
            )}
            {product.surface && (
              <><dt>Oberfläche</dt><dd>{product.surface}</dd></>
            )}
            {product.format && (
              <><dt>Format</dt><dd>{product.format}</dd></>
            )}
            {product.origin && (
              <><dt>Herkunft</dt><dd>{product.origin}</dd></>
            )}
            {product.article_number && (
              <><dt>Artikelnr.</dt><dd>{product.article_number}</dd></>
            )}
          </dl>

          {product.description && (
            <p className={styles.description}>{product.description}</p>
          )}

          <div className={styles.divider} />

          {(product as any).show_price && (product as any).price != null ? (
            <p className={styles.priceNote} style={{ fontSize: '22px', color: '#C4923A', letterSpacing: '.04em' }}>
              ab {Number((product as any).price).toLocaleString('de-DE', { minimumFractionDigits: 2 })} € / m²
            </p>
          ) : (
            <p className={styles.priceNote}>
              Kein Online-Shop — wir erstellen ein individuelles Angebot.
            </p>
          )}

          <button
            className={`${styles.ctaBtn} ${inBasket ? styles.ctaBtnInCart : ''}`}
            onClick={handleAddToBasket}
          >
            {inBasket ? 'Im Korb — Anfrage ansehen →' : 'In Anfrage-Korb legen →'}
          </button>

          <p className={styles.ctaNote}>Unverbindlich · Antwort innerhalb 1–2 Werktagen</p>
        </div>
      </div>
    </article>
  )
}
