import { useState } from 'react'
import FileDrop from '../components/FileDrop.jsx'
import { loadPdfForRendering, renderPageToImageBlob } from '../lib/pdfRender.js'
import { getPdfPageCount, parsePageRanges } from '../lib/pdfEdit.js'
import { downloadBlob } from '../lib/imagePdf.js'
import { downloadFilesAsZip } from '../lib/zip.js'

const MAX_FILE_MB = 75
const QUALITY_PRESETS = {
  low: { label: 'منخفضة (سريعة)', width: 900 },
  medium: { label: 'متوسطة', width: 1500 },
  high: { label: 'عالية', width: 2200 }
}

export default function PdfToImage() {
  const [file, setFile] = useState(null)
  const [pageCount, setPageCount] = useState(null)
  const [format, setFormat] = useState('png')
  const [quality, setQuality] = useState('medium')
  const [scope, setScope] = useState('all')
  const [rangesInput, setRangesInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleFiles = async (files) => {
    const picked = files[0]
    setError('')
    setPageCount(null)
    if (picked.type !== 'application/pdf') {
      setError('صيغة غير مدعومة. يُسمح فقط بملفات PDF.')
      return
    }
    if (picked.size > MAX_FILE_MB * 1024 * 1024) {
      setError(`حجم الملف أكبر من ${MAX_FILE_MB}MB.`)
      return
    }
    setFile(picked)
    try {
      const count = await getPdfPageCount(picked)
      setPageCount(count)
    } catch {
      setError('تعذّر قراءة الملف. تأكد أنه PDF صالح وغير محمي بكلمة مرور.')
      setFile(null)
    }
  }

  const handleConvert = async () => {
    if (!file || !pageCount) return
    setLoading(true)
    setError('')
    try {
      let pageNumbers
      if (scope === 'all') {
        pageNumbers = Array.from({ length: pageCount }, (_, i) => i + 1)
      } else {
        const ranges = parsePageRanges(rangesInput, pageCount)
        pageNumbers = []
        ranges.forEach(({ start, end }) => {
          for (let p = start; p <= end; p++) pageNumbers.push(p)
        })
      }

      const pdfDoc = await loadPdfForRendering(file)
      const width = QUALITY_PRESETS[quality].width
      const outputs = []
      for (const pageNumber of pageNumbers) {
        const blob = await renderPageToImageBlob(pdfDoc, pageNumber, width, format)
        const bytes = await blob.arrayBuffer()
        outputs.push({ name: `page-${pageNumber}.${format === 'jpeg' ? 'jpg' : 'png'}`, bytes })
      }

      if (outputs.length === 1) {
        downloadBlob(new Blob([outputs[0].bytes], { type: format === 'jpeg' ? 'image/jpeg' : 'image/png' }), outputs[0].name)
      } else {
        await downloadFilesAsZip(outputs, 'nasser-pdf-images.zip')
      }
    } catch (err) {
      setError(err.message || 'تعذّر تحويل الملف إلى صور.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="tool-page">
      <h1>تحويل PDF إلى صور</h1>
      <p className="lead">حوّل صفحات ملف PDF إلى صور PNG أو JPG، بالكامل داخل متصفحك.</p>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="card">
        <FileDrop accept="application/pdf" onFiles={handleFiles} hint={`PDF فقط — حتى ${MAX_FILE_MB}MB`} />
        {file && pageCount && (
          <div className="file-list">
            <div className="file-row">
              <span>{file.name} — {pageCount} صفحة</span>
              <button type="button" onClick={() => { setFile(null); setPageCount(null) }}>✕</button>
            </div>
          </div>
        )}
      </div>

      {file && pageCount && (
        <div className="card">
          <div className="field">
            <label>الصيغة</label>
            <div className="radio-group">
              <label><input type="radio" checked={format === 'png'} onChange={() => setFormat('png')} /> PNG</label>
              <label><input type="radio" checked={format === 'jpeg'} onChange={() => setFormat('jpeg')} /> JPG</label>
            </div>
          </div>

          <div className="field">
            <label>الجودة</label>
            <div className="radio-group">
              {Object.entries(QUALITY_PRESETS).map(([key, preset]) => (
                <label key={key}>
                  <input type="radio" checked={quality === key} onChange={() => setQuality(key)} /> {preset.label}
                </label>
              ))}
            </div>
          </div>

          <div className="field">
            <label>الصفحات</label>
            <div className="radio-group">
              <label><input type="radio" checked={scope === 'all'} onChange={() => setScope('all')} /> كل الصفحات</label>
              <label><input type="radio" checked={scope === 'ranges'} onChange={() => setScope('ranges')} /> نطاق محدد</label>
            </div>
          </div>

          {scope === 'ranges' && (
            <div className="field">
              <label>مثال: 1-3,5</label>
              <input type="text" placeholder="1-3,5" value={rangesInput} onChange={(e) => setRangesInput(e.target.value)} />
            </div>
          )}
        </div>
      )}

      <button
        className="btn"
        disabled={!file || !pageCount || loading || (scope === 'ranges' && !rangesInput.trim())}
        onClick={handleConvert}
      >
        {loading && <span className="spinner" />}
        {loading ? 'جارٍ التحويل...' : 'تحويل وتنزيل'}
      </button>
    </div>
  )
}
