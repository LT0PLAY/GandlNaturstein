import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import type { EmailOtpType } from '@supabase/supabase-js'

// Zentrale Bestätigungsroute für Einladungs- und Passwort-Reset-Links.
//
// Warum eine eigene Route statt Supabase direkt auf die Zielseite zeigen zu
// lassen: Supabase generiert Links wahlweise im "impliziten" Format
// (#access_token=... im URL-Fragment) oder im PKCE-Format (?code=...) — je nach
// Kontext unterschiedlich, und ein PKCE-Code lässt sich im Browser oft nicht
// zuverlässig einlösen (er braucht einen lokal gespeicherten "Code Verifier",
// den es bei einem per E-Mail verschickten Link nie gibt). Diese Route umgeht
// das komplett: sie verifiziert den Link SERVERSEITIG per token_hash (verifyOtp)
// und setzt die Session direkt als Cookie, bevor die Zielseite überhaupt lädt.
//
// WICHTIG: Die Cookies müssen direkt auf das zurückgegebene NextResponse-Objekt
// geschrieben werden (nicht über next/headers cookies()) — sonst gehen sie bei
// einem NextResponse.redirect() verloren und die Zielseite sieht "Auth session
// missing!", weil dort keine Session ankommt.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const next = searchParams.get('next') ?? '/admin/passwort-neu-setzen'

  // "type" (invite vs. recovery) an die Zielseite weiterreichen — die Seite
  // braucht das, um einen frisch eingeladenen Mitarbeiter nach dem
  // Passwort-Setzen automatisch zu aktivieren (nur bei "invite").
  const nextWithType = type ? `${next}${next.includes('?') ? '&' : '?'}type=${type}` : next

  if (token_hash && type) {
    let response = NextResponse.redirect(`${origin}${nextWithType}`)

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      {
        cookies: {
          getAll() { return request.cookies.getAll() },
          setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
            response = NextResponse.redirect(`${origin}${nextWithType}`)
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options as any)
            )
          },
        },
      }
    )

    const { error } = await supabase.auth.verifyOtp({ type, token_hash })
    if (!error) {
      return response
    }
  }

  return NextResponse.redirect(`${origin}/admin/passwort-neu-setzen?invalid=1`)
}
