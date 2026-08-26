import { useState } from 'react'
import FileDrop from './FileDrop.jsx'
import GoogleSignInGate from './GoogleSignInGate.jsx'
import SeoContent from './SeoContent.jsx'
import { useLanguage, useT } from '../lib/i18n.jsx'
import { convertOfficeToPdf, ApiError } from '../lib/api.js'
import { downloadBlob } from '../lib/imagePdf.js'

const MAX_FILE_MB = 100

const TXT = {
  ar: {
    unsupported: (exts) => `صيغة غير مدعومة. الصيغ المسموح بها: ${exts}`,
    tooBig: `حجم الملف أكبر من ${MAX_FILE_MB}MB.`,
    unexpected: 'حدث خطأ غير متوقع أثناء التحويل.',
    success: 'تمت العملية بنجاح، بدأ تنزيل الملف.',
    buttonLabel: 'تحويل إلى PDF وتنزيل',
    loadingLabel: 'جارٍ التحويل...'
  },
  en: {
    unsupported: (exts) => `Unsupported format. Allowed: ${exts}`,
    tooBig: `File is larger than ${MAX_FILE_MB}MB.`,
    unexpected: 'An unexpected error occurred during conversion.',
    success: 'Done — your file download has started.',
    buttonLabel: 'Convert to PDF and download',
    loadingLabel: 'Converting...'
  }
}

/** title/lead/hint may be a plain string or a { ar, en } dict. */
function pick(value, lang) {
  return value && typeof value === 'object' ? value[lang] ?? value.ar : value
}

export default function OfficeToPdf({
  title,
  lead,
  accept,
  extensions,
  hint,
  convertFn = convertOfficeToPdf,
  outputExtension = 'pdf',
  buttonLabel,
  loadingLabel,
  seo
}) {
  const { lang } = useLanguage()
  const t = useT(TXT)
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  const handleFiles = (files) => {
    const picked = files[0]
    setDone(false)
    setError('')
    const ext = picked.name.split('.').pop()?.toLowerCase()
    if (!extensions.includes(ext)) {
      setError(t.unsupported(extensions.join(', ')))
      return
    }
    if (picked.size > MAX_FILE_MB * 1024 * 1024) {
      setError(t.tooBig)
      return
    }
    setFile(picked)
  }

  const handleConvert = async () => {
    if (!file) return
    setLoading(true)
    setError('')
    setDone(false)
    try {
      const blob = await convertFn(file)
      const outName = file.name.replace(/\.[^.]+$/, '') + '.' + outputExtension
      downloadBlob(blob, outName)
      setDone(true)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t.unexpected)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="tool-page">
      <h1>{pick(title, lang)}</h1>
      <p className="lead">{pick(lead, lang)}</p>

      {error && <div className="alert alert-error">{error}</div>}
      {done && <div className="alert alert-success">{t.success}</div>}

      <GoogleSignInGate>
        <div className="card">
          <FileDrop accept={accept} onFiles={handleFiles} hint={pick(hint, lang)} />

          {file && (
            <div className="file-list">
              <div className="file-row">
                <span>{file.name}</span>
                <button type="button" onClick={() => setFile(null)}>✕</button>
              </div>
            </div>
          )}
        </div>

        <button className="btn" disabled={!file || loading} onClick={handleConvert}>
          {loading && <span className="spinner" />}
          {loading ? (loadingLabel ? pick(loadingLabel, lang) : t.loadingLabel) : buttonLabel ? pick(buttonLabel, lang) : t.buttonLabel}
        </button>
      </GoogleSignInGate>

      {seo && <SeoContent {...seo} />}
    </div>
  )
}
