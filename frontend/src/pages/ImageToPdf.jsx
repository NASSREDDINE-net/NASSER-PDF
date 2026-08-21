import { useState } from 'react'
import FileDrop from '../components/FileDrop.jsx'
import { imagesToPdf, downloadBlob } from '../lib/imagePdf.js'

const MAX_FILE_MB = 20
const MAX_FILES = 30
const ACCEPTED = ['image/png', 'image/jpeg']

export default function ImageToPdf() {
  const [images, setImages] = useState([]) // { id, file, previewUrl }
  const [pageSize, setPageSize] = useState('a4')
  const [orientation, setOrientation] = useState('portrait')
  const [margin, setMargin] = useState(10)
  const [quality, setQuality] = useState(0.85)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const addFiles = (files) => {
    setError('')
    const valid = []
    for (const file of files) {
      if (!ACCEPTED.includes(file.type)) {
        setError('صيغة غير مدعومة. يُسمح فقط بـ PNG وJPG/JPEG.')
        continue
      }
      if (file.size > MAX_FILE_MB * 1024 * 1024) {
        setError(`حجم الملف "${file.name}" أكبر من ${MAX_FILE_MB}MB.`)
        continue
      }
      valid.push(file)
    }
    setImages((prev) => {
      const next = [
        ...prev,
        ...valid.map((file) => ({
          id: `${file.name}-${file.lastModified}-${Math.random()}`,
          file,
          previewUrl: URL.createObjectURL(file)
        }))
      ]
      return next.slice(0, MAX_FILES)
    })
  }

  const removeImage = (id) => {
    setImages((prev) => prev.filter((img) => img.id !== id))
  }

  const move = (index, direction) => {
    setImages((prev) => {
      const next = [...prev]
      const target = index + direction
      if (target < 0 || target >= next.length) return prev
      ;[next[index], next[target]] = [next[target], next[index]]
      return next
    })
  }

  const handleConvert = async () => {
    if (images.length === 0) return
    setLoading(true)
    setError('')
    try {
      const blob = await imagesToPdf(
        images.map((img) => img.file),
        { pageSize, orientation, marginMm: Number(margin), quality: Number(quality) }
      )
      downloadBlob(blob, 'nasser-pdf-images.pdf')
    } catch (err) {
      console.error(err)
      setError('حدث خطأ أثناء إنشاء ملف PDF. حاول مجدداً.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="tool-page">
      <h1>تحويل الصور إلى PDF</h1>
      <p className="lead">اجمع عدة صور PNG أو JPG في ملف PDF واحد، مع إمكانية ترتيبها والتحكم في التنسيق.</p>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="card">
        <FileDrop
          accept="image/png,image/jpeg"
          multiple
          onFiles={addFiles}
          hint={`PNG أو JPG — حتى ${MAX_FILE_MB}MB لكل صورة، وحتى ${MAX_FILES} صورة`}
        />

        {images.length > 0 && (
          <div className="file-list">
            {images.map((img, index) => (
              <div className="file-row" key={img.id}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <img src={img.previewUrl} alt="" style={{ width: 36, height: 36, objectFit: 'cover', borderRadius: 6 }} />
                  {img.file.name}
                </span>
                <span style={{ display: 'flex', gap: 4 }}>
                  <button type="button" onClick={() => move(index, -1)} title="تحريك لأعلى" disabled={index === 0}>↑</button>
                  <button type="button" onClick={() => move(index, 1)} title="تحريك لأسفل" disabled={index === images.length - 1}>↓</button>
                  <button type="button" onClick={() => removeImage(img.id)} title="حذف">✕</button>
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card">
        <div className="field">
          <label>حجم الصفحة</label>
          <div className="radio-group">
            <label>
              <input type="radio" checked={pageSize === 'a4'} onChange={() => setPageSize('a4')} /> A4
            </label>
            <label>
              <input type="radio" checked={pageSize === 'fit'} onChange={() => setPageSize('fit')} /> حسب حجم الصورة
            </label>
          </div>
        </div>

        {pageSize === 'a4' && (
          <div className="field">
            <label>الاتجاه</label>
            <div className="radio-group">
              <label>
                <input type="radio" checked={orientation === 'portrait'} onChange={() => setOrientation('portrait')} /> عمودي
              </label>
              <label>
                <input type="radio" checked={orientation === 'landscape'} onChange={() => setOrientation('landscape')} /> أفقي
              </label>
            </div>
          </div>
        )}

        <div className="field">
          <label>الهوامش (مم): {margin}</label>
          <input type="range" min="0" max="30" step="1" value={margin} onChange={(e) => setMargin(e.target.value)} style={{ width: '100%' }} />
        </div>

        <div className="field">
          <label>جودة الصورة: {Math.round(quality * 100)}%</label>
          <input type="range" min="0.4" max="1" step="0.05" value={quality} onChange={(e) => setQuality(e.target.value)} style={{ width: '100%' }} />
        </div>
      </div>

      <button className="btn" disabled={images.length === 0 || loading} onClick={handleConvert}>
        {loading && <span className="spinner" />}
        {loading ? 'جارٍ الإنشاء...' : `تحويل ${images.length || ''} إلى PDF وتنزيل`}
      </button>
    </div>
  )
}
