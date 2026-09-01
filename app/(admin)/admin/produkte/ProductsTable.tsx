'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { moveProductToTrash } from '@/lib/actions/products'
import DeleteButton from '@/components/admin/DeleteButton'
import styles from '../table.module.css'

function getPublicUrl(p: any): string {
  const bereich = p.bereich ?? p.category?.type ?? 'eigenproduktion'
  return `/${bereich}/${p.slug}`
}

// Normalisiert für die Suche: Umlaute/Akzente + Groß-/Kleinschreibung egal machen,
// damit auch bei Zehntausenden Produkten sofort das Richtige gefunden wird.
function normalize(v: unknown): string {
  return String(v ?? '')
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
}

export default function ProductsTable({ products }: { products: any[] }) {
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = normalize(query.trim())
    if (!q) return products
    const terms = q.split(/\s+/).filter(Boolean)

    return products.filter((p) => {
      const haystack = normalize([
        p.name, p.material, p.farbe, p.article_number, p.format,
        p.einsatzbereich, p.surface, p.origin, p.category?.name,
        ...(Array.isArray(p.sizes) ? p.sizes.flatMap((s: any) => [s.label, s.article_number]) : []),
      ].join(' '))
      return terms.every((t) => haystack.includes(t))
    })
  }, [products, query])

  return (
    <>
      <div className={styles.searchBar}>
        <svg className={styles.searchIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
        <input
          type="text"
          className={styles.searchInput}
          placeholder="Suche nach Name, Artikelnr., Farbe, Material, Format …"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {query.trim() && (
        <p className={styles.searchResultCount}>
          {filtered.length} von {products.length} Produkten
        </p>
      )}

      {filtered.length === 0 ? (
        <div className={styles.empty}>
          <p>Kein Produkt für „{query}" gefunden.</p>
        </div>
      ) : (
        <div className={styles.tableScroll}>
<table className={styles.table}>
          <thead>
            <tr>
              <th>Bild</th>
              <th>Name</th>
              <th>Artikelnr.</th>
              <th>Material</th>
              <th>Farbe</th>
              <th>Kategorie</th>
              <th>Status</th>
              <th>Aktionen</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p: any) => (
              <tr key={p.id} style={p.delete_pending ? { opacity: 0.55, background: 'rgba(224,96,96,0.04)' } : undefined}>
                <td>
                  {p.thumbnail || p.images?.[0]
                    ? <img src={p.thumbnail ?? p.images[0]} alt={p.name} className={styles.thumb} />
                    : <div className={styles.thumbEmpty}>—</div>
                  }
                </td>
                <td className={styles.tdName} data-label="Name">
                  {p.name}
                  {p.delete_pending && (
                    <span style={{ marginLeft: '8px', fontSize: '12px', color: '#E06060', letterSpacing: '.06em', fontFamily: 'var(--font-inter)' }}>
                      ⏳ LÖSCHANTRAG
                    </span>
                  )}
                </td>
                <td className={styles.tdMuted} data-label="Artikelnr.">{p.article_number ?? '—'}</td>
                <td className={styles.tdMuted} data-label="Material">{p.material ?? '—'}</td>
                <td className={styles.tdMuted} data-label="Farbe">{p.farbe ?? '—'}</td>
                <td className={styles.tdMuted} data-label="Kategorie">{(p.category as any)?.name ?? '—'}</td>
                <td data-label="Status">
                  <span className={styles.badge} data-active={p.is_active}>
                    {p.is_active ? 'Aktiv' : 'Inaktiv'}
                  </span>
                </td>
                <td className={styles.tdActionsCell}>
                  <div className={styles.btnGroup}>
                    <Link href={`/admin/produkte/${p.id}`} className={styles.btnEdit}>
                      Bearbeiten
                    </Link>
                    <a
                      href={getPublicUrl(p)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.btnEdit}
                      style={{ opacity: 0.7 }}
                    >
                      ↗ Vorschau
                    </a>
                    {p.delete_pending ? (
                      <span style={{ fontSize: '13px', color: '#E06060', fontFamily: 'var(--font-inter)', padding: '0 8px' }}>
                        <Link href="/admin/papierkorb" style={{ color: '#E06060', textDecoration: 'none' }}>→ Im Papierkorb</Link>
                      </span>
                    ) : (
                      <DeleteButton
                        action={moveProductToTrash.bind(null, p.id)}
                        confirmMsg={`Produkt „${p.name}" in den Papierkorb verschieben?`}
                        label="Papierkorb"
                        className={styles.btnDelete}
                      />
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
</div>
      )}
    </>
  )
}
