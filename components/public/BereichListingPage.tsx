'use client'

import ProductCardImage from '@/components/public/ProductCardImage'

import { useState } from 'react'
import Link from 'next/link'
import CategoryFilter from '@/components/public/CategoryFilter'
import type { Product, Category } from '@/lib/types'
import styles from '@/app/(public)/category.module.css'

interface Props {
  title:            string
  label:            string
  aussenProducts:   Product[]
  innenProducts:    Product[]
  aussenCategories: Category[]
  innenCategories:  Category[]
  aussenSubtitle?:  string
  innenSubtitle?:   string
}

export default function BereichListingPage({
  title, label,
  aussenProducts, innenProducts,
  aussenCategories, innenCategories,
  aussenSubtitle, innenSubtitle,
}: Props) {
  const [location, setLocation] = useState<'aussen' | 'innen'>('aussen')

  const products   = location === 'aussen' ? aussenProducts   : innenProducts
  const categories = location === 'aussen' ? aussenCategories : innenCategories
  const basePath   = location === 'aussen' ? '/aussen'        : '/innen'
  const subtitle   = location === 'aussen' ? aussenSubtitle   : innenSubtitle

  return (
    <section className={styles.page}>

      {/* Hero */}
      <div className={styles.hero}>
        <p className={styles.label}>// {label}</p>
        <h1 className={styles.title}>{title}</h1>
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
      </div>

      {/* Außen / Innen Tabs */}
      <div className="loc-tabs">
        <button
          className={`loc-tab${location === 'aussen' ? ' loc-active' : ''}`}
          onClick={() => setLocation('aussen')}
        >
          Außenbereich
        </button>
        <button
          className={`loc-tab${location === 'innen' ? ' loc-active' : ''}`}
          onClick={() => setLocation('innen')}
        >
          Innenbereich
        </button>
      </div>

      {/* Unterkategorie-Filter */}
      <CategoryFilter categories={categories} basePath={basePath} />

      {/* Produkte */}
      {products.length === 0 ? (
        <div className={styles.empty}>
          <p>Keine Produkte in dieser Kategorie.</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {products.map((product) => (
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
                  placeholderLabel={product.material ?? 'Naturstein'}
                />
                {(product.category as any)?.name && (
                  <span className={styles.categoryBadge}>{(product.category as any).name}</span>
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

      <style>{`
        .loc-tabs {
          display: flex;
          gap: 0;
          margin-bottom: 28px;
          border-bottom: 0.5px solid rgba(155, 174, 159,0.12);
        }
        .loc-tab {
          font-family: var(--font-inter), sans-serif;
          font-size: 14px;
          font-weight: 500;
          letter-spacing: .1em;
          text-transform: uppercase;
          padding: 10px 28px;
          border: none;
          border-bottom: 2px solid transparent;
          background: none;
          color: var(--color-text-muted);
          cursor: pointer;
          transition: color .2s, border-color .2s;
          margin-bottom: -1px;
        }
        .loc-tab:hover { color: #dcdcd6; }
        .loc-active {
          color: var(--color-sage) !important;
          border-bottom-color: var(--color-sage);
        }
      `}</style>
    </section>
  )
}
