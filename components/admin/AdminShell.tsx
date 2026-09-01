'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { logout } from '@/lib/actions/auth'
import InactivityTimer from '@/components/admin/InactivityTimer'
import MobileSidebar from '@/components/admin/MobileSidebar'
import styles from '@/app/(admin)/admin/admin.module.css'

type Link_ = { label: string; href: string; icon: string; roles: string[] }

// Seiten, die eigenständig sind (Login, Passwort setzen) — dort soll NUR die
// Karte selbst zu sehen sein, ohne die Admin-Seitenleiste links daneben.
const STANDALONE_ROUTES = ['/admin/login', '/admin/passwort-neu-setzen']

interface Props {
  visibleLinks: Link_[]
  user:         { name?: string; role?: string } | null
  children:     React.ReactNode
}

export default function AdminShell({ visibleLinks, user, children }: Props) {
  const pathname = usePathname()

  if (STANDALONE_ROUTES.includes(pathname)) {
    return <>{children}</>
  }

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>

        <div className={styles.sidebarTop}>
          <Link href="/" className={styles.sidebarLogo} aria-label="Gandl Natursteine – zur Startseite">
            <Image
              src="/gandl-logo.png"
              alt="Gandl Natursteine"
              width={1950}
              height={590}
              className={styles.sidebarLogoImg}
            />
          </Link>
          <span className={styles.sidebarBadge}>Admin</span>
        </div>

        <nav className={styles.sidebarNav}>
          {visibleLinks.map((link) => (
            <Link key={link.href} href={link.href} className={styles.sidebarLink}>
              <span className={styles.sidebarIcon}>{link.icon}</span>
              {link.label}
            </Link>
          ))}
        </nav>

        <div className={styles.sidebarUser}>
          {user ? (
            <>
              <div className={styles.userInfo}>
                <div className={styles.userAvatar}>
                  {(user.name as string)?.[0]?.toUpperCase() ?? 'A'}
                </div>
                <div>
                  <p className={styles.userName}>{user.name as string}</p>
                  <p className={styles.userRole}>{user.role as string}</p>
                </div>
              </div>
              <form action={logout}>
                <button type="submit" className={styles.logoutBtn}>Abmelden</button>
              </form>
            </>
          ) : (
            <div className={styles.devBadge}>
              ⚙ Dev-Modus
            </div>
         )}
          <Link href="/" className={styles.sidebarFooterLink}>← Zur Website</Link>
        </div>

      </aside>

      <div className={styles.content}>{children}</div>

      {/* Mobile Drawer Sidebar */}
      <MobileSidebar
        links={visibleLinks}
        userName={user?.name as string | undefined}
        userRole={user?.role as string | undefined}
        userInitial={(user?.name as string)?.[0]?.toUpperCase()}
      />

      {/* Auto-Logout nach 10 Min Inaktivität (nur wenn eingeloggt) */}
      {user && <InactivityTimer />}
    </div>
  )
}
