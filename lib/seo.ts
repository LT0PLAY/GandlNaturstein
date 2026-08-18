/**
 * Zentrale SEO-Hilfsfunktionen für Gandl Natursteine
 */

export const SITE_NAME = 'Gandl Natursteine'
export const SITE_URL  = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://gandl-natursteine.de'
export const SITE_CITY = 'Inning am Ammersee'

/** Canonical-URL bauen */
export function canonical(path: string) {
  return `${SITE_URL}${path}`
}

/** JSON-LD für ein Produkt */
export function productJsonLd(product: {
  name: string
  description?: string | null
  thumbnail?: string | null
  images?: string[]
  material?: string | null
  surface?: string | null
  format?: string | null
  price?: number | null
  show_price?: boolean
  slug: string
}, path: string) {
  return {
    '@context': 'https://schema.org',
    '@type':    'Product',
    name:        product.name,
    url:         canonical(path),
    ...(product.description ? { description: product.description } : {}),
    ...(product.thumbnail   ? { image: product.thumbnail } : {}),
    brand: { '@type': 'Brand', name: SITE_NAME },
    ...(product.material ? { material: product.material } : {}),
    offers: {
      '@type':       'Offer',
      availability:  'https://schema.org/InStock',
      priceCurrency: 'EUR',
      ...(product.show_price && product.price != null
        ? { price: product.price, priceSpecification: { '@type': 'UnitPriceSpecification', price: product.price, priceCurrency: 'EUR', referenceQuantity: { '@type': 'QuantitativeValue', value: 1, unitCode: 'MTK' } } }
        : {}),
      seller: { '@type': 'Organization', name: SITE_NAME, address: { '@type': 'PostalAddress', addressLocality: SITE_CITY, addressCountry: 'DE' } },
    },
  }
}

/** JSON-LD für eine Referenz (CreativeWork) */
export function referenceJsonLd(ref: {
  title: string
  description?: string | null
  cover_image?: string | null
  year?: number | null
  spec_material?: string | null
  spec_location?: string | null
  slug: string
}) {
  return {
    '@context':   'https://schema.org',
    '@type':      'CreativeWork',
    name:          ref.title,
    url:           canonical(`/referenzen/${ref.slug}`),
    ...(ref.description   ? { description: ref.description }   : {}),
    ...(ref.cover_image   ? { image: ref.cover_image }         : {}),
    ...(ref.year          ? { dateCreated: String(ref.year) }  : {}),
    creator: { '@type': 'Organization', name: SITE_NAME },
    ...(ref.spec_location ? { locationCreated: { '@type': 'Place', name: ref.spec_location } } : {}),
  }
}

/** JSON-LD für eine Stellenanzeige */
export function jobJsonLd(job: {
  title: string
  description?: string | null
  location?: string | null
  employment_type?: string | null
  department?: string | null
  created_at: string
}) {
  const employmentTypeMap: Record<string, string> = {
    'Vollzeit':   'FULL_TIME',
    'Teilzeit':   'PART_TIME',
    'Minijob':    'PART_TIME',
    'Praktikum':  'INTERN',
    'Werkstudent':'PART_TIME',
    'Ausbildung': 'OTHER',
  }
  return {
    '@context':         'https://schema.org',
    '@type':            'JobPosting',
    title:               job.title,
    description:         job.description ?? job.title,
    datePosted:          job.created_at.slice(0, 10),
    hiringOrganization: { '@type': 'Organization', name: SITE_NAME, sameAs: SITE_URL },
    jobLocation: {
      '@type':  'Place',
      address: {
        '@type':           'PostalAddress',
        addressLocality:   job.location ?? SITE_CITY,
        addressCountry:    'DE',
      },
    },
    ...(job.employment_type && employmentTypeMap[job.employment_type]
      ? { employmentType: employmentTypeMap[job.employment_type] }
      : {}),
  }
}
