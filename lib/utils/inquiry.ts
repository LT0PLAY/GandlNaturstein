import type { InquiryItem } from '@/lib/types'

/** Kurztext für die Anfragen-Liste: "Produkt A", "Produkt A +2 weitere" oder "—". */
export function inquiryProductSummary(inq: {
  items?: InquiryItem[] | null
  product?: { name: string } | null
}): string {
  const items = Array.isArray(inq.items) ? inq.items : []
  if (items.length > 1) return `${items[0].name} +${items.length - 1} weitere`
  if (items.length === 1) return items[0].name
  return inq.product?.name ?? '—'
}

/** Anfrage-Nummer zum Ablegen/Telefonieren, z. B. "A-20261022-3F9C". */
export function inquiryNumber(id: string, createdAt: string): string {
  const day = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Berlin' }).format(new Date(createdAt)).replace(/-/g, '')
  return `A-${day}-${id.replace(/-/g, '').slice(0, 4).toUpperCase()}`
}

/** Datum und Uhrzeit in deutscher Zeit (der Server läuft in UTC). */
export function formatDateTime(iso: string): string {
  return new Intl.DateTimeFormat('de-DE', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Berlin',
  }).format(new Date(iso))
}

/** Kurzform für Chat-Blasen, z. B. "22.10., 06:22". */
export function formatChatTime(iso: string): string {
  return new Intl.DateTimeFormat('de-DE', {
    day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Berlin',
  }).format(new Date(iso))
}
