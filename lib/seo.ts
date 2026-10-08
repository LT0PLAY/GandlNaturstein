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

/** JSON-LD sicher für <script type="application/ld+json"> serialisieren.
 *  JSON.stringify() allein escaped "<" nicht — enthält ein Feld (z.B. ein von
 *  einem Mitarbeiter eingetippter Produktname/-beschreibung) zufällig oder
 *  absichtlich die Zeichenfolge "</script>", würde das den Script-Tag
 *  vorzeitig beenden und beliebiges HTML/JS in die öffentliche Seite
 *  einschleusen können. "<" → "<" verhindert das, ohne das JSON selbst
 *  zu verändern (JSON-Parser lesen < identisch zu <). */
export function jsonLdScript(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c')
}

/** Haupt-URL-Pfad eines Produkts (Hauptbereich), z. B. "/eigenproduktion/steel-grey".
 *  Ein Produkt kann über Mehrfachzuordnung in mehreren Bereichs-Listen auftauchen
 *  und ist dann unter mehreren Pfaden erreichbar — Canonical und Sitemap zeigen
 *  immer auf diesen einen Pfad, damit Google keine Duplikate sieht. */
export function productPath(product: { slug: string; bereich?: string | null; category?: { type?: string | null } | null }) {
  const bereich = product.bereich ?? product.category?.type ?? 'eigenproduktion'
  return `/${bereich}/${product.slug}`
}

/** JSON-LD für das Unternehmen (Startseite) */
export function localBusinessJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type':    'HomeAndConstructionBusiness',
    name:        'Gandl Natursteine GmbH',
    url:         SITE_URL,
    logo:        `${SITE_URL}/gandl-logo.png`,
    image:       `${SITE_URL}/opengraph-image.jpg`,
    description: 'Naturstein für Außen, Innen und Sonderanfertigungen – Handwerk seit 1987.',
    foundingDate: '1987',
    telephone:   '+49 8143 9974-0',
    email:       'info@gandl-natursteine.de',
    address: {
      '@type':         'PostalAddress',
      streetAddress:   'Rudolf-Diesel-Ring 6',
      postalCode:      '82266',
      addressLocality: SITE_CITY,
      addressCountry:  'DE',
    },
    openingHoursSpecification: [
      { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday','Tuesday','Wednesday','Thursday','Friday'], opens: '08:00', closes: '12:00' },
      { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday','Tuesday','Wednesday','Thursday','Friday'], opens: '13:00', closes: '17:00' },
    ],
  }
}

/** JSON-LD für ein Produkt */
export function productJsonLd(product: {
  name: string
  description?: string | null
  thumbnail?: string | null
  images?: string[]
  article_number?: string | null
  material?: string | null
  surface?: string | null
  format?: string | null
  price?: number | null
  show_price?: boolean
  slug: string
}, path: string) {
  const images = [product.thumbnail, ...(product.images ?? [])].filter((u): u is string => !!u)
  const uniqueImages = [...new Set(images)]
  const hasPrice = !!product.show_price && product.price != null
  return {
    '@context': 'https://schema.org',
    '@type':    'Product',
    name:        product.name,
    url:         canonical(path),
    ...(product.description ? { description: product.description } : {}),
    ...(uniqueImages.length ? { image: uniqueImages } : {}),
    ...(product.article_number ? { sku: product.article_number } : {}),
    brand: { '@type': 'Brand', name: SITE_NAME },
    ...(product.material ? { material: product.material } : {}),
    // Ein Offer ohne Preis gilt bei Google als fehlerhaft — daher nur mit Preis ausgeben.
    ...(hasPrice ? {
      offers: {
        '@type':       'Offer',
        url:           canonical(path),
        availability:  'https://schema.org/InStock',
        priceCurrency: 'EUR',
        price:         product.price,
        seller: { '@type': 'Organization', name: SITE_NAME, address: { '@type': 'PostalAddress', addressLocality: SITE_CITY, addressCountry: 'DE' } },
      },
    } : {}),
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
