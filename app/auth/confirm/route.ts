import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import type { EmailOtpType } from '@supabase/supabase-js'
import { createSupabaseServerClient } from '@/lib/supabase-server'

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
// Das schließt außerdem jede Race Condition mit einer im Browser evtl. schon
// bestehenden Fremd-Session aus.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const next = searchParams.get('next') ?? '/admin/passwort-neu-setzen'

  if (token_hash && type) {
    const supabase = await createSupabaseServerClient()
    const { error } = await supabase.auth.verifyOtp({ type, token_hash })
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/admin/passwort-neu-setzen?invalid=1`)
}
