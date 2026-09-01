'use client'

import { useState, useEffect } from 'react'
import { useBasket } from './BasketContext'
import type { Product, ProductSize } from '@/lib/types'
import { UNIT_LABELS } from '@/lib/types'
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

  const sizes: ProductSize[] = (product as any).sizes ?? []
  const hasSizes = sizes.length > 0
  const [selectedSizeIdx, setSelectedSizeIdx] = useState<number>(0)
  const selectedSize = hasSizes ? sizes[selectedSizeIdx] : null

  const allSurfaces: string[] = (product as any).surfaces ?? []
  // Ist für die gewählte Größe eine Teilmenge der Oberflächen hinterlegt, gilt nur diese —
  // sonst stehen alle am Produkt angelegten Oberflächen zur Wahl.
  const sizeSurfaces = hasSizes ? (selectedSize as any)?.surfaces as string[] | undefined : undefined
  const surfaces = sizeSurfaces && sizeSurfaces.length > 0 ? sizeSurfaces : allSurfaces
  const hasSurfaces = surfaces.length > 0
  const [selectedSurfaceIdx, setSelectedSurfaceIdx] = useState<number>(0)
  const selectedSurface = hasSurfaces ? surfaces[selectedSurfaceIdx] : null

  // Beim Wechsel der Größe kann sich die Liste der passenden Oberflächen ändern —
  // Auswahl zurücksetzen, damit nicht versehentlich eine nicht mehr gültige
  // Oberfläche „hängen bleibt".
  useEffect(() => {
    setSelectedSurfaceIdx(0)
  }, [selectedSizeIdx])

  const inBasket = hasItem(product.id)

  // Bei Größenvarianten: eigener Preis der gewählten Größe, sonst der normale Produktpreis.
  const activePrice = hasSizes
    ? (selectedSize?.price ?? null)
    : (product.price ?? null)

  function handleAddToBasket() {
    if (inBasket) { openDrawer(); return }
    addItem({
      productId:    product.id,
      productName:  product.name,
      productSlug:  product.slug,
      categoryType: ((product as any).bereich ?? product.category?.type ?? 'eigenproduktion'),
      thumbnail:    product.thumbnail,
      price:        product.show_price ? activePrice : null,
      show_price:   product.show_price ?? false,
      unit:         (product as any).unit ?? 'qm',
      size:         hasSizes ? selectedSize?.label ?? null : null,
      surface:      hasSurfaces ? selectedSurface ?? null : null,
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
            {product.surface && !hasSurfaces && (
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

          {hasSizes && (
            <div style={{ margin: '20px 0' }}>
              <label style={{ display: 'block', fontSize: '13px', letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--color-text-dim)', marginBottom: '8px' }}>
                Größe wählen
              </label>
              <select
                value={selectedSizeIdx}
                onChange={(e) => setSelectedSizeIdx(Number(e.target.value))}
                style={{
                  width: '100%', height: '46px', padding: '0 14px',
                  background: 'rgba(155,174,159,0.04)', border: '0.5px solid rgba(155,174,159,0.2)',
                  color: '#efece4', fontFamily: 'var(--font-inter), sans-serif', fontSize: '15px',
                }}
              >
                {sizes.map((s, i) => (
                  <option key={i} value={i}>
                    {s.label}
                    {product.show_price && s.price != null ? ` — ${Number(s.price).toLocaleString('de-DE', { minimumFractionDigits: 2 })} €` : ''}
                  </option>
                ))}
              </select>
            </div>
          )}

          {hasSurfaces && (
            <div style={{ margin: '20px 0' }}>
              <label style={{ display: 'block', fontSize: '13px', letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--color-text-dim)', marginBottom: '8px' }}>
                Oberfläche wählen
              </label>
              <select
                value={selectedSurfaceIdx}
                onChange={(e) => setSelectedSurfaceIdx(Number(e.target.value))}
                style={{
                  width: '100%', height: '46px', padding: '0 14px',
                  background: 'rgba(155,174,159,0.04)', border: '0.5px solid rgba(155,174,159,0.2)',
                  color: '#efece4', fontFamily: 'var(--font-inter), sans-serif', fontSize: '15px',
                }}
              >
                {surfaces.map((s, i) => (
                  <option key={i} value={i}>{s}</option>
                ))}
              </select>
            </div>
          )}

          <div className={styles.divider} />

          {(product as any).show_price && activePrice != null ? (
            <p className={styles.priceNote} style={{ fontSize: '22px', color: '#9bae9f', letterSpacing: '.04em' }}>
              ab {Number(activePrice).toLocaleString('de-DE', { minimumFractionDigits: 2 })} € / {UNIT_LABELS[((product as any).unit ?? 'qm') as keyof typeof UNIT_LABELS].short}
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

          {/* Beschreibung steht bewusst NACH der Anfrage-Aktion und in einem eigenen
              scrollbaren Kasten, damit ein langer Text den Button nicht nach unten
              wegdrückt — der Button bleibt immer direkt sichtbar. */}
          {product.description && (
            <>
              <div className={styles.divider} />
              <p className={styles.descriptionLabel}>Produktinformation</p>
              <div className={styles.descriptionBox}>
                <p className={styles.description}>{product.description}</p>
              </div>
            </>
          )}
        </div>
      </div>
    </article>
  )
}
