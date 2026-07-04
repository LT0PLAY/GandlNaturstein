'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect, useRef, useCallback } from 'react'
import clsx from 'clsx'
import SearchModal from '@/components/public/SearchModal'
import styles from './Navbar.module.css'
import type { NavBereich, NavCategory } from './NavWrapper'

interface Props {
  bereiche?:         NavBereich[]
  extrasCategories?: NavCategory[]
}

// ── Haupt-Dropdown für einen Bereich (Massiv/Sonder/Garten) ──────
function BereichDropdown({
  bereich, isActive,
}: {
  bereich: NavBereich
  isActive: boolean
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const openMenu  = () => { clearTimeout(closeTimer.current); setOpen(true) }
  const closeMenu = () => { closeTimer.current = setTimeout(() => setOpen(false), 220) }

  useEffect(() => {
    function onOut(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    if (open) document.addEventListener('mousedown', onOut)
    return () => document.removeEventListener('mousedown', onOut)
  }, [open])

  const hasAussen = bereich.aussen.length > 0
  const hasInnen  = bereich.innen.length  > 0
  const hasAny    = hasAussen || hasInnen

  // Hauptlink: jeder Bereich hat seine eigene Seite
  const mainHref = `/${bereich.key}`

  return (
    <div
      ref={ref}
      className={styles.dropdown}
      onMouseEnter={openMenu}
      onMouseLeave={closeMenu}
    >
      <Link
        href={mainHref}
        className={clsx(styles.navLink, styles.dropdownTrigger, isActive && styles.active)}
        onClick={() => setOpen(false)}
      >
        {bereich.label}
        <svg
          className={clsx(styles.chevron, open && styles.chevronOpen)}
          width="9" height="9" viewBox="0 0 10 10" fill="none"
          stroke="currentColor" strokeWidth="1.5"
        >
          <path d="M2 3.5 L5 6.5 L8 3.5"/>
        </svg>
      </Link>

      {open && (
        <div className={styles.dropdownMenu}>
          {!hasAny ? (
            /* Noch keine Unterkategorien → zeige statische Links */
            <>
              <Link href="/aussen"  className={styles.dropdownItem} onClick={() => setOpen(false)}>Außenbereich</Link>
              <Link href="/innen"   className={styles.dropdownItem} onClick={() => setOpen(false)}>Innenbereich</Link>
            </>
          ) : (
            <>
              {/* Außen-Gruppe */}
              {(hasAussen || true) && (
                <div className={styles.dropdownGroup}>
                  <Link href="/aussen" className={styles.dropdownGroupLabel} onClick={() => setOpen(false)}>
                    Außenbereich →
                  </Link>
                  {bereich.aussen.map((cat) => (
                    <Link
                      key={cat.slug}
                      href={`/aussen/kategorie/${cat.slug}`}
                      className={styles.dropdownItem}
                      onClick={() => setOpen(false)}
                    >
                      {cat.name}
                    </Link>
                  ))}
                  {!hasAussen && (
                    <span className={styles.dropdownEmpty}>Keine Kategorien</span>
                  )}
                </div>
              )}

              {/* Innen-Gruppe */}
              <div className={clsx(styles.dropdownGroup, styles.dropdownGroupBorder)}>
                <Link href="/innen" className={styles.dropdownGroupLabel} onClick={() => setOpen(false)}>
                  Innenbereich →
                </Link>
                {bereich.innen.map((cat) => (
                  <Link
                    key={cat.slug}
                    href={`/innen/kategorie/${cat.slug}`}
                    className={styles.dropdownItem}
                    onClick={() => setOpen(false)}
                  >
                    {cat.name}
                  </Link>
                ))}
                {!hasInnen && (
                  <span className={styles.dropdownEmpty}>Keine Kategorien</span>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}

// ── Unternehmen-Dropdown (statisch) ──────────────────────────────
function UnternehmenDropdown({ isActive }: { isActive: boolean }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const openMenu  = () => { clearTimeout(closeTimer.current); setOpen(true) }
  const closeMenu = () => { closeTimer.current = setTimeout(() => setOpen(false), 220) }

  useEffect(() => {
    function onOut(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    if (open) document.addEventListener('mousedown', onOut)
    return () => document.removeEventListener('mousedown', onOut)
  }, [open])

  return (
    <div
      ref={ref}
      className={styles.dropdown}
      onMouseEnter={openMenu}
      onMouseLeave={closeMenu}
    >
      <button
        className={clsx(styles.navLink, styles.dropdownTrigger, isActive && styles.active)}
        onClick={() => setOpen(!open)}
      >
        Unternehmen
        <svg
          className={clsx(styles.chevron, open && styles.chevronOpen)}
          width="9" height="9" viewBox="0 0 10 10" fill="none"
          stroke="currentColor" strokeWidth="1.5"
        >
          <path d="M2 3.5 L5 6.5 L8 3.5"/>
        </svg>
      </button>
      {open && (
        <div className={styles.dropdownMenu}>
          <Link href="/ueber-uns"    className={styles.dropdownItem} onClick={() => setOpen(false)}>Über uns</Link>
          <Link href="/karriere"     className={styles.dropdownItem} onClick={() => setOpen(false)}>Karriere</Link>
          <Link href="/weitere-infos" className={styles.dropdownItem} onClick={() => setOpen(false)}>Weitere Infos</Link>
        </div>
      )}
    </div>
  )
}

// ── Extras-Dropdown (dynamisch) ───────────────────────────────────
function ExtrasDropdown({
  categories, isActive,
}: {
  categories: NavCategory[]
  isActive: boolean
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const openMenu  = () => { clearTimeout(closeTimer.current); setOpen(true) }
  const closeMenu = () => { closeTimer.current = setTimeout(() => setOpen(false), 220) }

  useEffect(() => {
    function onOut(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    if (open) document.addEventListener('mousedown', onOut)
    return () => document.removeEventListener('mousedown', onOut)
  }, [open])

  return (
    <div
      ref={ref}
      className={styles.dropdown}
      onMouseEnter={openMenu}
      onMouseLeave={closeMenu}
    >
      <Link
        href="/extras"
        className={clsx(styles.navLink, styles.dropdownTrigger, isActive && styles.active)}
        onClick={() => setOpen(false)}
      >
        Extras
        <svg
          className={clsx(styles.chevron, open && styles.chevronOpen)}
          width="9" height="9" viewBox="0 0 10 10" fill="none"
          stroke="currentColor" strokeWidth="1.5"
        >
          <path d="M2 3.5 L5 6.5 L8 3.5"/>
        </svg>
      </Link>

      {open && (
        <div className={styles.dropdownMenu}>
          <Link
            href="/extras"
            className={styles.dropdownGroupLabel}
            style={{ borderBottom: '0.5px solid rgba(196,146,58,0.1)', paddingBottom: '10px', marginBottom: '4px' }}
            onClick={() => setOpen(false)}
          >
            Alle Extras →
          </Link>
          {categories.length === 0 ? (
            <span className={styles.dropdownEmpty}>Noch keine Kategorien</span>
          ) : (
            categories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/extras/kategorie/${cat.slug}`}
                className={styles.dropdownItem}
                onClick={() => setOpen(false)}
              >
                {cat.name}
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  )
}

// ── Hauptkomponente ───────────────────────────────────────────────
export default function Navbar({ bereiche = [], extrasCategories = [] }: Props) {
  const pathname = usePathname()

  // Gibt true zurück wenn der Bereich zur aktuellen URL passt
  function isBereichActive(b: NavBereich): boolean {
    // Direkte Übereinstimmung mit der eigenen Bereich-Seite
    if (pathname.startsWith(`/${b.key}`)) return true
    // Kategorie-Seiten: /aussen/kategorie/[slug] oder /innen/kategorie/[slug]
    const isKategorie = pathname.includes('/kategorie/')
    if (!isKategorie) return false
    const catSlug = pathname.split('/kategorie/')[1] ?? ''
    return [...b.aussen, ...b.innen].some((cat) => cat.slug === catSlug)
  }
  const [scrolled,   setScrolled]   = useState(false)
  const [menuOpen,   setMenuOpen]   = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState<string | null>(null)

  const toggleMobile = useCallback((key: string) => {
    setMobileOpen((prev) => (prev === key ? null : key))
  }, [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => { setMenuOpen(false); setMobileOpen(null) }, [pathname])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setSearchOpen((o) => !o)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <>
      <header className={clsx(styles.navbar, scrolled && styles.scrolled)}>
        <div className={styles.inner}>

          {/* Logo */}
          <Link href="/" className={styles.logo}>
            <span><span className={styles.logoAccent}>G</span>andl</span>
            <span className={styles.logoSub}>Natursteine</span>
          </Link>

          {/* Desktop Nav */}
          <nav className={styles.nav}>
            {bereiche.map((b) => (
              <BereichDropdown
                key={b.key}
                bereich={b}
                isActive={isBereichActive(b)}
              />
            ))}

            <ExtrasDropdown
              categories={extrasCategories}
              isActive={pathname.startsWith('/extras')}
            />

            <Link
              href="/referenzen"
              className={clsx(styles.navLink, pathname.startsWith('/referenzen') && styles.active)}
            >
              Referenzen
            </Link>

            <UnternehmenDropdown
              isActive={
                pathname.startsWith('/ueber-uns') ||
                pathname.startsWith('/karriere') ||
                pathname.startsWith('/weitere-infos')
              }
            />
          </nav>

          {/* Rechte Seite */}
          <div className={styles.actions}>
            <button
              className={styles.searchBtn}
              onClick={() => setSearchOpen(true)}
              aria-label="Suche öffnen"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <span className={styles.searchLabel}>Suchen</span>
              <kbd className={styles.searchKbd}>⌘K</kbd>
            </button>
            <Link href="/kontakt" className={styles.cta}>
              Anfrage stellen
            </Link>
          </div>

          {/* Mobile Burger */}
          <button
            className={styles.burger}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menü öffnen"
          >
            <span className={clsx(styles.burgerLine, menuOpen && styles.burgerOpen)} />
            <span className={clsx(styles.burgerLine, menuOpen && styles.burgerOpen)} />
          </button>
        </div>

        {/* Mobile Menu */}
        <div className={clsx(styles.mobileMenu, menuOpen && styles.mobileMenuOpen)}>

          {bereiche.map((b) => {
            const isOpen = mobileOpen === b.key
            const mainHref = b.key === 'sonderanfertigung' ? '/sonderanfertigung' : '/aussen'
            return (
              <div key={b.key}>
                <button
                  className={clsx(styles.mobileLink, styles.mobileLinkBtn)}
                  onClick={() => toggleMobile(b.key)}
                >
                  {b.label}
                  <svg
                    className={clsx(styles.chevron, isOpen && styles.chevronOpen)}
                    width="9" height="9" viewBox="0 0 10 10" fill="none"
                    stroke="currentColor" strokeWidth="1.5"
                  >
                    <path d="M2 3.5 L5 6.5 L8 3.5"/>
                  </svg>
                </button>
                {isOpen && (
                  <div className={styles.mobileSubMenu}>
                    <Link href={mainHref} className={clsx(styles.mobileSubLink, styles.mobileSubLinkHeader)}>
                      Alle {b.label} →
                    </Link>
                    {b.aussen.length > 0 && (
                      <>
                        <div className={styles.mobileSubGroupLabel}>Außenbereich</div>
                        {b.aussen.map((cat) => (
                          <Link key={cat.slug} href={`/aussen/kategorie/${cat.slug}`} className={styles.mobileSubLink}>
                            {cat.name}
                          </Link>
                        ))}
                      </>
                    )}
                    {b.innen.length > 0 && (
                      <>
                        <div className={styles.mobileSubGroupLabel}>Innenbereich</div>
                        {b.innen.map((cat) => (
                          <Link key={cat.slug} href={`/innen/kategorie/${cat.slug}`} className={styles.mobileSubLink}>
                            {cat.name}
                          </Link>
                        ))}
                      </>
                    )}
                    {b.aussen.length === 0 && b.innen.length === 0 && (
                      <>
                        <Link href="/aussen" className={styles.mobileSubLink}>Außenbereich</Link>
                        <Link href="/innen"  className={styles.mobileSubLink}>Innenbereich</Link>
                      </>
                    )}
                  </div>
                )}
              </div>
            )
          })}

          {/* Extras Mobile */}
          <div>
            <button
              className={clsx(styles.mobileLink, styles.mobileLinkBtn)}
              onClick={() => toggleMobile('extras')}
            >
              Extras
              <svg
                className={clsx(styles.chevron, mobileOpen === 'extras' && styles.chevronOpen)}
                width="9" height="9" viewBox="0 0 10 10" fill="none"
                stroke="currentColor" strokeWidth="1.5"
              >
                <path d="M2 3.5 L5 6.5 L8 3.5"/>
              </svg>
            </button>
            {mobileOpen === 'extras' && (
              <div className={styles.mobileSubMenu}>
                <Link href="/extras" className={clsx(styles.mobileSubLink, styles.mobileSubLinkHeader)}>Alle Extras →</Link>
                {extrasCategories.map((cat) => (
                  <Link key={cat.slug} href={`/extras/kategorie/${cat.slug}`} className={styles.mobileSubLink}>
                    {cat.name}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <Link
            href="/referenzen"
            className={clsx(styles.mobileLink, pathname.startsWith('/referenzen') && styles.mobileLinkActive)}
          >
            Referenzen
          </Link>

          {/* Unternehmen Mobile */}
          <div>
            <button
              className={clsx(styles.mobileLink, styles.mobileLinkBtn)}
              onClick={() => toggleMobile('unternehmen')}
            >
              Unternehmen
              <svg
                className={clsx(styles.chevron, mobileOpen === 'unternehmen' && styles.chevronOpen)}
                width="9" height="9" viewBox="0 0 10 10" fill="none"
                stroke="currentColor" strokeWidth="1.5"
              >
                <path d="M2 3.5 L5 6.5 L8 3.5"/>
              </svg>
            </button>
            {mobileOpen === 'unternehmen' && (
              <div className={styles.mobileSubMenu}>
                <Link href="/ueber-uns"    className={styles.mobileSubLink}>Über uns</Link>
                <Link href="/karriere"     className={styles.mobileSubLink}>Karriere</Link>
                <Link href="/weitere-infos" className={styles.mobileSubLink}>Weitere Infos</Link>
              </div>
            )}
          </div>

          <button className={styles.mobileSearch} onClick={() => { setMenuOpen(false); setSearchOpen(true) }}>
            Suchen →
          </button>
          <Link href="/kontakt" className={styles.mobileCta}>
            Anfrage stellen →
          </Link>
        </div>
      </header>

      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  )
}
