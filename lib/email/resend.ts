// Minimaler E-Mail-Versand über die Resend-HTTP-API — bewusst ohne SDK-Abhängigkeit,
// ein einfacher fetch()-Aufruf reicht für unseren Anwendungsfall (transaktionale
// Team-E-Mails, kein Massenversand).
//
// Setup (einmalig, im Supabase-/Vercel-Projekt):
//   1. Konto auf https://resend.com anlegen (kostenloser Plan reicht für den Start).
//   2. Eigene Domain (z.B. gandl-natursteine.de) unter "Domains" hinzufügen und die
//      angezeigten DNS-Einträge (SPF/DKIM) beim Domain-Hoster eintragen.
//   3. Einen API-Key erzeugen und als Umgebungsvariable RESEND_API_KEY hinterlegen
//      (lokal in .env.local, auf Vercel unter Project Settings → Environment Variables).
//   4. Optional RESEND_FROM_EMAIL setzen, z.B. "Gandl Natursteine <team@gandl-natursteine.de>"
//      (Adresse muss zur verifizierten Domain gehören). Ohne diese Variable wird ein
//      Platzhalter-Absender verwendet.
//
// Ist RESEND_API_KEY nicht gesetzt, wird nichts verschickt — der Aufrufer bekommt das
// über { sent: false } zurückgemeldet und kann z.B. den Link stattdessen anzeigen.

interface SendEmailInput {
  to:      string
  subject: string
  html:    string
}

interface SendEmailResult {
  sent:  boolean
  error?: string
}

export async function sendBrandedEmail({ to, subject, html }: SendEmailInput): Promise<SendEmailResult> {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    return { sent: false, error: 'RESEND_API_KEY ist nicht konfiguriert.' }
  }

  const from = process.env.RESEND_FROM_EMAIL || 'Gandl Natursteine <team@gandl-natursteine.de>'

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ from, to: [to], subject, html }),
    })

    if (!res.ok) {
      const text = await res.text().catch(() => '')
      return { sent: false, error: `Resend-Fehler (${res.status}): ${text || res.statusText}` }
    }

    return { sent: true }
  } catch (e) {
    return { sent: false, error: e instanceof Error ? e.message : 'Unbekannter Fehler beim E-Mail-Versand.' }
  }
}
