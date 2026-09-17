'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import ProductCardImage from '@/components/public/ProductCardImage'
import CategoryFilter from '@/components/public/CategoryFilter'
import type { Product, Category } from '@/lib/types'
import styles from '@/app/(public)/category.module.css'

interface Props {
  title:       string
  label:       string
  subtitle?:   string
  heroImage?:  string | null   // Titelbild einer einzelnen Kategorie-Seite
  /** Freitext-Info zur Kategorie (Beschreibung + Verwendungsgebiet), aus dem Admin gepflegt.
   *  Wird über den „ⓘ Produktinformation"-Button im Titelbild angezeigt. */
  categoryDescription?: string | null
  basePath:    string          // z.B. '/eigenproduktion'
  categories:  Category[]      // für den Kategorie-Filter (Chips)
  products:    Product[]
}

// Werte werden getrimmt verglichen — im Admin eingetippte Leerzeichen am
// Anfang/Ende (z.B. "Jura Kalkstein " statt "Jura Kalkstein") sollen nicht zu
// zwei optisch identischen, aber technisch unterschiedlichen Filter-Optionen
// führen, bei denen dann nur ein Teil der passenden Produkte gefunden wird.
function normalize(v: string | null | undefined): string {
  return (v ?? '').trim()
}

function uniqueValues(products: Product[], field: keyof Product): string[] {
  const set = new Set<string>()
  for (const p of products) {
    const v = normalize(p[field] as unknown as string | null)
    if (v) set.add(v)
  }
  return [...set].sort()
}

