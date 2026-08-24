import crypto from 'node:crypto'

const SESSION_SECRET = process.env.SESSION_SECRET
const SESSION_TTL_MS = 24 * 60 * 60 * 1000 // 24h

function sign(payload) {
  return crypto.createHmac('sha256', SESSION_SECRET).update(payload).digest('hex')
}

/** Stateless session token: "<expiryTimestamp>.<hmacSignature>" — no DB, no user data stored. */
export function createSessionToken() {
  if (!SESSION_SECRET) throw new Error('SESSION_SECRET not configured')
  const expires = Date.now() + SESSION_TTL_MS
  const payload = String(expires)
  return `${payload}.${sign(payload)}`
}

export function isValidSessionToken(token) {
  if (!SESSION_SECRET || typeof token !== 'string') return false
  const [payload, signature] = token.split('.')
  if (!payload || !signature) return false

  const expected = sign(payload)
  if (expected.length !== signature.length) return false
  if (!crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature))) return false

  const expires = Number(payload)
  return Number.isFinite(expires) && Date.now() < expires
}
