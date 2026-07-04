import type { Metadata } from 'next'
import { Bebas_Neue, Inter, Playfair_Display } from 'next/font/google'
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

export const metadata: Metadata = {
  title: 'Gandl Natursteine – Handwerk seit 1987',
  description: 'Naturstein für Außen, Innen und Sonderanfertigungen in München und Bayern.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" className={`${bebas.variable} ${inter.variable} ${playfair.variable}`}>
      <body>{children}</body>
    </html>
  )
}
