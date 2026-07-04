import type { CategoryBereich, CategoryLocation } from '@/lib/types'

/** Leitet zur richtigen Produkt-URL weiter, basierend auf Bereich + Location */
export function getProductUrl(opts: {
  slug:             string
  categoryType:     CategoryBereich | null | undefined
  categoryLocation: CategoryLocation | null | undefined
}): string {
  const { slug, categoryType, categoryLocation } = opts
  if (categoryType === 'sonderanfertigung') return `/sonderanfertigung/${slug}`
  if (categoryType === 'extras')            return `/extras/${slug}`
  // aussen/innen anhand location, fallback auf aussen
  const location = categoryLocation ?? 'aussen'
  return `/${location}/${slug}`
}
