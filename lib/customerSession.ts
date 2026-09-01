import crypto from 'crypto'

// Eigene, leichte Session für den Kundenbereich — bewusst KEIN Supabase-Auth
// (das ist nur für Mitarbeiter/Admins gedacht). Ein signiertes Cookie reicht
// hier aus, weil es nur einen einzigen, vom Admin vergebenen Zugang gibt.
//
// Als Signier-Geheimnis wird der bereits vorhandene Supabase Service-Role-Key
// verwendet — der ist ohnehin streng geheim und nur serverseitig bekannt, ein
// zusätzlicher Env-Var ist damit nicht nötig.

export const CUSTOMER_SESSION_COOKIE = 'gandl_kundenbereich_session'
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30 // 30 Tage

function getSecret(): string {
  const secret = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!secret) throw new Error('SUPABASE_SERVICE_ROLE_KEY fehlt — Kundenbereich-Session kann nicht signiert werden.')
  return secret
}

function sign(payload: string): string {
  return crypto.createHmac('sha256', getSecret()).update(payload).digest('hex')
}

/** Erstellt den Wert für das Session-Cookie: "<ablaufzeitpunkt>.<signatur>" */
export function createCustomerSessionToken(): string {
  const expires = Date.now() + SESSION_MAX_AGE_SECONDS * 1000
  const payload = String(expires)
  return `${payload}.${sign(payload)}`
}

/** Prüft ein Session-Cookie: gültige Signatur UND noch nicht abgelaufen. */
export function isValidCustomerSessionToken(token: string | undefined | null): boolean {
  if (!token) return false
  const [payload, signature] = token.split('.')
  if (!payload || !signature) return false

  let expected: string
  try {
    expected = sign(payload)
  } catch {
    // z.B. SUPABASE_SERVICE_ROLE_KEY fehlt — dann lieber "ungültig" als crashen.
    return false
  }
  const sigBuf = Buffer.from(signature)
  const expBuf = Buffer.from(expected)
  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) return false

  const expires = Number(payload)
  if (!Number.isFinite(expires) || Date.now() > expires) return false

  return true
}

/** Passwort mit Salt hashen (scrypt, in Node fest eingebaut — keine neue Abhängigkeit). */
export function hashPassword(password: string, salt: string): string {
  return crypto.scryptSync(password, salt, 64).toString('hex')
}

export function generateSalt(): string {
  return crypto.randomBytes(16).toString('hex')
}

/** Konstante-Zeit-Vergleich für den Passwort-Hash (Timing-Angriffe vermeiden). */
export function verifyPassword(password: string, salt: string, expectedHash: string): boolean {
  const actual = hashPassword(password, salt)
  const actualBuf = Buffer.from(actual, 'hex')
  const expectedBuf = Buffer.from(expectedHash, 'hex')
  if (actualBuf.length !== expectedBuf.length) return false
  return crypto.timingSafeEqual(actualBuf, expectedBuf)
}

export { SESSION_MAX_AGE_SECONDS }
