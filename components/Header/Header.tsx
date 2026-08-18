'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import clsx from 'clsx'
import styles from './Header.module.css'

const NAV_ITEMS = [
  { label: 'Außen',              href: '/aussen'            },
  { label: 'Innen',              href: '/innen'             },
  { label: 'Sonderanfertigung',  href: '/sonderanfertigung' },
  { label: 'Referenzen',         href: '/referenzen'        },
]

export default function Header() {
  const pathname = usePathname()

  return (
    <header className={styles.header}>
      <div className={styles.inner}>

        {/* Logo */}
        <Link href="/" className={styles.logo}>
          <span className={styles.logoMain}>Gandl</span>
          <span className={styles.logoSub}>Natursteine</span>
        </Link>

        {/* Navigation */}
        <nav className={styles.nav}>
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                styles.navLink,
                pathname.startsWith(item.href) && styles.navLinkActive
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* CTA */}
        <Link href="/kontakt" className={styles.cta}>
          Anfrage
        </Link>

      </div>
    </header>
  )
}
