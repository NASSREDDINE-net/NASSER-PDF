import { useState } from 'react'
import FileDrop from '../components/FileDrop.jsx'
import { loadPdfForRendering, extractPdfText } from '../lib/pdfRender.js'
import { downloadBlob } from '../lib/imagePdf.js'

const MAX_FILE_MB = 75

export default function ExtractText() {
  const [file, setFile] = useState(null)
  const [text, setText] = useState('')
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleFiles = async (files) => {
    const picked = files[0]
    setError('')
    setText('')
    if (picked.type !== 'application/pdf') {
      setError('صيغة غير مدعومة. يُسمح فقط بملفات PDF.')
      return
    }
    if (picked.size > MAX_FILE_MB * 1024 * 1024) {
      setError(`حجم الملف أكبر من ${MAX_FILE_MB}MB.`)
      return
    }
    setFile(picked)
    setLoading(true)
    try {
      const pdfDoc = await loadPdfForRendering(picked)
      const pages = await extractPdfText(pdfDoc)
      const joined = pages.map((p, i) => `--- صفحة ${i + 1} ---\n${p}`).join('\n\n')
      setText(joined.trim() || 'لم يُعثر على نص قابل للاستخراج (قد يكون الملف صوراً ممسوحة ضوئياً).')
    } catch (err) {
      console.error(err)
      setError('تعذّر قراءة الملف. تأكد أنه PDF صالح وغير محمي بكلمة مرور.')
      setFile(null)
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setError('تعذّر النسخ التلقائي. حدد النص وانسخه يدوياً.')
    }
  }

  const handleDownload = () => {
    downloadBlob(new Blob([text], { type: 'text/plain;charset=utf-8' }), 'nasser-pdf-text.txt')
  }

  return (
    <div className="tool-page">
      <h1>استخراج نص من PDF</h1>
      <p className="lead">استخرج كل النص من ملف PDF، وانسخه أو نزّله كملف نصي.</p>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="card">
        <FileDrop accept="application/pdf" onFiles={handleFiles} hint={`PDF فقط — حتى ${MAX_FILE_MB}MB`} />
        {file && (
          <div className="file-list">
            <div className="file-row">
              <span>{file.name}</span>
              <button type="button" onClick={() => { setFile(null); setText('') }}>✕</button>
            </div>
          </div>
        )}
      </div>

      {loading && <p className="hint">جارٍ استخراج النص...</p>}

      {text && !loading && (
        <div className="card">
          <textarea
            readOnly
            value={text}
            rows={16}
            style={{ width: '100%', fontFamily: 'monospace', fontSize: '0.85rem' }}
          />
          <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
            <button className="btn" onClick={handleDownload}>تنزيل كملف .txt</button>
            <button className="btn btn-secondary" onClick={handleCopy}>{copied ? 'تم النسخ ✓' : 'نسخ النص'}</button>
          </div>
        </div>
      )}
    </div>
  )
}
