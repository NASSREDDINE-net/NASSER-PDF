import { useState } from 'react'
import FileDrop from '../components/FileDrop.jsx'
import { compressPdf, ApiError } from '../lib/api.js'
import { downloadBlob } from '../lib/imagePdf.js'

const MAX_FILE_MB = 100
const PROFILES = [
  { id: 'print', label: 'جودة عالية (ضغط أقل)' },
  { id: 'web', label: 'متوازن (موصى به)' },
  { id: 'archive', label: 'أصغر حجم (جودة أقل)' }
]

export default function CompressPdf() {
  const [file, setFile] = useState(null)
  const [profile, setProfile] = useState('web')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  const handleFiles = (files) => {
    const picked = files[0]
    setError('')
    setDone(false)
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

  const handleCompress = async () => {
    if (!file) return
    setLoading(true)
    setError('')
    setDone(false)
    try {
      const blob = await compressPdf(file, profile)
      const outName = file.name.replace(/\.pdf$/i, '') + '-compressed.pdf'
      downloadBlob(blob, outName)
      setDone(true)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'حدث خطأ غير متوقع أثناء الضغط.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="tool-page">
      <h1>ضغط PDF</h1>
      <p className="lead">قلّل حجم ملف PDF مع الحفاظ على جودة معقولة حسب الإعداد اللي تختاره.</p>

      {error && <div className="alert alert-error">{error}</div>}
      {done && <div className="alert alert-success">تم الضغط بنجاح، بدأ تنزيل الملف.</div>}

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
          <label>مستوى الضغط</label>
          <div className="radio-group">
            {PROFILES.map((p) => (
              <label key={p.id}>
                <input type="radio" checked={profile === p.id} onChange={() => setProfile(p.id)} /> {p.label}
              </label>
            ))}
          </div>
        </div>
      </div>

      <button className="btn" disabled={!file || loading} onClick={handleCompress}>
        {loading && <span className="spinner" />}
        {loading ? 'جارٍ الضغط...' : 'ضغط الملف وتنزيل'}
      </button>
    </div>
  )
}
