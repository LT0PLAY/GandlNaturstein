import type { CategoryBereich } from '@/lib/types'

/** Leitet zur richtigen Produkt-URL weiter, basierend auf dem Bereich */
export function getProductUrl(opts: {
  slug:    string
  bereich: CategoryBereich | null | undefined
}): string {
  const { slug, bereich } = opts
  return `/${bereich ?? 'eigenproduktion'}/${slug}`
}
