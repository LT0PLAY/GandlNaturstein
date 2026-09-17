import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { CUSTOMER_SESSION_COOKIE, isValidCustomerSessionToken } from '@/lib/customerSession'
import { createSupabaseAdminClient } from '@/lib/supabase'

const SUPABASE_CONFIGURED =
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')

export async function proxy(request: NextRequest) {
  // ── Kundenbereich: eigener, simpler Cookie-Login — komplett getrennt vom
  // Mitarbeiter-Login (Supabase Auth) weiter unten in dieser Funktion. ──
  const isKundenbereichRoute = request.nextUrl.pathname.startsWith('/btob')
  const isKundenbereichLoginPage = request.nextUrl.pathname === '/btob/login'
  if (isKundenbereichRoute) {
    try {
      const token = request.cookies.get(CUSTOMER_SESSION_COOKIE)?.value
      let hasValidSession = false
      if (token) {
        // Aktuellen Passwort-Hash laden — das Token ist daran gebunden, damit ein
        // Passwortwechsel bestehende Sessions sofort ungültig macht (siehe
        // customerSession.ts: credentialFingerprint).
        const { data: access } = await createSupabaseAdminClient()
          .from('customer_access').select('password_hash').eq('id', 'default').maybeSingle()
        hasValidSession = isValidCustomerSessionToken(token, access?.password_hash)
      }

      if (!hasValidSession && !isKundenbereichLoginPage) {
        return NextResponse.redirect(new URL('/btob/login', request.url))
      }
      if (hasValidSession && isKundenbereichLoginPage) {
        return NextResponse.redirect(new URL('/btob', request.url))
      }
      return NextResponse.next()
    } catch {
      // Fail-closed: z.B. wenn SUPABASE_SERVICE_ROLE_KEY (Signier-Geheimnis)
      // fehlt — dann lieber zur Login-Seite als den privaten Bereich zu zeigen.
      if (!isKundenbereichLoginPage) {
        return NextResponse.redirect(new URL('/btob/login', request.url))
      }
      return NextResponse.next()
    }
  }

  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin')
  const isLoginPage  = request.nextUrl.pathname === '/admin/login'
  // Seiten, die auch OHNE bestehende Session erreichbar sein müssen: Einladungs-
  // und Reset-Links bauen ihre Session erst im Browser aus dem URL-Token auf —
  // die Middleware läuft server-seitig VOR diesem Schritt und sieht noch keine
  // Cookie-Session. Diese Seiten dürfen deshalb nicht wie normale Admin-Seiten
  // hinter dem Login-Zwang liegen.
  const isPublicAuthPage =
    isLoginPage ||
    request.nextUrl.pathname === '/admin/passwort-neu-setzen'

  // ── Supabase nicht konfiguriert ──
  // Lokale Entwicklung (NODE_ENV=development, kein Supabase-Projekt verbunden):
  // Admin frei zugänglich, aus Komfort. In Produktion (Vercel setzt NODE_ENV=
  // production auch für Preview-Deployments) wäre das dagegen eine offene Tür —
  // z.B. wenn NEXT_PUBLIC_SUPABASE_URL aus Versehen leer/falsch gesetzt ist.
  // Deshalb dort "fail closed": lieber Login-Zwang als ungeschützter Admin-Bereich.
  if (!SUPABASE_CONFIGURED) {
    if (process.env.NODE_ENV === 'production') {
      if (!isPublicAuthPage) {
        return NextResponse.redirect(new URL('/admin/login', request.url))
      }
      return NextResponse.next()
    }
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

// Hinweis: In Next.js 16 heißt diese Datei "Proxy" (proxy.ts) und läuft dort
// IMMER auf Node.js-Laufzeit — ein explizites `runtime = 'nodejs'` ist hier
// nicht mehr nötig/erlaubt. lib/customerSession.ts kann Node's `crypto`-Modul
// deshalb trotzdem gefahrlos verwenden.
export const config = {
  matcher: ['/admin/:path*', '/btob/:path*'],
}
