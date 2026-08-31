// Fertige HTML-E-Mail-Vorlagen im Gandl-Design (dunkler Hintergrund, Salbeigrün-Akzent).
// Bewusst mit Inline-Styles und Tabellen-Layout geschrieben, damit die Mail auch in
// älteren/eigenwilligen Mail-Clients (v.a. Outlook) vernünftig aussieht.

function emailShell(bodyHtml: string, preheader: string): string {
  return `<!doctype html>
<html lang="de">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Gandl Natursteine</title>
</head>
<body style="margin:0; padding:0; background:#0A0806; font-family:Arial,Helvetica,sans-serif;">
  <div style="display:none; max-height:0; overflow:hidden; opacity:0;">${preheader}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0A0806; padding:40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px; background:#141311; border:1px solid rgba(155,174,159,0.18);">
          <tr>
            <td style="padding:36px 36px 28px; text-align:center; border-bottom:1px solid rgba(155,174,159,0.12);">
              <span style="font-family:Georgia,'Times New Roman',serif; font-size:26px; letter-spacing:1px; color:#efece4;">
                <span style="color:#9bae9f;">G</span>andl <span style="color:#9caea1; font-size:15px; letter-spacing:3px; text-transform:uppercase;">Natursteine</span>
              </span>
            </td>
          </tr>
          <tr>
            <td style="padding:36px;">
              ${bodyHtml}
            </td>
          </tr>
          <tr>
            <td style="padding:22px 36px; border-top:1px solid rgba(155,174,159,0.12); text-align:center;">
              <p style="margin:0; font-size:12px; line-height:1.6; color:#6f6d67;">
                Gandl Natursteine GmbH · Rudolf-Diesel-Ring 6 · 82266 Inning am Ammersee
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

const ROLE_LABEL: Record<string, string> = {
  admin:  'Admin — Voller Zugriff',
  editor: 'Editor — Produkte & Kategorien',
  viewer: 'Viewer — Nur lesen',
}

export function inviteEmailHtml({ name, role, actionLink }: { name: string; role: string; actionLink: string }): string {
  const body = `
    <p style="margin:0 0 8px; font-size:12px; letter-spacing:2px; text-transform:uppercase; color:#9bae9f;">Team-Einladung</p>
    <h1 style="margin:0 0 20px; font-size:26px; line-height:1.25; color:#efece4; font-weight:400;">Willkommen im Team, ${name}.</h1>
    <p style="margin:0 0 16px; font-size:15px; line-height:1.7; color:#c7c4bc;">
      Du wurdest für den Admin-Bereich von Gandl Natursteine eingeladen — mit der Rolle
      <strong style="color:#efece4;">${ROLE_LABEL[role] ?? role}</strong>.
      Über den Button unten legst du dein persönliches Passwort fest und bist danach direkt eingeloggt.
    </p>
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:28px 0;">
      <tr>
        <td style="background:#9bae9f; text-align:center;">
          <a href="${actionLink}" style="display:inline-block; padding:14px 32px; font-size:15px; letter-spacing:1px; color:#0D0D0C; text-decoration:none; font-weight:bold;">
            Passwort festlegen →
          </a>
        </td>
      </tr>
    </table>
    <p style="margin:0 0 4px; font-size:13px; line-height:1.6; color:#8a8880;">
      Der Link ist eine begrenzte Zeit gültig. Funktioniert der Button nicht, kannst du diesen Link auch direkt kopieren:
    </p>
    <p style="margin:0; font-size:12px; line-height:1.6; color:#6f9c86; word-break:break-all;">
      ${actionLink}
    </p>
  `
  return emailShell(body, `${name}, du wurdest ins Gandl-Team eingeladen — Passwort jetzt festlegen.`)
}

export function passwordResetEmailHtml({ actionLink }: { actionLink: string }): string {
  const body = `
    <p style="margin:0 0 8px; font-size:12px; letter-spacing:2px; text-transform:uppercase; color:#9bae9f;">Passwort zurücksetzen</p>
    <h1 style="margin:0 0 20px; font-size:26px; line-height:1.25; color:#efece4; font-weight:400;">Neues Passwort festlegen</h1>
    <p style="margin:0 0 16px; font-size:15px; line-height:1.7; color:#c7c4bc;">
      Für dein Gandl-Admin-Konto wurde ein Passwort-Reset angefragt. Über den Button unten kannst du ein neues Passwort vergeben.
      Wenn du das nicht warst, kannst du diese E-Mail einfach ignorieren.
    </p>
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:28px 0;">
      <tr>
        <td style="background:#9bae9f; text-align:center;">
          <a href="${actionLink}" style="display:inline-block; padding:14px 32px; font-size:15px; letter-spacing:1px; color:#0D0D0C; text-decoration:none; font-weight:bold;">
            Neues Passwort festlegen →
          </a>
        </td>
      </tr>
    </table>
    <p style="margin:0 0 4px; font-size:13px; line-height:1.6; color:#8a8880;">
      Funktioniert der Button nicht, kannst du diesen Link auch direkt kopieren:
    </p>
    <p style="margin:0; font-size:12px; line-height:1.6; color:#6f9c86; word-break:break-all;">
      ${actionLink}
    </p>
  `
  return emailShell(body, 'Link zum Zurücksetzen deines Gandl-Admin-Passworts.')
}
