export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import { getProductBySlug } from '@/lib/queries/products'
import ProductDetail from '@/components/public/ProductDetail'
import { canonical, jsonLdScript, productJsonLd, SITE_NAME } from '@/lib/seo'
import type { Metadata } from 'next'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const p = await getProductBySlug(slug)
  if (!p) return { title: 'Produkt nicht gefunden' }
  const desc = p.description ?? `${p.name} – Naturstein von ${SITE_NAME}.`
  return {
    title:       `${p.name} | ${SITE_NAME}`,
    description: desc,
    alternates:  { canonical: canonical(`/eigenproduktion/${slug}`) },
    openGraph: {
      title:  `${p.name} – ${SITE_NAME}`,
      description: desc,
      images: p.thumbnail ? [{ url: p.thumbnail, alt: p.name }] : [],
      type:   'website',
    },
  }
}

export default async function eigenproduktionProduktPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const product = await getProductBySlug(slug)
  if (!product) notFound()

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(productJsonLd(product, `/eigenproduktion/${slug}`)) }} />
      <ProductDetail product={product!} backHref="/eigenproduktion" backLabel="Zurück" />
    </>
  )
}
