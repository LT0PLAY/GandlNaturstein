'use client'

import { useState, useEffect, useRef, useTransition, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { searchProducts, type SearchResult } from '@/lib/actions/search'
import { getProductUrl } from '@/lib/utils/product-url'
import { BEREICH_LABELS } from '@/lib/types'
import styles from './SearchModal.module.css'

interface Props {
  isOpen:  boolean
  onClose: () => void
}

export default function SearchModal({ isOpen, onClose }: Props) {
  const [query,   setQuery]   = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [active,  setActive]  = useState(-1)
  const [isPending, startTransition] = useTransition()
  const inputRef = useRef<HTMLInputElement>(null)
  const router   = useRouter()

  // Fokus beim Öffnen
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50)
      setQuery('')
      setResults([])
      setActive(-1)
    }
  }, [isOpen])

  // Escape schließt
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  // Suche mit Debounce
  const search = useCallback((q: string) => {
    if (q.trim().length < 2) { setResults([]); return }
    startTransition(async () => {
      const res = await searchProducts(q)
      setResults(res)
      setActive(-1)
    })
  }, [])

  useEffect(() => {
    const t = setTimeout(() => search(query), 250)
    return () => clearTimeout(t)
  }, [query, search])

  function navigate(result: SearchResult) {
    router.push(getProductUrl(result))
    onClose()
  }

  // Tastatur-Navigation in Ergebnissen
  function onKeyDown(e: React.KeyboardEvent) {
    if (!results.length) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActive((a) => Math.min(a + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((a) => Math.max(a - 1, -1))
    } else if (e.key === 'Enter' && active >= 0) {
      e.preventDefault()
      navigate(results[active])
    }
  }

  if (!isOpen) return null

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>

        {/* Suchfeld */}
        <div className={styles.inputRow}>
          <svg className={styles.searchIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            ref={inputRef}
            className={styles.input}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Produkt, Material, Oberfläche suchen…"
            autoComplete="off"
            spellCheck={false}
          />
          {isPending && <span className={styles.spinner} />}
          <kbd className={styles.esc} onClick={onClose}>Esc</kbd>
        </div>

        {/* Ergebnisse */}
        {results.length > 0 && (
          <ul className={styles.results}>
            {results.map((r, i) => (
              <li key={r.id}>
                <button
                  className={`${styles.result} ${active === i ? styles.resultActive : ''}`}
                  onClick={() => navigate(r)}
                  onMouseEnter={() => setActive(i)}
                >
                  {r.thumbnail
                    ? <img src={r.thumbnail} alt={r.name} className={styles.thumb} />
                    : <div className={styles.thumbPlaceholder}><span>{r.material?.[0] ?? '●'}</span></div>}
                  <div className={styles.resultInfo}>
                    <p className={styles.resultName}>{highlight(r.name, query)}</p>
                    <p className={styles.resultMeta}>
                      {r.categoryName ?? BEREICH_LABELS[r.categoryType] ?? r.categoryType}
                      {r.material ? ` · ${r.material}` : ''}
                      {r.surface  ? ` · ${r.surface}`  : ''}
                      {r.article_number ? ` · #${r.article_number}` : ''}
                    </p>
                  </div>
                  <span className={styles.resultArrow}>→</span>
                </button>
              </li>
            ))}
          </ul>
        )}

        {/* Kein Ergebnis */}
        {query.length >= 2 && results.length === 0 && !isPending && (
          <div className={styles.empty}>
            <p>Kein Produkt für <strong>&ldquo;{query}&rdquo;</strong> gefunden.</p>
          </div>
        )}

        {/* Footer */}
        <div className={styles.footer}>
          <span><kbd>↑↓</kbd> navigieren</span>
          <span><kbd>↵</kbd> öffnen</span>
          <span><kbd>Esc</kbd> schließen</span>
        </div>
      </div>
    </div>
  )
}

// Suchbegriff im Text hervorheben
function highlight(text: string, query: string) {
  if (!query.trim()) return text
  const regex = new RegExp(`(${query.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
  const parts = text.split(regex)
  return parts.map((part, i) =>
    regex.test(part)
      ? <mark key={i} style={{ background: 'rgba(196,146,58,0.25)', color: '#C4923A', borderRadius: '2px' }}>{part}</mark>
      : part
  )
}
