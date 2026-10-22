'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import type { BasketItem, ProductUnit } from '@/lib/types'
import { normalizeUnit, isFractionalUnit, basketLineKey, MAX_BASKET_QUANTITY } from '@/lib/types'

const STORAGE_KEY = 'gandl-basket'

interface BasketContextValue {
  items:        BasketItem[]
  isOpen:       boolean
  openDrawer:   () => void
  closeDrawer:  () => void
  addItem:      (item: Omit<BasketItem, 'quantity' | 'unit'> & { unit?: ProductUnit }) => void
  /** lineKey = basketLineKey(productId, size, surface) */
  removeItem:   (lineKey: string) => void
  updateQty:    (lineKey: string, quantity: number) => void
  clearBasket:  () => void
  hasItem:      (productId: string, size?: string | null, surface?: string | null) => boolean
  totalCount:   number
}

const BasketContext = createContext<BasketContextValue | null>(null)

export function BasketProvider({ children }: { children: React.ReactNode }) {
  const [items,   setItems]   = useState<BasketItem[]>([])
  const [isOpen,  setIsOpen]  = useState(false)
  const [mounted, setMounted] = useState(false)

  // Aus localStorage laden (nur client-side)
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored) as BasketItem[]
        setItems(parsed.map((i) => ({ ...i, unit: normalizeUnit(i.unit) })))
      }
    } catch {}
    setMounted(true)
  }, [])

  // In localStorage speichern wenn items sich ändern
  useEffect(() => {
    if (!mounted) return
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)) } catch {}
  }, [items, mounted])

  const openDrawer  = useCallback(() => setIsOpen(true),  [])
  const closeDrawer = useCallback(() => setIsOpen(false), [])

  const addItem = useCallback((newItem: Omit<BasketItem, 'quantity' | 'unit'> & { unit?: ProductUnit }) => {
    setItems((prev) => {
      const key = basketLineKey(newItem.productId, newItem.size, newItem.surface)
      if (prev.find((i) => basketLineKey(i.productId, i.size, i.surface) === key)) return prev
      const unit: ProductUnit = newItem.unit ?? 'stueck'
      return [...prev, { ...newItem, quantity: 1, unit }]
    })
    setIsOpen(true)
  }, [])

  const removeItem = useCallback((lineKey: string) => {
    setItems((prev) => prev.filter((i) => basketLineKey(i.productId, i.size, i.surface) !== lineKey))
  }, [])

  const updateQty = useCallback((lineKey: string, quantity: number) => {
    setItems((prev) => prev.map((i) => {
      if (basketLineKey(i.productId, i.size, i.surface) !== lineKey) return i
      const isFractional = isFractionalUnit(i.unit)
      const min  = isFractional ? 0.5 : 1
      // Kommazahlen auf 2 Stellen runden (Eingabe per Tastatur), sonst ganze Zahl
      const step = isFractional ? Math.round(quantity * 100) / 100 : Math.round(quantity)
      if (!Number.isFinite(step)) return i
      return { ...i, quantity: Math.min(MAX_BASKET_QUANTITY, Math.max(min, step)) }
    }))
  }, [])

  const clearBasket = useCallback(() => setItems([]), [])
  const hasItem     = useCallback(
    (productId: string, size?: string | null, surface?: string | null) => {
      const key = basketLineKey(productId, size, surface)
      return items.some((i) => basketLineKey(i.productId, i.size, i.surface) === key)
    },
    [items],
  )
  const totalCount  = items.length

  return (
    <BasketContext.Provider value={{
      items, isOpen, openDrawer, closeDrawer,
      addItem, removeItem, updateQty,
      clearBasket, hasItem, totalCount,
    }}>
      {children}
    </BasketContext.Provider>
  )
}

export function useBasket() {
  const ctx = useContext(BasketContext)
  if (!ctx) throw new Error('useBasket must be used within BasketProvider')
  return ctx
}
