import Link from 'next/link'
import { logout } from '@/lib/actions/auth'
import InactivityTimer from '@/components/admin/InactivityTimer'
import MobileSidebar from '@/components/admin/MobileSidebar'
import styles from './admin.module.css'

// Basis-Links für alle Rollen
const BASE_LINKS = [
  { label: 'Dashboard',    href: '/admin',             icon: '◈', roles: ['admin', 'editor', 'viewer'] },
  { label: 'Kategorien',   href: '/admin/kategorien',  icon: '⊞', roles: ['admin', 'editor', 'viewer'] },
  { label: 'Produkte',     href: '/admin/produkte',    icon: '◧', roles: ['admin', 'editor', 'viewer'] },
  { label: 'Referenzen',   href: '/admin/referenzen',  icon: '◫', roles: ['admin', 'editor'] },
  { label: 'Anfragen',     href: '/admin/anfragen',    icon: '◻', roles: ['admin', 'editor', 'viewer'] },
  { label: 'Karriere',     href: '/admin/karriere',    icon: '◈', roles: ['admin'] },
  { label: 'Papierkorb',   href: '/admin/papierkorb',  icon: '⊗', roles: ['admin'] },
  { label: 'Team',         href: '/admin/team',        icon: '◎', roles: ['admin'] },
  { label: 'Monitoring',   href: '/admin/monitoring',  icon: '◉', roles: ['admin'] },
]

const SUPABASE_CONFIGURED =
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')

async function getUser() {
  if (!SUPABASE_CONFIGURED) return null
  try {
    const { getCurrentUser } = await import('@/lib/actions/auth')
    return await getCurrentUser()
  } catch { return null }
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getUser()
  // Dev-Modus (kein Supabase): zeige alle Links. Eingeloggt: Rolle aus DB.
  // Ausgeloggt + Supabase konfiguriert: keine Links anzeigen.
  const role = SUPABASE_CONFIGURED
    ? (user?.role as string) ?? null
    : 'admin'

  const visibleLinks = role ? BASE_LINKS.filter((l) => l.roles.includes(role)) : []

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>

        <div className={styles.sidebarTop}>
          <Link href="/" className={styles.sidebarLogo}>
            <span className={styles.logoAccent}>G</span>andl
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
