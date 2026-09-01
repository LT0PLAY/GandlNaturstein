import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const SUPABASE_CONFIGURED =
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')

export async function proxy(request: NextRequest) {
  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin')
  const isLoginPage  = request.nextUrl.pathname === '/admin/login'
  // Seiten, die auch OHNE bestehende Session erreichbar sein müssen: Einladungs-
  // und Reset-Links bauen ihre Session erst im Browser aus dem URL-Token auf —
  // die Middleware läuft server-seitig VOR diesem Schritt und sieht noch keine
  // Cookie-Session. Diese Seiten dürfen deshalb nicht wie normale Admin-Seiten
  // hinter dem Login-Zwang liegen.
  const isPublicAuthPage =
    isLoginPage ||
    request.nextUrl.pathname === '/admin/passwort-neu-setzen' ||
    request.nextUrl.pathname === '/admin/login/passwort-vergessen'

  // ── DEV-MODUS: Supabase noch nicht konfiguriert → Admin frei zugänglich ──
  if (!SUPABASE_CONFIGURED) {
    if (isLoginPage) {
      return NextResponse.redirect(new URL('/admin', request.url))
    }
    return NextResponse.next()
  }

  // ── PRODUKTION: echte Auth-Prüfung ──
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options as any)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  if (!user && isAdminRoute && !isPublicAuthPage) {
    const loginUrl = new URL('/admin/login', request.url)
    loginUrl.searchParams.set('redirect', request.nextUrl.pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Ein gültiger Supabase-Login reicht allein nicht — deaktivierte Mitarbeiter
  // (team_members.is_active = false) müssen auch dann ausgesperrt bleiben, wenn
  // ihre Browser-Session noch besteht (z.B. weil sie schon eingeloggt waren,
  // bevor ein Admin sie deaktiviert hat).
  if (user && isAdminRoute && !isPublicAuthPage) {
    const { data: member } = await supabase
      .from('team_members')
      .select('is_active')
      .eq('user_id', user.id)
      .maybeSingle()

    if (!member || !member.is_active) {
      await supabase.auth.signOut()
      const loginUrl = new URL('/admin/login', request.url)
      loginUrl.searchParams.set('redirect', request.nextUrl.pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  if (user && isLoginPage) {
    return NextResponse.redirect(new URL('/admin', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/admin/:path*'],
}
