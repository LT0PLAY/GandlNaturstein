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

/** Kurzer, nicht umkehrbarer Fingerabdruck des aktuellen Passwort-Hashes —
 *  wird mit ins Token signiert, damit ein Passwortwechsel alle zuvor
 *  ausgestellten Session-Cookies automatisch ungültig macht (sonst würde ein
 *  bereits ausgestelltes Cookie bis zu 30 Tage weiter funktionieren, selbst
 *  wenn der Admin das Passwort gerade WEGEN eines Verdachts geändert hat). */
function credentialFingerprint(passwordHash: string): string {
  return crypto.createHash('sha256').update(passwordHash).digest('hex').slice(0, 32)
}

/** Erstellt den Wert für das Session-Cookie: "<ablauf>.<passwort-fingerabdruck>.<signatur>" */
export function createCustomerSessionToken(passwordHash: string): string {
  const expires = Date.now() + SESSION_MAX_AGE_SECONDS * 1000
  const payload = `${expires}.${credentialFingerprint(passwordHash)}`
  return `${payload}.${sign(payload)}`
}

/** Prüft ein Session-Cookie: gültige Signatur, noch nicht abgelaufen UND
 *  Passwort seither nicht geändert (aktueller Passwort-Hash muss übergeben werden). */
export function isValidCustomerSessionToken(
  token: string | undefined | null,
  currentPasswordHash: string | undefined | null
): boolean {
  if (!token || !currentPasswordHash) return false
  const parts = token.split('.')
  if (parts.length !== 3) return false
  const [expiresRaw, fingerprint, signature] = parts
  if (!expiresRaw || !fingerprint || !signature) return false

  const payload = `${expiresRaw}.${fingerprint}`
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

  const expires = Number(expiresRaw)
  if (!Number.isFinite(expires) || Date.now() > expires) return false

  const currentFingerprint = credentialFingerprint(currentPasswordHash)
  const fpBuf  = Buffer.from(fingerprint)
  const curBuf = Buffer.from(currentFingerprint)
  if (fpBuf.length !== curBuf.length || !crypto.timingSafeEqual(fpBuf, curBuf)) return false

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
