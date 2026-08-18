'use client'

import { useBasket } from '@/components/public/BasketContext'
import type { Restposten } from '@/lib/types'

export default function RestpostenAddButton({ item }: { item: Restposten }) {
  const { addItem, hasItem } = useBasket()
  const basketId = `restposten:${item.id}`
  const inBasket = hasItem(basketId)

  return (
    <button
      type="button"
      disabled={inBasket}
      onClick={() => addItem({
        productId:    basketId,
        productName:  item.title,
        productSlug:  '',
        categoryType: 'extras',
        thumbnail:    item.images?.[0] ?? null,
        price:        item.price,
        show_price:   item.price != null,
        sourceType:   'restposten',
        unit:         'stueck',
      })}
      style={{
        background: inBasket ? 'transparent' : 'var(--color-sage)',
        border: inBasket ? '1px solid var(--color-sage)' : 'none',
        color: inBasket ? 'var(--color-sage)' : 'var(--color-bg)',
        fontFamily: 'var(--font-bebas)',
        fontSize: '14px',
        letterSpacing: '.1em',
        padding: '9px 18px',
        cursor: inBasket ? 'default' : 'pointer',
      }}
    >
      {inBasket ? 'Im Anfragekorb ✓' : 'In den Anfragekorb →'}
    </button>
  )
}
