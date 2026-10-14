'use client'

import type { Category } from '@/lib/types'

// Position des Produkts in jeder zusätzlich gewählten Kategorie. Leer = es gilt
// die allgemeine "Reihenfolge" des Produkts. Kleinere Zahl = weiter vorne.
export default function ExtraCategoryOrder({
  categories, selectedIds, initialOrders = {},
}: {
  categories: Category[]
  selectedIds: string[]
  initialOrders?: Record<string, number | null>
}) {
  const selected = categories.filter((c) => selectedIds.includes(c.id))
  if (selected.length === 0) return null

  return (
    <div style={{
      marginTop: '12px', padding: '12px 14px',
      border: '1px solid rgba(155,174,159,0.25)', borderRadius: '4px',
      background: 'rgba(155,174,159,0.03)',
    }}>
      <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', margin: '0 0 10px' }}>
        Position in der jeweiligen Kategorie — kleinere Zahl = weiter vorne, leer = wie die allgemeine
        Reihenfolge des Produkts.
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px 22px' }}>
        {selected.map((cat) => (
          <label key={cat.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
            <span>{cat.name}</span>
            <input
              name={`category_sort_${cat.id}`}
              type="number"
              min="0"
              step="1"
              placeholder="–"
              defaultValue={initialOrders[cat.id] ?? ''}
              style={{ width: '80px' }}
            />
          </label>
        ))}
      </div>
    </div>
  )
}
