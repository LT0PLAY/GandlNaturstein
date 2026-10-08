import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://gandl-natursteine.de'
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/btob', '/auth', '/callback'],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  }
}
