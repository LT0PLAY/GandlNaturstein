'use client'

import { useEffect, useState } from 'react'
import styles from '@/app/(admin)/admin/form.module.css'

export interface VariantRow {
  label:          string
  price?:         string
  article_number?: string
  /** Nur bei Größenvarianten: welche der global angelegten Oberflächen zu dieser
   *  Größe passen. Leer/undefined = alle Oberflächen des Produkts erlaubt. */
  surfaces?:      string[]
}

interface Props {
  /** Präfix für die Formularfeldnamen, z.B. "size" → size_label_0, size_price_0, … */
  namePrefix:   string
  initial:      VariantRow[]
  max?:         number
  /** true = Preis + Artikelnummer pro Zeile (Größenvarianten), false = nur ein Textfeld (Oberflächen) */
  withPriceAndArticle?: boolean
  labelPlaceholder: (index: number) => string
  addLabel:     string
  emptyHint?:   string
  /** Meldet die aktuelle Zeilenliste nach oben — z.B. damit die Oberflächen-Liste
   *  als Auswahl in der Größenvarianten-Liste verfügbar ist. */
  onRowsChange?: (rows: VariantRow[]) => void
  /** Nur bei Größenvarianten: die global angelegten Oberflächen, aus denen der
   *  Admin pro Größe eine Teilmenge auswählen kann. */
  surfaceOptions?: string[]
}

// Wiederverwendbare Zeilen-Liste mit Plus/Minus — für Größenvarianten UND
// Oberflächen-Varianten im Produktformular. Startet ohne Zeile; der Admin
// legt über „+ hinzufügen" beliebig viele an (bis zum jeweiligen Maximum).
export default function VariantsEditor({
  namePrefix,
  initial,
  max = 8,
  withPriceAndArticle = false,
  labelPlaceholder,
  addLabel,
  emptyHint,
  onRowsChange,
  surfaceOptions,
}: Props) {
  const [rows, setRows] = useState<VariantRow[]>(initial)

  useEffect(() => {
    onRowsChange?.(rows)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows])

  function addRow() {
    if (rows.length >= max) return
    setRows((r) => [...r, { label: '' }])
  }
  function removeRow(i: number) {
    setRows((r) => r.filter((_, idx) => idx !== i))
  }
  function updateRow(i: number, patch: Partial<VariantRow>) {
    setRows((r) => r.map((row, idx) => (idx === i ? { ...row, ...patch } : row)))
  }
  function toggleRowSurface(i: number, surface: string) {
    setRows((r) => r.map((row, idx) => {
      if (idx !== i) return row
      const current = row.surfaces ?? []
      const next = current.includes(surface) ? current.filter((s) => s !== surface) : [...current, surface]
      return { ...row, surfaces: next }
    }))
  }

  const hasSurfacePicker = withPriceAndArticle && (surfaceOptions?.length ?? 0) > 0

  return (
    <div className={styles.variantList}>
      {rows.length === 0 && emptyHint && (
        <p className={styles.variantEmptyHint}>{emptyHint}</p>
      )}

      {rows.map((row, i) => (
        <div key={i} className={withPriceAndArticle ? styles.sizeRowWrap : undefined}>
          <div className={withPriceAndArticle ? styles.sizeRow : styles.variantRow} style={{ marginBottom: 0 }}>
            <input
              name={`${namePrefix}_label_${i}`}
              type="text"
              placeholder={labelPlaceholder(i)}
              value={row.label}
              onChange={(e) => updateRow(i, { label: e.target.value })}
              className={withPriceAndArticle ? styles.sizeLabelInput : styles.variantRowInput}
            />
            {withPriceAndArticle && (
              <>
                <input
                  name={`${namePrefix}_price_${i}`}
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Preis (optional)"
                  value={row.price ?? ''}
                  onChange={(e) => updateRow(i, { price: e.target.value })}
                  className={styles.sizePriceInput}
                />
                <input
                  name={`${namePrefix}_article_${i}`}
                  type="text"
                  placeholder="Artikelnr. (optional)"
                  value={row.article_number ?? ''}
                  onChange={(e) => updateRow(i, { article_number: e.target.value })}
                  className={styles.sizeArticleInput}
                />
              </>
            )}
            <button
              type="button"
              className={styles.variantRemoveBtn}
              onClick={() => removeRow(i)}
              aria-label="Entfernen"
            >
              −
            </button>
          </div>

          {hasSurfacePicker && (
            <div className={styles.sizeSurfacePicker}>
              <p className={styles.sizeSurfacePickerLabel}>
                Verfügbare Oberflächen für diese Variante <span>— nichts angehakt = alle Oberflächen erlaubt</span>
              </p>
              <div className={styles.sizeSurfaceCheckList}>
                {surfaceOptions!.map((surface) => (
                  <label key={surface} className={styles.sizeSurfaceCheckItem}>
                    <input
                      type="checkbox"
                      name={`${namePrefix}_surfaces_${i}`}
                      value={surface}
                      checked={(row.surfaces ?? []).includes(surface)}
                      onChange={() => toggleRowSurface(i, surface)}
                    />
                    {surface}
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}

      <button
        type="button"
        className={styles.variantAddBtn}
        onClick={addRow}
        disabled={rows.length >= max}
      >
        + {addLabel}
      </button>
    </div>
  )
}
