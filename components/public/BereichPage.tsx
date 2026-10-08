'use client'

import { Fragment, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import ProductCardImage from '@/components/public/ProductCardImage'
import CategoryFilter from '@/components/public/CategoryFilter'
import BackLink from '@/components/public/BackLink'
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
  /** Optionaler externer Button neben „Produktinformation" im Titelbild (öffnet in neuem Tab) */
  heroLink?:   { label: string; href: string }
  /** Ziel des „Zurück"-Links, falls man direkt auf dieser Seite gelandet ist */
  backHref?:   string
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

// Alle Oberflächen eines Produkts (Varianten aus "surfaces"), mit Fallback auf
// das alte Einzelfeld "surface" für Produkte ohne Varianten.
function productSurfaces(p: Product): string[] {
  const list = (p.surfaces ?? []).map(normalize).filter(Boolean)
  if (list.length > 0) return list
  const single = normalize(p.surface)
  return single ? [single] : []
}

// Die Admin-Felder (Farbe, Einsatzbereich, Format, Steinart) sind Freitext und
// laut Platzhalter für mehrere, kommagetrennte Werte gedacht ("Grau, Beige").
// Jeder Einzelwert wird deshalb als eigene Filter-Option geführt und das
// Produkt erscheint unter jedem davon.
function splitValues(v: string | null | undefined): string[] {
  return (v ?? '').split(',').map((x) => x.trim()).filter(Boolean)
}

// Größen-/Maßvarianten eines Produkts (z. B. "2 cm", "30x60")
function productSizes(p: Product): string[] {
  return (p.sizes ?? []).map((sz) => normalize(sz.label)).filter(Boolean)
}

// Stärke (in cm) aus einer Größen-Bezeichnung erkennen:
//  "2 cm" → 2 · "60x60x3 cm" → 3 · "90x90x0,9 cm" → 0,9 · "20 mm" → 2
// Bei zwei Maßen ("30x60") gibt es keine Stärke → null.
function thicknessOf(label: string): number | null {
  const nums = label.match(/\d+(?:[.,]\d+)?/g)
  if (!nums) return null
  if (nums.length !== 1 && nums.length !== 3) return null
  let v = parseFloat(nums[nums.length - 1].replace(',', '.'))
  if (!isFinite(v)) return null
  if (/mm/i.test(label)) v = v / 10
  return Math.round(v * 100) / 100
}

function formatThickness(v: number): string {
  return `${String(v).replace('.', ',')} cm`
}

function productThicknesses(p: Product): string[] {
  const out = new Set<string>()
  for (const label of productSizes(p)) {
    const t = thicknessOf(label)
    if (t !== null) out.add(formatThickness(t))
  }
  return [...out]
}

// Oberflächen auf der Karte, mit deutlich sichtbarem Trenner statt Mittelpunkt
function SurfaceList({ product }: { product: Product }) {
  const list = productSurfaces(product)
  return (
    <>
      {list.map((surf, i) => (
        <Fragment key={surf}>
          {surf}
          {i < list.length - 1 && (
            <>
              <span className={styles.surfaceSep} aria-hidden="true">|</span>{' '}
            </>
          )}
        </Fragment>
      ))}
    </>
  )
}

// Beim Zurückkehren von einer Produktseite wird der Zustand der Liste
// (geöffnet, Filter, Scrollposition) wiederhergestellt.
const RESTORE_MAX_AGE_MS = 10 * 60 * 1000

function uniqueValues(products: Product[], field: keyof Product): string[] {
  const set = new Set<string>()
  for (const p of products) {
    for (const v of splitValues(p[field] as unknown as string | null)) set.add(v)
  }
  return [...set].sort()
}

export default function BereichPage({
  title, label, subtitle, heroImage, categoryDescription, heroLink, backHref, basePath, categories, products,
}: Props) {
  const [showInfo, setShowInfo] = useState(false)
  const [showAllProducts, setShowAllProducts] = useState(false)
  const [einsatzbereich, setEinsatzbereich] = useState('')
  const [steinart,       setSteinart]       = useState('')
  const [farbe,           setFarbe]          = useState('')
  const [oberflaeche,     setOberflaeche]    = useState('')
  const [format,          setFormat]         = useState('')
  const [herkunft,        setHerkunft]       = useState('')
  const [groesse,         setGroesse]        = useState('')
  const [staerke,         setStaerke]        = useState('')

  const pathname = usePathname()
  const restoreKey = `bereich-state:${pathname}`

  // Zustand wiederherstellen, wenn man von einer Produktseite zurückkommt
  useEffect(() => {
    let saved: any = null
    try {
      const raw = sessionStorage.getItem(restoreKey)
      sessionStorage.removeItem(restoreKey)
      saved = raw ? JSON.parse(raw) : null
    } catch { /* sessionStorage nicht verfügbar */ }
    if (!saved || Date.now() - saved.ts > RESTORE_MAX_AGE_MS) return
    setShowAllProducts(!!saved.showAll)
    setEinsatzbereich(saved.einsatzbereich ?? '')
    setSteinart(saved.steinart ?? '')
    setFarbe(saved.farbe ?? '')
    setOberflaeche(saved.oberflaeche ?? '')
    setFormat(saved.format ?? '')
    setHerkunft(saved.herkunft ?? '')
    setGroesse(saved.groesse ?? '')
    setStaerke(saved.staerke ?? '')
    requestAnimationFrame(() => requestAnimationFrame(() => window.scrollTo(0, saved.scrollY ?? 0)))
  }, [restoreKey])

  function saveState() {
    try {
      sessionStorage.setItem(restoreKey, JSON.stringify({
        ts: Date.now(), scrollY: window.scrollY, showAll: showAllProducts,
        einsatzbereich, steinart, farbe, oberflaeche, format, herkunft, groesse, staerke,
      }))
    } catch { /* ignorieren */ }
  }

  const einsatzOptions = useMemo(() => uniqueValues(products, 'einsatzbereich'), [products])
  const materialOptions = useMemo(() => uniqueValues(products, 'material'), [products])
  const farbeOptions    = useMemo(() => uniqueValues(products, 'farbe'), [products])
  const surfaceOptions  = useMemo(
    () => [...new Set(products.flatMap(productSurfaces))].sort(),
    [products],
  )
  const formatOptions   = useMemo(() => uniqueValues(products, 'format'), [products])
  const herkunftOptions = useMemo(() => uniqueValues(products, 'origin'), [products])
  const staerkeOptions  = useMemo(
    () => [...new Set(products.flatMap(productThicknesses))]
      .sort((a, b) => parseFloat(a.replace(',', '.')) - parseFloat(b.replace(',', '.'))),
    [products],
  )
  // Größen nach Stärke gruppiert (aufsteigend), innerhalb der Gruppe natürlich sortiert
  const groesseGroups = useMemo(() => {
    const all = [...new Set(products.flatMap(productSizes))]
    const groups = new Map<string, string[]>()
    for (const label of all) {
      const t = thicknessOf(label)
      const key = t === null ? '' : formatThickness(t)
      groups.set(key, [...(groups.get(key) ?? []), label])
    }
    return [...groups.entries()]
      .map(([key, labels]) => ({
        key,
        value: key === '' ? Infinity : parseFloat(key.replace(',', '.')),
        labels: labels.sort((a, b) => a.localeCompare(b, 'de', { numeric: true })),
      }))
      .sort((a, b) => a.value - b.value)
  }, [products])
  const groesseOptions = useMemo(() => groesseGroups.flatMap((g) => g.labels), [groesseGroups])

  const filtered = useMemo(() => products.filter((p) =>
    (!einsatzbereich || splitValues(p.einsatzbereich).includes(einsatzbereich)) &&
    (!steinart       || splitValues(p.material).includes(steinart)) &&
    (!farbe          || splitValues(p.farbe).includes(farbe)) &&
    (!oberflaeche    || productSurfaces(p).includes(oberflaeche)) &&
    (!format         || splitValues(p.format).includes(format)) &&
    (!herkunft       || splitValues(p.origin).includes(herkunft)) &&
    (!groesse        || productSizes(p).includes(groesse)) &&
    (!staerke        || productThicknesses(p).includes(staerke))
  ), [products, einsatzbereich, steinart, farbe, oberflaeche, format, herkunft, groesse, staerke])

  const hasActiveFilter = !!(einsatzbereich || steinart || farbe || oberflaeche || format || herkunft || groesse || staerke)
  function resetFilters() {
    setEinsatzbereich(''); setSteinart(''); setFarbe(''); setOberflaeche('')
    setFormat(''); setHerkunft(''); setGroesse(''); setStaerke('')
  }

  const hasFilterOptions = einsatzOptions.length > 0 || materialOptions.length > 0 ||
    farbeOptions.length > 0 || surfaceOptions.length > 0 || formatOptions.length > 0 ||
    herkunftOptions.length > 0 || groesseOptions.length > 0 || staerkeOptions.length > 0

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
      {herkunftOptions.length > 0 && (
        <select className={styles.filterSelect} value={herkunft} onChange={(e) => setHerkunft(e.target.value)}>
          <option value="">Herkunft</option>
          {herkunftOptions.map((v) => <option key={v} value={v}>{v}</option>)}
        </select>
      )}
      {staerkeOptions.length > 0 && (
        <select className={styles.filterSelect} value={staerke} onChange={(e) => setStaerke(e.target.value)}>
          <option value="">Stärke</option>
          {staerkeOptions.map((v) => <option key={v} value={v}>{v}</option>)}
        </select>
      )}
      {groesseOptions.length > 0 && (
        <select className={styles.filterSelect} value={groesse} onChange={(e) => setGroesse(e.target.value)}>
          <option value="">Größe</option>
          {groesseGroups.map((g) => (
            <optgroup key={g.key || 'sonst'} label={g.key ? `Stärke ${g.key}` : 'Weitere'}>
              {g.labels.map((v) => <option key={v} value={v}>{v}</option>)}
            </optgroup>
          ))}
        </select>
      )}
      {hasActiveFilter && (
        <button type="button" className={styles.filterSelect} onClick={resetFilters}>
          Zurücksetzen
        </button>
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
                {backHref && <BackLink href={backHref} className={styles.heroBackLink} />}
                <p className={styles.heroBannerLabel}>{label}</p>
                <h1 className={styles.heroBannerTitle}>{title}</h1>
                {subtitle && <p className={styles.heroBannerSubtitle}>{subtitle}</p>}
                <div className={styles.heroActions}>
                  <button
                    type="button"
                    className={styles.infoBtn}
                    onClick={() => setShowInfo(true)}
                  >
                    <span className={styles.infoBtnIcon}>ⓘ</span>
                    Produktinformation
                  </button>
                  {heroLink && (
                    <a
                      href={heroLink.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.infoBtn}
                      style={{ textDecoration: 'none' }}
                    >
                      {heroLink.label}
                      <span className={styles.infoBtnIcon}>↗</span>
                    </a>
                  )}
                </div>
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
            {backHref && <BackLink href={backHref} className={styles.backLink} />}
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
        // Bewusst kein natives <details>/<summary>: auf iOS Safari klappt das
        // zu, sobald man eines der <select>-Filterfelder im geöffneten Bereich
        // antippt (bekannter Konflikt zwischen details-Toggle und verschachtelten
        // Formularelementen) — der Nutzer musste dann zweimal klicken. Eigener
        // useState-Toggle umgeht das komplett.
        <div className={styles.allProductsDetails} data-open={showAllProducts || undefined}>
          <button
            type="button"
            className={styles.allProductsSummary}
            onClick={() => setShowAllProducts((v) => !v)}
            aria-expanded={showAllProducts}
          >
            Alle Produkte anzeigen
            <span className={styles.allProductsCount}>({filtered.length})</span>
          </button>
          {showAllProducts && (
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
                    onClick={saveState}
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
                      <p className={styles.cardSurface}><SurfaceList product={product} /></p>
                      <span className={styles.cardCta}>Details & Anfrage →</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
          )}
        </div>
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
                  onClick={saveState}
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
                    <p className={styles.cardSurface}><SurfaceList product={product} /></p>
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
