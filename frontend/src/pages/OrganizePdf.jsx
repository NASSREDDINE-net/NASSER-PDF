import { useState } from 'react'
import FileDrop from '../components/FileDrop.jsx'
import { getPdfPageCount, organizePdf } from '../lib/pdfEdit.js'
import { downloadBlob } from '../lib/imagePdf.js'

const MAX_FILE_MB = 30

export default function OrganizePdf() {
  const [file, setFile] = useState(null)
  const [pages, setPages] = useState([]) // { id, originalIndex, rotateBy }
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleFiles = async (files) => {
    const picked = files[0]
    setError('')
    setPages([])
    if (picked.type !== 'application/pdf') {
      setError('صيغة غير مدعومة. يُسمح فقط بملفات PDF.')
      return
    }
    if (picked.size > MAX_FILE_MB * 1024 * 1024) {
      setError(`حجم الملف أكبر من ${MAX_FILE_MB}MB.`)
      return
    }
    try {
      const count = await getPdfPageCount(picked)
      setFile(picked)
      setPages(
        Array.from({ length: count }, (_, i) => ({ id: `p${i}`, originalIndex: i, rotateBy: 0 }))
      )
    } catch {
      setError('تعذّر قراءة الملف. تأكد أنه PDF صالح وغير محمي بكلمة مرور.')
    }
  }

  const rotate = (id, delta) => {
    setPages((prev) =>
      prev.map((p) => (p.id === id ? { ...p, rotateBy: (p.rotateBy + delta + 360) % 360 } : p))
    )
  }

  const remove = (id) => setPages((prev) => prev.filter((p) => p.id !== id))

  const move = (index, dir) => {
    setPages((prev) => {
      const next = [...prev]
      const target = index + dir
      if (target < 0 || target >= next.length) return prev
      ;[next[index], next[target]] = [next[target], next[index]]
      return next
    })
  }

  const handleApply = async () => {
    if (!file || pages.length === 0) return
    setLoading(true)
    setError('')
    try {
      const blob = await organizePdf(file, pages)
      downloadBlob(blob, 'nasser-pdf-organized.pdf')
    } catch (err) {
      console.error(err)
      setError('تعذّر تعديل الملف. حاول مجدداً.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="tool-page">
      <h1>ترتيب صفحات PDF</h1>
      <p className="lead">دوّر، احذف، أو أعد ترتيب صفحات ملف PDF واحد.</p>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="card">
        <FileDrop accept="application/pdf" onFiles={handleFiles} hint={`PDF فقط — حتى ${MAX_FILE_MB}MB`} />
        {file && <p className="hint" style={{ marginTop: 10 }}>{file.name} — {pages.length} صفحة متبقية</p>}
      </div>

      {pages.length > 0 && (
        <div className="card">
          <div className="file-list">
            {pages.map((p, index) => (
              <div className="file-row" key={p.id}>
                <span>
                  صفحة {p.originalIndex + 1}
                  {p.rotateBy ? ` — تدوير ${p.rotateBy}°` : ''}
                </span>
                <span style={{ display: 'flex', gap: 4 }}>
                  <button type="button" onClick={() => move(index, -1)} disabled={index === 0} title="تحريك لأعلى">↑</button>
                  <button type="button" onClick={() => move(index, 1)} disabled={index === pages.length - 1} title="تحريك لأسفل">↓</button>
                  <button type="button" onClick={() => rotate(p.id, -90)} title="تدوير لليسار">⟲</button>
                  <button type="button" onClick={() => rotate(p.id, 90)} title="تدوير لليمين">⟳</button>
                  <button type="button" onClick={() => remove(p.id)} title="حذف الصفحة">✕</button>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <button className="btn" disabled={pages.length === 0 || loading} onClick={handleApply}>
        {loading && <span className="spinner" />}
        {loading ? 'جارٍ الحفظ...' : 'حفظ التعديلات وتنزيل'}
      </button>
    </div>
  )
}
