import { OAuth2Client } from 'google-auth-library'
import { createSessionToken } from './_session.js'

export const config = { maxDuration: 15 }

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID
const client = GOOGLE_CLIENT_ID ? new OAuth2Client(GOOGLE_CLIENT_ID) : null

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  if (!client || !process.env.SESSION_SECRET) {
    res.status(500).json({ error: 'الخادم غير مهيأ بعد لتسجيل الدخول.' })
    return
  }

  const idToken = req.body?.idToken
  if (typeof idToken !== 'string' || !idToken) {
    res.status(400).json({ error: 'رمز تسجيل الدخول مفقود.' })
    return
  }

  try {
    await client.verifyIdToken({ idToken, audience: GOOGLE_CLIENT_ID })
    // Verified: it's a genuine, unexpired Google-issued token for our app.
    // We deliberately don't read/store the payload (name/email/etc.) - this
    // gate only needs proof of "a real Google sign-in happened", nothing else.
    res.status(200).json({ sessionToken: createSessionToken() })
  } catch (err) {
    console.error('Google token verification failed:', err.message)
    res.status(401).json({ error: 'تعذّر التحقق من تسجيل الدخول. حاول مجدداً.' })
  }
}
