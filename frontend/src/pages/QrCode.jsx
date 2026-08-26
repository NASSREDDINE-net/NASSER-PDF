import { useEffect, useState } from 'react'
import SeoContent from '../components/SeoContent.jsx'
import { useT } from '../lib/i18n.jsx'
import { buildPayload, generatePng, generateSvg } from '../lib/qr.js'
import { downloadBlob } from '../lib/imagePdf.js'

const seo = {
  about: {
    heading: 'إنشاء رمز QR مجاناً بدون تسجيل',
    paragraphs: [
      'أداة إنشاء رمز QR تتيح لك تحويل رابط، نص، بريد إلكتروني، رقم هاتف، أو بيانات شبكة واي فاي إلى رمز QR جاهز للتنزيل بصيغة PNG أو SVG.',
      'مفيدة لمشاركة رابط موقعك على بطاقة عمل، عرض بيانات الاتصال بسرعة، أو مشاركة كلمة مرور واي فاي مع الضيوف بدون كتابتها يدوياً.'
    ]
  },
  steps: {
    heading: 'كيف تنشئ رمز QR؟',
    items: [
      'اختر نوع البيانات (رابط، نص، بريد إلكتروني، رقم هاتف، أو واي فاي).',
      'املأ التفاصيل المطلوبة، وسيتم إنشاء رمز QR تلقائياً في نفس اللحظة.',
      'اضبط الحجم إذا احتجت، ثم حمّل الرمز بصيغة PNG أو SVG.'
    ]
  },
  faq: [
    { q: 'ما الفرق بين تنزيل PNG وSVG؟', a: 'PNG صورة عادية مناسبة للاستخدام المباشر، بينما SVG صيغة متجهية يمكن تكبيرها لأي حجم دون فقدان الجودة، مناسبة للطباعة الكبيرة.' },
    { q: 'هل رمز QR صالح للاستخدام دائماً؟', a: 'نعم، الرمز يُنشأ محلياً في متصفحك ولا ينتهي صلاحيته أو يعتمد على أي خادم خارجي.' }
  ]
}

const TXT = {
  ar: {
    title: 'إنشاء رمز QR',
    lead: 'اختر نوع البيانات، املأ التفاصيل، وحمّل الرمز بصيغة PNG أو SVG.',
    genFailed: 'تعذّر إنشاء رمز QR بهذه البيانات.',
    svgFailed: 'تعذّر إنشاء ملف SVG.',
    dataTypeLabel: 'نوع البيانات',
    types: [
      { id: 'url', label: 'رابط' },
      { id: 'text', label: 'نص' },
      { id: 'email', label: 'بريد إلكتروني' },
      { id: 'phone', label: 'رقم هاتف' },
      { id: 'wifi', label: 'شبكة واي فاي' }
    ],
    urlLabel: 'الرابط',
    textLabel: 'النص',
    emailLabel: 'البريد الإلكتروني',
    subjectLabel: 'الموضوع (اختياري)',
    bodyLabel: 'نص الرسالة (اختياري)',
    phoneLabel: 'رقم الهاتف',
    ssidLabel: 'اسم الشبكة (SSID)',
    wifiPasswordLabel: 'كلمة المرور',
    encryptionLabel: 'نوع التشفير',
    size: (v) => `الحجم: ${v}px`,
    qrAlt: 'رمز QR',
    downloadPng: 'تنزيل PNG',
    downloadSvg: 'تنزيل SVG'
  },
  en: {
    title: 'Generate QR Code',
    lead: 'Choose the data type, fill in the details, and download the code as PNG or SVG.',
    genFailed: 'Could not generate a QR code from this data.',
    svgFailed: 'Could not generate the SVG file.',
    dataTypeLabel: 'Data type',
    types: [
      { id: 'url', label: 'URL' },
      { id: 'text', label: 'Text' },
      { id: 'email', label: 'Email' },
      { id: 'phone', label: 'Phone number' },
      { id: 'wifi', label: 'Wi-Fi network' }
    ],
    urlLabel: 'URL',
    textLabel: 'Text',
    emailLabel: 'Email',
    subjectLabel: 'Subject (optional)',
    bodyLabel: 'Message body (optional)',
    phoneLabel: 'Phone number',
    ssidLabel: 'Network name (SSID)',
    wifiPasswordLabel: 'Password',
    encryptionLabel: 'Encryption type',
    size: (v) => `Size: ${v}px`,
    qrAlt: 'QR code',
    downloadPng: 'Download PNG',
    downloadSvg: 'Download SVG'
  }
}

