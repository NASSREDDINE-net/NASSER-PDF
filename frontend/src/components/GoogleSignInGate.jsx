import { useEffect, useRef, useState } from 'react'
import { hasValidLocalSession, verifyGoogleIdToken } from '../lib/auth.js'
import { useLanguage, useT } from '../lib/i18n.jsx'

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID

const TXT = {
  ar: {
    loginFailed: 'تعذّر تسجيل الدخول.',
    prompt: 'سجّل الدخول بحساب Google لاستخدام هذه الأداة — خطوة بسيطة لمنع إساءة الاستخدام، ما نخزّن أي بيانات عنك.',
    verifying: 'جارٍ التحقق...'
  },
  en: {
    loginFailed: 'Could not sign in.',
    prompt: 'Sign in with Google to use this tool — a simple step to prevent abuse, we don’t store any data about you.',
    verifying: 'Verifying...'
  }
}

export default function GoogleSignInGate({ children }) {
  const { lang } = useLanguage()
  const t = useT(TXT)
  const [signedIn, setSignedIn] = useState(hasValidLocalSession())
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const buttonRef = useRef(null)

  useEffect(() => {
    if (signedIn || !GOOGLE_CLIENT_ID) return

    const scriptId = 'google-identity-script'

    const initButton = () => {
      if (!window.google || !buttonRef.current) return
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: async (response) => {
          setLoading(true)
          setError('')
          try {
            await verifyGoogleIdToken(response.credential)
            setSignedIn(true)
          } catch (err) {
            setError(err.message || t.loginFailed)
          } finally {
            setLoading(false)
          }
        }
      })
      window.google.accounts.id.renderButton(buttonRef.current, {
        theme: 'outline',
        size: 'large',
        locale: lang
      })
    }

    if (document.getElementById(scriptId)) {
      initButton()
      return
    }

    const script = document.createElement('script')
    script.id = scriptId
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    script.onload = initButton
    document.body.appendChild(script)
  }, [signedIn])

  // Not configured yet on this deployment — don't block the tool.
  if (!GOOGLE_CLIENT_ID || signedIn) {
    return children
  }

  return (
    <div className="card" style={{ textAlign: 'center', padding: 40 }}>
      <p style={{ marginBottom: 16 }}>
        {t.prompt}
      </p>
      {error && <div className="alert alert-error">{error}</div>}
      {loading && <p className="hint">{t.verifying}</p>}
      <div ref={buttonRef} style={{ display: 'flex', justifyContent: 'center' }} />
    </div>
  )
}
