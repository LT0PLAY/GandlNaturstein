import type { Metadata } from 'next'
import { Bebas_Neue, Inter, Playfair_Display } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { SITE_NAME, SITE_URL } from '@/lib/seo'
import './globals.css'

const bebas = Bebas_Neue({
  weight: ['400'], subsets: ['latin'], variable: '--font-bebas',
})
const inter = Inter({
  subsets: ['latin'], variable: '--font-inter',
})
const playfair = Playfair_Display({
  subsets: ['latin'], variable: '--font-playfair', style: ['normal', 'italic'],
})

const TITLE = 'Gandl Natursteine – Handwerk seit 1987'
const DESCRIPTION = 'Naturstein für Außen, Innen und Sonderanfertigungen in München und Bayern.'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description: DESCRIPTION,
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: SITE_URL,
    siteName: SITE_NAME,
    locale: 'de_DE',
    type: 'website',
    images: [
      {
        url: '/opengraph-image.jpg',
        width: 1200,
        height: 630,
        alt: TITLE,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
    images: ['/opengraph-image.jpg'],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" className={`${bebas.variable} ${inter.variable} ${playfair.variable}`}>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
