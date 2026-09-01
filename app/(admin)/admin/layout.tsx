import AdminShell from '@/components/admin/AdminShell'

// Basis-Links für alle Rollen
const BASE_LINKS = [
  { label: 'Dashboard',    href: '/admin',             icon: '◈', roles: ['admin', 'editor', 'viewer'] },
  { label: 'Kategorien',   href: '/admin/kategorien',  icon: '⊞', roles: ['admin', 'editor', 'viewer'] },
  { label: 'Produkte',     href: '/admin/produkte',    icon: '◧', roles: ['admin', 'editor', 'viewer'] },
  { label: 'Referenzen',   href: '/admin/referenzen',  icon: '◫', roles: ['admin', 'editor'] },
  { label: 'Partner',      href: '/admin/partner',     icon: '◨', roles: ['admin', 'editor'] },
  { label: 'Restposten',   href: '/admin/restposten',  icon: '◪', roles: ['admin', 'editor'] },
  { label: 'Ausst.-Guide', href: '/admin/guide',       icon: '◬', roles: ['admin', 'editor'] },
  { label: 'Anfragen',     href: '/admin/anfragen',    icon: '◻', roles: ['admin', 'editor', 'viewer'] },
  { label: 'Popups',       href: '/admin/popups',      icon: '❖', roles: ['admin', 'editor'] },
  { label: 'Karriere',     href: '/admin/karriere',    icon: '◈', roles: ['admin'] },
  { label: 'BtoB', href: '/admin/btob', icon: '⚿', roles: ['admin'] },
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
    <AdminShell visibleLinks={visibleLinks} user={user}>
      {children}
    </AdminShell>
  )
}
