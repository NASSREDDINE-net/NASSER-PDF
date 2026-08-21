import { useState } from 'react'
import FileDrop from '../components/FileDrop.jsx'
import { mergePdfs } from '../lib/pdfEdit.js'
import { downloadBlob } from '../lib/imagePdf.js'

const MAX_FILE_MB = 75
const MAX_FILES = 50

export default function MergePdf() {
  const [files, setFiles] = useState([]) // { id, file }
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const addFiles = (picked) => {
    setError('')
    const valid = []
    for (const file of picked) {
      if (file.type !== 'application/pdf') {
        setError('صيغة غير مدعومة. يُسمح فقط بملفات PDF.')
        continue
      }
      if (file.size > MAX_FILE_MB * 1024 * 1024) {
        setError(`حجم الملف "${file.name}" أكبر من ${MAX_FILE_MB}MB.`)
        continue
      }
      valid.push(file)
    }
    setFiles((prev) =>
      [...prev, ...valid.map((file) => ({ id: `${file.name}-${file.lastModified}-${Math.random()}`, file }))].slice(
        0,
        MAX_FILES
      )
    )
  }

  const remove = (id) => setFiles((prev) => prev.filter((f) => f.id !== id))

  const move = (index, dir) => {
    setFiles((prev) => {
      const next = [...prev]
      const target = index + dir
      if (target < 0 || target >= next.length) return prev
      ;[next[index], next[target]] = [next[target], next[index]]
      return next
    })
  }

  const handleMerge = async () => {
    if (files.length < 2) return
    setLoading(true)
    setError('')
    try {
      const blob = await mergePdfs(files.map((f) => f.file))
      downloadBlob(blob, 'nasser-pdf-merged.pdf')
    } catch (err) {
      console.error(err)
      setError('تعذّر دمج الملفات. تأكد أنها ملفات PDF صالحة.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="tool-page">
      <h1>دمج ملفات PDF</h1>
      <p className="lead">ارفع عدة ملفات PDF ورتّبها بالترتيب اللي تحبه، ثم ادمجها في ملف واحد.</p>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="card">
        <FileDrop
          accept="application/pdf"
          multiple
          onFiles={addFiles}
          hint={`PDF فقط — حتى ${MAX_FILE_MB}MB لكل ملف، وحتى ${MAX_FILES} ملف`}
        />

        {files.length > 0 && (
          <div className="file-list">
            {files.map((f, index) => (
              <div className="file-row" key={f.id}>
                <span>{f.file.name}</span>
                <span style={{ display: 'flex', gap: 4 }}>
                  <button type="button" onClick={() => move(index, -1)} disabled={index === 0}>↑</button>
                  <button type="button" onClick={() => move(index, 1)} disabled={index === files.length - 1}>↓</button>
                  <button type="button" onClick={() => remove(f.id)}>✕</button>
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <button className="btn" disabled={files.length < 2 || loading} onClick={handleMerge}>
        {loading && <span className="spinner" />}
        {loading ? 'جارٍ الدمج...' : `دمج ${files.length || ''} ملفات وتنزيل`}
      </button>
      {files.length === 1 && <p className="hint" style={{ marginTop: 10 }}>أضف ملف واحد على الأقل إضافي للدمج.</p>}
    </div>
  )
}
