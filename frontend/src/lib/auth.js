const STORAGE_KEY = 'nasser_pdf_session'

export function getSessionToken() {
  try {
    return localStorage.getItem(STORAGE_KEY) || ''
  } catch {
    return ''
  }
}

function setSessionToken(token) {
  try {
    localStorage.setItem(STORAGE_KEY, token)
  } catch {
    /* ignore storage errors (private mode, disabled storage, etc.) */
  }
}

export function hasValidLocalSession() {
  const token = getSessionToken()
  if (!token) return false
  const [expiresStr] = token.split('.')
  const expires = Number(expiresStr)
  return Number.isFinite(expires) && Date.now() < expires
}

export async function verifyGoogleIdToken(idToken) {
  const response = await fetch('/api/verify-google', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken })
  })
  if (!response.ok) {
    const data = await response.json().catch(() => ({}))
    throw new Error(data.error || 'تعذّر تسجيل الدخول.')
  }
  const { sessionToken } = await response.json()
  setSessionToken(sessionToken)
  return sessionToken
}