export default function QrCode() {
  const t = useT(TXT)
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
        .catch(() => setError(t.genFailed))
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
      setError(t.svgFailed)
    }
  }

  return (
    <div className="tool-page">
      <h1>{t.title}</h1>
      <p className="lead">{t.lead}</p>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="card">
        <div className="field">
          <label>{t.dataTypeLabel}</label>
          <div className="radio-group">
            {t.types.map((tp) => (
              <label key={tp.id}>
                <input
                  type="radio"
                  checked={type === tp.id}
                  onChange={() => {
                    setType(tp.id)
                    setFields({})
                  }}
                />
                {tp.label}
              </label>
            ))}
          </div>
        </div>

        {type === 'url' && (
          <div className="field">
            <label>{t.urlLabel}</label>
            <input type="text" placeholder="example.com" value={fields.url || ''} onChange={(e) => setField('url', e.target.value)} />
          </div>
        )}

        {type === 'text' && (
          <div className="field">
            <label>{t.textLabel}</label>
            <textarea rows={4} value={fields.text || ''} onChange={(e) => setField('text', e.target.value)} />
          </div>
        )}

        {type === 'email' && (
          <>
            <div className="field">
              <label>{t.emailLabel}</label>
              <input type="email" placeholder="name@example.com" value={fields.email || ''} onChange={(e) => setField('email', e.target.value)} />
            </div>
            <div className="field">
              <label>{t.subjectLabel}</label>
              <input type="text" value={fields.subject || ''} onChange={(e) => setField('subject', e.target.value)} />
            </div>
            <div className="field">
              <label>{t.bodyLabel}</label>
              <textarea rows={3} value={fields.body || ''} onChange={(e) => setField('body', e.target.value)} />
            </div>
          </>
        )}

        {type === 'phone' && (
          <div className="field">
            <label>{t.phoneLabel}</label>
            <input type="tel" placeholder="+212600000000" value={fields.phone || ''} onChange={(e) => setField('phone', e.target.value)} />
          </div>
        )}

        {type === 'wifi' && (
          <>
            <div className="field">
              <label>{t.ssidLabel}</label>
              <input type="text" value={fields.ssid || ''} onChange={(e) => setField('ssid', e.target.value)} />
            </div>
            <div className="field">
              <label>{t.wifiPasswordLabel}</label>
              <input type="text" value={fields.password || ''} onChange={(e) => setField('password', e.target.value)} />
            </div>
            <div className="field">
              <label>{t.encryptionLabel}</label>
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
          <label>{t.size(size)}</label>
          <input type="range" min="150" max="800" step="10" value={size} onChange={(e) => setSize(Number(e.target.value))} style={{ width: '100%' }} />
        </div>
      </div>

      {pngUrl && (
        <div className="card" style={{ textAlign: 'center' }}>
          <img src={pngUrl} alt={t.qrAlt} style={{ maxWidth: '100%', borderRadius: 8 }} />
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 16 }}>
            <button className="btn" onClick={handleDownloadPng}>{t.downloadPng}</button>
            <button className="btn btn-secondary" onClick={handleDownloadSvg}>{t.downloadSvg}</button>
          </div>
        </div>
      )}

      <SeoContent {...seo} />
    </div>
  )
}
