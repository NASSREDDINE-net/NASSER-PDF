import { useEffect, useState } from 'react'
import { buildPayload, generatePng, generateSvg } from '../lib/qr.js'
import { downloadBlob } from '../lib/imagePdf.js'

const TYPES = [
  { id: 'url', label: 'رابط' },
  { id: 'text', label: 'نص' },
  { id: 'email', label: 'بريد إلكتروني' },
  { id: 'phone', label: 'رقم هاتف' },
  { id: 'wifi', label: 'شبكة واي فاي' }
]

export default function QrCode() {
  const [type, setType] = useState('url')
  const [fields, setFields] = useState({})
  const [size, setSize] = useState(300)
  const [pngUrl, setPngUrl] = useState('')
  const [error, setError] = useState('')

  const setField = (key, value) => setFields((prev) => ({ ...prev, [key]: value }))

  useEffect(() => {
    const payload = buildPayload(type, fields)
    if (!payload) {
      setPngUrl('')
      setError('')
      return
    }
    const timer = setTimeout(() => {
      generatePng(payload, size)
        .then((url) => {
          setPngUrl(url)
          setError('')
        })
        .catch(() => setError('تعذّر إنشاء رمز QR بهذه البيانات.'))
    }, 200)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, fields, size])

  const handleDownloadPng = () => {
    if (!pngUrl) return
    const a = document.createElement('a')
    a.href = pngUrl
    a.download = 'nasser-pdf-qrcode.png'
    a.click()
  }

  const handleDownloadSvg = async () => {
    const payload = buildPayload(type, fields)
    if (!payload) return
    try {
      const svg = await generateSvg(payload, size)
      downloadBlob(new Blob([svg], { type: 'image/svg+xml' }), 'nasser-pdf-qrcode.svg')
    } catch {
      setError('تعذّر إنشاء ملف SVG.')
    }
  }

  return (
    <div className="tool-page">
      <h1>إنشاء رمز QR</h1>
      <p className="lead">اختر نوع البيانات، املأ التفاصيل، وحمّل الرمز بصيغة PNG أو SVG.</p>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="card">
        <div className="field">
          <label>نوع البيانات</label>
          <div className="radio-group">
            {TYPES.map((t) => (
              <label key={t.id}>
                <input
                  type="radio"
                  checked={type === t.id}
                  onChange={() => {
                    setType(t.id)
                    setFields({})
                  }}
                />
                {t.label}
              </label>
            ))}
          </div>
        </div>

        {type === 'url' && (
          <div className="field">
            <label>الرابط</label>
            <input type="text" placeholder="example.com" value={fields.url || ''} onChange={(e) => setField('url', e.target.value)} />
          </div>
        )}

        {type === 'text' && (
          <div className="field">
            <label>النص</label>
            <textarea rows={4} value={fields.text || ''} onChange={(e) => setField('text', e.target.value)} />
          </div>
        )}

        {type === 'email' && (
          <>
            <div className="field">
              <label>البريد الإلكتروني</label>
              <input type="email" placeholder="name@example.com" value={fields.email || ''} onChange={(e) => setField('email', e.target.value)} />
            </div>
            <div className="field">
              <label>الموضوع (اختياري)</label>
              <input type="text" value={fields.subject || ''} onChange={(e) => setField('subject', e.target.value)} />
            </div>
            <div className="field">
              <label>نص الرسالة (اختياري)</label>
              <textarea rows={3} value={fields.body || ''} onChange={(e) => setField('body', e.target.value)} />
            </div>
          </>
        )}

        {type === 'phone' && (
          <div className="field">
            <label>رقم الهاتف</label>
            <input type="tel" placeholder="+212600000000" value={fields.phone || ''} onChange={(e) => setField('phone', e.target.value)} />
          </div>
        )}

        {type === 'wifi' && (
          <>
            <div className="field">
              <label>اسم الشبكة (SSID)</label>
              <input type="text" value={fields.ssid || ''} onChange={(e) => setField('ssid', e.target.value)} />
            </div>
            <div className="field">
              <label>كلمة المرور</label>
              <input type="text" value={fields.password || ''} onChange={(e) => setField('password', e.target.value)} />
            </div>
            <div className="field">
              <label>نوع التشفير</label>
              <div className="radio-group">
                {['WPA', 'WEP', 'nopass'].map((enc) => (
                  <label key={enc}>
                    <input
                      type="radio"
                      checked={(fields.encryption || 'WPA') === enc}
                      onChange={() => setField('encryption', enc)}
                    />
                    {enc}
                  </label>
                ))}
              </div>
            </div>
          </>
        )}

        <div className="field">
          <label>الحجم: {size}px</label>
          <input type="range" min="150" max="800" step="10" value={size} onChange={(e) => setSize(Number(e.target.value))} style={{ width: '100%' }} />
        </div>
      </div>

      {pngUrl && (
        <div className="card" style={{ textAlign: 'center' }}>
          <img src={pngUrl} alt="رمز QR" style={{ maxWidth: '100%', borderRadius: 8 }} />
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 16 }}>
            <button className="btn" onClick={handleDownloadPng}>تنزيل PNG</button>
            <button className="btn btn-secondary" onClick={handleDownloadSvg}>تنزيل SVG</button>
          </div>
        </div>
      )}
    </div>
  )
}
