import { useState } from 'react'
import FileDrop from '../components/FileDrop.jsx'
import { watermarkPdf } from '../lib/pdfEdit.js'
import { downloadBlob } from '../lib/imagePdf.js'

const MAX_FILE_MB = 30

export default function WatermarkPdf() {
  const [file, setFile] = useState(null)
  const [text, setText] = useState('CONFIDENTIAL')
  const [opacity, setOpacity] = useState(0.3)
  const [fontSize, setFontSize] = useState(48)
  const [rotationDeg, setRotationDeg] = useState(45)
  const [color, setColor] = useState('gray')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleFiles = (files) => {
    const picked = files[0]
    setError('')
    if (picked.type !== 'application/pdf') {
      setError('صيغة غير مدعومة. يُسمح فقط بملفات PDF.')
      return
    }
    if (picked.size > MAX_FILE_MB * 1024 * 1024) {
      setError(`حجم الملف أكبر من ${MAX_FILE_MB}MB.`)
      return
    }
    setFile(picked)
  }

  const handleApply = async () => {
    if (!file || !text.trim()) return
    setLoading(true)
    setError('')
    try {
      const blob = await watermarkPdf(file, {
        text: text.trim(),
        opacity: Number(opacity),
        fontSize: Number(fontSize),
        rotationDeg: Number(rotationDeg),
        color
      })
      downloadBlob(blob, 'nasser-pdf-watermarked.pdf')
    } catch (err) {
      console.error(err)
      setError('تعذّر إضافة العلامة المائية. تأكد أن الملف PDF صالح.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="tool-page">
      <h1>إضافة علامة مائية</h1>
      <p className="lead">أضف نص علامة مائية فوق كل صفحات ملف PDF.</p>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="card">
        <FileDrop accept="application/pdf" onFiles={handleFiles} hint={`PDF فقط — حتى ${MAX_FILE_MB}MB`} />
        {file && (
          <div className="file-list">
            <div className="file-row">
              <span>{file.name}</span>
              <button type="button" onClick={() => setFile(null)}>✕</button>
            </div>
          </div>
        )}
      </div>

      <div className="card">
        <div className="field">
          <label>نص العلامة المائية</label>
          <input type="text" value={text} onChange={(e) => setText(e.target.value)} />
        </div>

        <div className="field">
          <label>اللون</label>
          <div className="radio-group">
            {[
              ['gray', 'رمادي'],
              ['red', 'أحمر'],
              ['blue', 'أزرق']
            ].map(([value, label]) => (
              <label key={value}>
                <input type="radio" checked={color === value} onChange={() => setColor(value)} /> {label}
              </label>
            ))}
          </div>
        </div>

        <div className="field">
          <label>الشفافية: {Math.round(opacity * 100)}%</label>
          <input type="range" min="0.1" max="1" step="0.05" value={opacity} onChange={(e) => setOpacity(e.target.value)} style={{ width: '100%' }} />
        </div>

        <div className="field">
          <label>حجم الخط: {fontSize}</label>
          <input type="range" min="16" max="100" step="2" value={fontSize} onChange={(e) => setFontSize(e.target.value)} style={{ width: '100%' }} />
        </div>

        <div className="field">
          <label>زاوية الدوران: {rotationDeg}°</label>
          <input type="range" min="-90" max="90" step="5" value={rotationDeg} onChange={(e) => setRotationDeg(e.target.value)} style={{ width: '100%' }} />
        </div>
      </div>

      <button className="btn" disabled={!file || !text.trim() || loading} onClick={handleApply}>
        {loading && <span className="spinner" />}
        {loading ? 'جارٍ الإضافة...' : 'إضافة العلامة المائية وتنزيل'}
      </button>
    </div>
  )
}
