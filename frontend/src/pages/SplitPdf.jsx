import { useState } from 'react'
import FileDrop from '../components/FileDrop.jsx'
import SeoContent from '../components/SeoContent.jsx'
import { getPdfPageCount, parsePageRanges, splitPdfByRanges, splitPdfToSinglePages } from '../lib/pdfEdit.js'
import { downloadBlob } from '../lib/imagePdf.js'
import { downloadFilesAsZip } from '../lib/zip.js'

const MAX_FILE_MB = 75

const seo = {
  about: {
    heading: 'تقسيم ملفات PDF أونلاين مجاناً',
    paragraphs: [
      'أداة تقسيم PDF تتيح لك استخراج نطاق صفحات محدد من ملف PDF، أو تقسيم كل صفحة إلى ملف مستقل، بدون الحاجة لأي برنامج خارجي.',
      'مفيدة عندما تحتاج فصل فصل معين من كتاب، استخراج صفحة واحدة من عقد طويل، أو تقسيم ملف كبير إلى ملفات أصغر يسهل إرسالها.'
    ]
  },
  steps: {
    heading: 'كيف تقسّم ملف PDF؟',
    items: [
      'ارفع ملف PDF الذي تريد تقسيمه.',
      'اختر بين استخراج نطاقات صفحات محددة (مثل 1-3,5,7-9) أو تقسيم كل صفحة إلى ملف منفصل.',
      'اضغط تقسيم وتنزيل — إذا كانت النتيجة أكثر من ملف، سيتم تجميعها في ملف مضغوط (zip).'
    ]
  },
  faq: [
    { q: 'كيف أكتب نطاق الصفحات؟', a: 'استخدم صيغة مثل 1-3,5,7-9 لاستخراج الصفحات من 1 إلى 3، ثم الصفحة 5، ثم من 7 إلى 9، كل نطاق في ملف منفصل.' },
    { q: 'هل يمكنني تقسيم ملف محمي بكلمة مرور؟', a: 'حالياً الأداة تدعم فقط ملفات PDF غير المحمية بكلمة مرور.' }
  ]
}

export default function SplitPdf() {
  const [file, setFile] = useState(null)
  const [pageCount, setPageCount] = useState(null)
  const [mode, setMode] = useState('ranges')
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

  const handleSplit = async () => {
    if (!file) return
    setLoading(true)
    setError('')
    try {
      if (mode === 'single') {
        const outputs = await splitPdfToSinglePages(file)
        await downloadFilesAsZip(outputs, 'nasser-pdf-pages.zip')
      } else {
        const ranges = parsePageRanges(rangesInput, pageCount)
        const outputs = await splitPdfByRanges(file, ranges)
        if (outputs.length === 1) {
          downloadBlob(new Blob([outputs[0].bytes], { type: 'application/pdf' }), outputs[0].name)
        } else {
          await downloadFilesAsZip(outputs, 'nasser-pdf-split.zip')
        }
      }
    } catch (err) {
      setError(err.message || 'تعذّر تقسيم الملف.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="tool-page">
      <h1>تقسيم PDF</h1>
      <p className="lead">استخرج صفحات محددة أو قسّم الملف إلى صفحة واحدة لكل ملف.</p>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="card">
        <FileDrop accept="application/pdf" onFiles={handleFiles} hint={`PDF فقط — حتى ${MAX_FILE_MB}MB`} />

        {file && (
          <div className="file-list">
            <div className="file-row">
              <span>{file.name}{pageCount ? ` — ${pageCount} صفحة` : ''}</span>
              <button type="button" onClick={() => { setFile(null); setPageCount(null) }}>✕</button>
            </div>
          </div>
        )}
      </div>

      {file && pageCount && (
        <div className="card">
          <div className="field">
            <label>طريقة التقسيم</label>
            <div className="radio-group">
              <label>
                <input type="radio" checked={mode === 'ranges'} onChange={() => setMode('ranges')} /> نطاقات صفحات محددة
              </label>
              <label>
                <input type="radio" checked={mode === 'single'} onChange={() => setMode('single')} /> كل صفحة في ملف مستقل
              </label>
            </div>
          </div>

          {mode === 'ranges' && (
            <div className="field">
              <label>النطاقات (مثال: 1-3,5,7-9)</label>
              <input
                type="text"
                placeholder="1-3,5,7-9"
                value={rangesInput}
                onChange={(e) => setRangesInput(e.target.value)}
              />
              <p className="hint">الملف فيه {pageCount} صفحة. كل نطاق ينتج ملف PDF منفصل (يُضغط في zip إذا أكثر من نطاق).</p>
            </div>
          )}
        </div>
      )}

      <button
        className="btn"
        disabled={!file || !pageCount || loading || (mode === 'ranges' && !rangesInput.trim())}
        onClick={handleSplit}
      >
        {loading && <span className="spinner" />}
        {loading ? 'جارٍ التقسيم...' : 'تقسيم وتنزيل'}
      </button>

      <SeoContent {...seo} />
    </div>
  )
}
