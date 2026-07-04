import Link from 'next/link'
import styles from './Footer.module.css'

const LINKS_BEREICHE = [
  { label: 'Außenbereich',      href: '/aussen'            },
  { label: 'Innenbereich',      href: '/innen'             },
  { label: 'Sonderanfertigung', href: '/sonderanfertigung' },
  { label: 'Referenzen',        href: '/referenzen'        },
]

const LINKS_UNTERNEHMEN = [
  { label: 'Über uns',      href: '/ueber-uns'     },
  { label: 'Karriere',      href: '/karriere'      },
  { label: 'Weitere Infos', href: '/weitere-infos' },
]

const LINKS_RECHTLICH = [
  { label: 'Impressum',        href: '/impressum'      },
  { label: 'Datenschutz',      href: '/datenschutz'    },
  { label: 'AGB',              href: '/agb'            },
  { label: 'Widerrufsrecht',   href: '/widerrufsrecht' },
  { label: 'Versand & Zahlung', href: '/versand-zahlung' },
]

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>

        {/* Top Row */}
        <div className={styles.top}>

          {/* Brand */}
          <div className={styles.brand}>
            <Link href="/" className={styles.logo}>
              <span><span className={styles.logoAccent}>G</span>andl</span>
              <span className={styles.logoSub}>Natursteine</span>
            </Link>
            <p className={styles.tagline}>
              Naturstein für Außen, Innen<br />
              und Sonderanfertigungen.
            </p>
            <p className={styles.taglineSub}>München · Seit 1987</p>
          </div>

          {/* Bereiche */}
          <div className={styles.col}>
            <p className={styles.colTitle}>Bereiche</p>
            {LINKS_BEREICHE.map((l) => (
              <Link key={l.href} href={l.href} className={styles.colLink}>
                {l.label}
              </Link>
            ))}
          </div>

          {/* Unternehmen */}
          <div className={styles.col}>
            <p className={styles.colTitle}>Unternehmen</p>
            {LINKS_UNTERNEHMEN.map((l) => (
              <Link key={l.href} href={l.href} className={styles.colLink}>
                {l.label}
              </Link>
            ))}
          </div>

          {/* Kontakt */}
          <div className={styles.col}>
            <p className={styles.colTitle}>Kontakt</p>
            <a href="tel:+4981439974​0" className={styles.colLink}>+49 81 43 – 99 74 – 0</a>
            <a href="mailto:info@gandl-natursteine.de" className={styles.colLink}>
              info@gandl-natursteine.de
            </a>
            <p className={styles.colText}>
              Rudolf-Diesel-Ring 6<br />
              82266 Inning am Ammersee
            </p>
            <p className={styles.colText} style={{ marginTop: '12px' }}>
              Mo – Fr 8 – 12 / 13 – 17 Uhr<br />
              Sa 9 – 12 Uhr
            </p>
            <a href="/callback" className={styles.colLink} style={{ marginTop: '12px' }}>
              Rückruf anfordern →
            </a>
          </div>

          {/* CTA Block */}
          <div className={styles.ctaBlock}>
            <p className={styles.ctaLabel}>// Projekt anfragen</p>
            <p className={styles.ctaHeadline}>Ihr Stein,<br />unser Handwerk.</p>
            <Link href="/kontakt" className={styles.ctaBtn}>
              Jetzt anfragen
            </Link>
          </div>

        </div>

        {/* Divider */}
        <div className={styles.divider} />

        {/* Bottom Row */}
        <div className={styles.bottom}>
          <p className={styles.copy}>
            © {new Date().getFullYear()} <span className={styles.logoAccent}>G</span>andl Natursteine GmbH · Alle Rechte vorbehalten
          </p>
          <div className={styles.legal}>
            {LINKS_RECHTLICH.map((l) => (
              <Link key={l.href} href={l.href} className={styles.legalLink}>
                {l.label}
              </Link>
            ))}
          </div>
        </div>

      </div>
    </footer>
  )
}