export default function BereichPage({
  title, label, subtitle, heroImage, categoryDescription, basePath, categories, products,
}: Props) {
  const [showInfo, setShowInfo] = useState(false)
  const [einsatzbereich, setEinsatzbereich] = useState('')
  const [steinart,       setSteinart]       = useState('')
  const [farbe,           setFarbe]          = useState('')
  const [oberflaeche,     setOberflaeche]    = useState('')
  const [format,          setFormat]         = useState('')

  const einsatzOptions = useMemo(() => uniqueValues(products, 'einsatzbereich'), [products])
  const materialOptions = useMemo(() => uniqueValues(products, 'material'), [products])
  const farbeOptions    = useMemo(() => uniqueValues(products, 'farbe'), [products])
  const surfaceOptions  = useMemo(() => uniqueValues(products, 'surface'), [products])
  const formatOptions   = useMemo(() => uniqueValues(products, 'format'), [products])

  const filtered = useMemo(() => products.filter((p) =>
    (!einsatzbereich || normalize(p.einsatzbereich) === einsatzbereich) &&
    (!steinart       || normalize(p.material)       === steinart) &&
    (!farbe          || normalize(p.farbe)          === farbe) &&
    (!oberflaeche    || normalize(p.surface)        === oberflaeche) &&
    (!format         || normalize(p.format)         === format)
  ), [products, einsatzbereich, steinart, farbe, oberflaeche, format])

  const hasFilterOptions = einsatzOptions.length > 0 || materialOptions.length > 0 ||
    farbeOptions.length > 0 || surfaceOptions.length > 0 || formatOptions.length > 0

  const filterBarContent = (
    <>
      {einsatzOptions.length > 0 && (
        <select className={styles.filterSelect} value={einsatzbereich} onChange={(e) => setEinsatzbereich(e.target.value)}>
          <option value="">Einsatzbereich</option>
          {einsatzOptions.map((v) => <option key={v} value={v}>{v}</option>)}
        </select>
      )}
      {materialOptions.length > 0 && (
        <select className={styles.filterSelect} value={steinart} onChange={(e) => setSteinart(e.target.value)}>
          <option value="">Steinart</option>
          {materialOptions.map((v) => <option key={v} value={v}>{v}</option>)}
        </select>
      )}
      {farbeOptions.length > 0 && (
        <select className={styles.filterSelect} value={farbe} onChange={(e) => setFarbe(e.target.value)}>
          <option value="">Farbe</option>
          {farbeOptions.map((v) => <option key={v} value={v}>{v}</option>)}
        </select>
      )}
      {surfaceOptions.length > 0 && (
        <select className={styles.filterSelect} value={oberflaeche} onChange={(e) => setOberflaeche(e.target.value)}>
          <option value="">Oberfläche</option>
          {surfaceOptions.map((v) => <option key={v} value={v}>{v}</option>)}
        </select>
      )}
      {formatOptions.length > 0 && (
        <select className={styles.filterSelect} value={format} onChange={(e) => setFormat(e.target.value)}>
          <option value="">Format</option>
          {formatOptions.map((v) => <option key={v} value={v}>{v}</option>)}
        </select>
      )}
      <span className={styles.filterCount}>{filtered.length} PRODUKT{filtered.length === 1 ? '' : 'E'}</span>
    </>
  )

  return (
    <div className={styles.pageBg}>
    <section className={styles.page}>

      {heroImage ? (
        <div className={styles.heroWrap}>
          <div className={styles.heroBanner}>
            <img src={heroImage} alt={title} className={styles.heroBannerImg} />
            <div className={styles.heroBannerOverlay}>
              <div className={styles.heroBannerInner}>
                <p className={styles.heroBannerLabel}>{label}</p>
                <h1 className={styles.heroBannerTitle}>{title}</h1>
                {subtitle && <p className={styles.heroBannerSubtitle}>{subtitle}</p>}
                <button
                  type="button"
                  className={styles.infoBtn}
                  onClick={() => setShowInfo(true)}
                >
                  <span className={styles.infoBtnIcon}>ⓘ</span>
                  Produktinformation
                </button>
              </div>
            </div>
          </div>

          {/* Info- und Filterleiste liegen als transparent-dunkles Overlay UNTEN AUF dem
              Titelbild — das Foto geht optisch bis zur Unterkante durch. */}
          <div className={styles.heroOverlayBars}>
            <CategoryFilter categories={categories} basePath={basePath} />
            {hasFilterOptions && (
              <div className={styles.filterBar}>
                {filterBarContent}
              </div>
            )}
          </div>
        </div>
      ) : (
        <>
          <div className={styles.hero}>
            <p className={styles.label}>// {label}</p>
            <h1 className={styles.title}>{title}</h1>
            {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
          </div>

          {categories.length > 0 && (
            <>
            <p className={styles.sectionSubLabel}>Kategorien</p>
            <div className={styles.categoriesGrid}>
              {categories.map((cat) => (
                <Link key={cat.id} href={`${basePath}/kategorie/${cat.slug}`} className={styles.categoryCard}>
                  {cat.image_url ? (
                    <img src={cat.image_url} alt={cat.name} className={styles.categoryCardImg} />
                  ) : (
                    <div className={styles.categoryCardPlaceholder} />
                  )}
                  <div className={styles.categoryCardOverlay}>
                    <span className={styles.categoryCardTitle}>{cat.name}</span>
                  </div>
                </Link>
              ))}
            </div>
            </>
          )}
        </>
      )}

      {/* Auf den Bereichs-Übersichtsseiten (Kategorie-Karten vorhanden) liegt die
          Gesamtproduktliste hinter einem Dropdown — standardmäßig immer zu, damit
          der Kunde nach den Kategorie-Karten nicht sofort von allen Produkten
          erschlagen wird. Auf reinen Kategorie-Seiten (Titelbild) bleibt die Liste
          wie gehabt direkt sichtbar. */}
      {!heroImage && categories.length > 0 ? (
        <details className={styles.allProductsDetails}>
          <summary className={styles.allProductsSummary}>
            Alle Produkte anzeigen
            <span className={styles.allProductsCount}>({filtered.length})</span>
          </summary>
          <div className={styles.allProductsContent}>
            {hasFilterOptions && (
              <div className={`${styles.filterBar} ${styles.filterBarStandalone}`}>
                {filterBarContent}
              </div>
            )}
            {filtered.length === 0 ? (
              <div className={styles.empty}>
                <p>Keine Produkte gefunden.</p>
              </div>
            ) : (
              <div className={styles.grid}>
                {filtered.map((product) => (
                  <Link
                    key={product.id}
                    href={`${basePath}/${product.slug}`}
                    className={styles.card}
                    style={{ textDecoration: 'none', display: 'block' }}
                  >
                    <div className={styles.cardImage}>
                      <ProductCardImage
                        images={product.images ?? []}
                        thumbnail={product.thumbnail}
                        alt={product.name}
                        altMap={product.image_alts}
                        className={styles.img}
                        placeholderClassName={styles.imgPlaceholder}
                        placeholderLabel={product.material ?? label}
                      />
                      {(product.category as any)?.name && (
                        <span className={styles.categoryBadge}>{(product.category as any).name}</span>
                      )}
                      {product.icon_url && (
                        <img src={product.icon_url} alt="" className={styles.iconOverlay} />
                      )}
                    </div>
                    <div className={styles.cardBody}>
                      <p className={styles.cardMaterial}>{product.material}</p>
                      <h3 className={styles.cardTitle}>{product.name}</h3>
                      <p className={styles.cardSurface}>{product.surface}</p>
                      <span className={styles.cardCta}>Details & Anfrage →</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </details>
      ) : (
        <>
          {!heroImage && hasFilterOptions && (
            <div className={`${styles.filterBar} ${styles.filterBarStandalone}`}>
              {filterBarContent}
            </div>
          )}
          {filtered.length === 0 ? (
            <div className={styles.empty}>
              <p>Keine Produkte gefunden.</p>
            </div>
          ) : (
            <div className={styles.grid}>
              {filtered.map((product) => (
                <Link
                  key={product.id}
                  href={`${basePath}/${product.slug}`}
                  className={styles.card}
                  style={{ textDecoration: 'none', display: 'block' }}
                >
                  <div className={styles.cardImage}>
                    <ProductCardImage
                      images={product.images ?? []}
                      thumbnail={product.thumbnail}
                      alt={product.name}
                      altMap={product.image_alts}
                      className={styles.img}
                      placeholderClassName={styles.imgPlaceholder}
                      placeholderLabel={product.material ?? label}
                    />
                    {(product.category as any)?.name && (
                      <span className={styles.categoryBadge}>{(product.category as any).name}</span>
                    )}
                    {product.icon_url && (
                      <img src={product.icon_url} alt="" className={styles.iconOverlay} />
                    )}
                  </div>
                  <div className={styles.cardBody}>
                    <p className={styles.cardMaterial}>{product.material}</p>
                    <h3 className={styles.cardTitle}>{product.name}</h3>
                    <p className={styles.cardSurface}>{product.surface}</p>
                    <span className={styles.cardCta}>Details & Anfrage →</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </section>

    {showInfo && (
      <div className={styles.infoOverlay} onClick={() => setShowInfo(false)}>
        <div className={styles.infoModal} onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            className={styles.infoModalClose}
            onClick={() => setShowInfo(false)}
            aria-label="Schließen"
          >
            ✕
          </button>
          <p className={styles.infoModalLabel}>// Produktinformation</p>
          <h2 className={styles.infoModalTitle}>{title}</h2>
          {categoryDescription ? (
            <p className={styles.infoModalText}>{categoryDescription}</p>
          ) : (
            <p className={styles.infoModalTextEmpty}>
              Für diese Kategorie ist noch keine Produktinformation hinterlegt.
              Im Admin unter „Kategorien" → „Beschreibung" lässt sie sich ergänzen.
            </p>
          )}
        </div>
      </div>
    )}
    </div>
  )
}
