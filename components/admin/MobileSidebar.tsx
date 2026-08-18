'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import styles from './MobileSidebar.module.css'

interface NavLink {
  label: string
  href: string
  icon: string
}

interface Props {
  links: NavLink[]
  userName?: string
  userRole?: string
  userInitial?: string
}

export default function MobileSidebar({ links, userName, userRole, userInitial }: Props) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  // Schließe beim Route-Wechsel
  useEffect(() => { setOpen(false) }, [pathname])

  // Schließe mit Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  // Scrollsperre wenn offen
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  return (
    <>
      {/* Hamburger-Button */}
      <button
        className={styles.hamburger}
        onClick={() => setOpen(true)}
        aria-label="Menü öffnen"
      >
        <span /><span /><span />
      </button>

      {/* Overlay */}
      {open && (
        <div className={styles.overlay} onClick={() => setOpen(false)} />
      )}

      {/* Drawer */}
      <div className={`${styles.drawer} ${open ? styles.drawerOpen : ''}`}>
        <div className={styles.drawerTop}>
          <Link href="/" className={styles.logo}>
            <span className={styles.logoAccent}>G</span>andl
          </Link>
          <button className={styles.closeBtn} onClick={() => setOpen(false)} aria-label="Menü schließen">
            ✕
          </button>
        </div>

        <nav className={styles.nav}>
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`${styles.link} ${pathname === link.href ? styles.linkActive : ''}`}
            >
              <span className={styles.icon}>{link.icon}</span>
              {link.label}
            </Link>
          ))}
        </nav>

        <div className={styles.footer}>
          {userName && (
            <div className={styles.user}>
              <div className={styles.avatar}>{userInitial}</div>
              <div>
                <p className={styles.userName}>{userName}</p>
                <p className={styles.userRole}>{userRole}</p>
              </div>
            </div>
          )}
          <Link href="/" className={styles.footerLink}>← Zur Website</Link>
        </div>
      </div>
    </>
  )
}
