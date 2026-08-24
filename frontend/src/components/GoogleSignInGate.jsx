import { useEffect, useRef, useState } from 'react'
import { hasValidLocalSession, verifyGoogleIdToken } from '../lib/auth.js'

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID

export default function GoogleSignInGate({ children }) {
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
            setError(err.message || 'تعذّر تسجيل الدخول.')
          } finally {
            setLoading(false)
          }
        }
      })
      window.google.accounts.id.renderButton(buttonRef.current, {
        theme: 'outline',
        size: 'large',
        locale: 'ar'
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
        سجّل الدخول بحساب Google لاستخدام هذه الأداة — خطوة بسيطة لمنع إساءة الاستخدام، ما نخزّن أي بيانات عنك.
      </p>
      {error && <div className="alert alert-error">{error}</div>}
      {loading && <p className="hint">جارٍ التحقق...</p>}
      <div ref={buttonRef} style={{ display: 'flex', justifyContent: 'center' }} />
    </div>
  )
}
