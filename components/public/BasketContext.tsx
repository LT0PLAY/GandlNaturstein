'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import type { BasketItem, ProductUnit } from '@/lib/types'
import { normalizeUnit } from '@/lib/types'

const STORAGE_KEY = 'gandl-basket'

interface BasketContextValue {
  items:        BasketItem[]
  isOpen:       boolean
  openDrawer:   () => void
  closeDrawer:  () => void
  addItem:      (item: Omit<BasketItem, 'quantity' | 'unit'> & { unit?: ProductUnit }) => void
  removeItem:   (productId: string) => void
  updateQty:    (productId: string, quantity: number) => void
  clearBasket:  () => void
  hasItem:      (productId: string) => boolean
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
      if (prev.find((i) => i.productId === newItem.productId)) return prev
      const unit: ProductUnit = newItem.unit ?? 'stueck'
      return [...prev, { ...newItem, quantity: 1, unit }]
    })
    setIsOpen(true)
  }, [])

  const removeItem = useCallback((productId: string) => {
    setItems((prev) => prev.filter((i) => i.productId !== productId))
  }, [])

  const updateQty = useCallback((productId: string, quantity: number) => {
    setItems((prev) => prev.map((i) => {
      if (i.productId !== productId) return i
      const isFractional = i.unit === 'qm' || i.unit === 'laufmeter' || i.unit === 'gewicht'
      const min  = isFractional ? 0.5 : 1
      const step = isFractional ? quantity : Math.round(quantity)
      return { ...i, quantity: Math.max(min, step) }
    }))
  }, [])

  const clearBasket = useCallback(() => setItems([]), [])
  const hasItem     = useCallback((productId: string) => items.some((i) => i.productId === productId), [items])
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
