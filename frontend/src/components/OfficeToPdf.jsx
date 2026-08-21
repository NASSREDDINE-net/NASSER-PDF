import { useState } from 'react'
import FileDrop from './FileDrop.jsx'
import { convertOfficeToPdf, ApiError } from '../lib/api.js'
import { downloadBlob } from '../lib/imagePdf.js'

const MAX_FILE_MB = 100

export default function OfficeToPdf({ title, lead, accept, extensions, hint }) {
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
      setError(`صيغة غير مدعومة. الصيغ المسموح بها: ${extensions.join(', ')}`)
      return
    }
    if (picked.size > MAX_FILE_MB * 1024 * 1024) {
      setError(`حجم الملف أكبر من ${MAX_FILE_MB}MB.`)
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
      const blob = await convertOfficeToPdf(file)
      const outName = file.name.replace(/\.[^.]+$/, '') + '.pdf'
      downloadBlob(blob, outName)
      setDone(true)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'حدث خطأ غير متوقع أثناء التحويل.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="tool-page">
      <h1>{title}</h1>
      <p className="lead">{lead}</p>

      {error && <div className="alert alert-error">{error}</div>}
      {done && <div className="alert alert-success">تم التحويل بنجاح، بدأ تنزيل الملف.</div>}

      <div className="card">
        <FileDrop accept={accept} onFiles={handleFiles} hint={hint} />

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
        {loading ? 'جارٍ التحويل...' : 'تحويل إلى PDF وتنزيل'}
      </button>
    </div>
  )
}
