import { useState } from 'react'
import FileDrop from '../components/FileDrop.jsx'
import SeoContent from '../components/SeoContent.jsx'
import { useT } from '../lib/i18n.jsx'
import { loadPdfForRendering, renderPageToImageBlob } from '../lib/pdfRender.js'
import { getPdfPageCount, parsePageRanges } from '../lib/pdfEdit.js'
import { downloadBlob } from '../lib/imagePdf.js'
import { downloadFilesAsZip } from '../lib/zip.js'

const MAX_FILE_MB = 75

const seo = {
  about: {
    heading: 'تحويل PDF إلى صور PNG أو JPG أونلاين مجاناً',
    paragraphs: [
      'حوّل كل صفحة من ملف PDF إلى صورة منفصلة بصيغة PNG أو JPG، مع اختيار مستوى الجودة (من سريعة ومنخفضة الحجم إلى عالية الدقة) ونطاق الصفحات المطلوب.',
      'مفيدة لمشاركة صفحة واحدة من مستند على وسائل التواصل الاجتماعي، أو استخدام محتوى PDF داخل عرض تقديمي أو تصميم جرافيكي.'
    ]
  },
  steps: {
    heading: 'كيف تحوّل PDF إلى صور؟',
    items: [
      'ارفع ملف PDF الذي تريد تحويله.',
      'اختر الصيغة (PNG أو JPG)، مستوى الجودة، والصفحات المطلوبة (الكل أو نطاق محدد).',
      'اضغط تحويل وتنزيل — صورة واحدة تُنزَّل مباشرة، وعدة صور تُجمَّع في ملف مضغوط.'
    ]
  },
  faq: [
    { q: 'ما الفرق بين PNG وJPG هنا؟', a: 'PNG يحافظ على جودة أعلى للنصوص والرسومات الدقيقة، بينما JPG أصغر حجماً ومناسب أكثر للصور الفوتوغرافية.' },
    { q: 'هل يمكنني تحويل صفحة واحدة فقط؟', a: 'نعم، اختر "نطاق محدد" واكتب رقم الصفحة أو النطاق الذي تريده.' }
  ]
}

const TXT = {
  ar: {
    title: 'تحويل PDF إلى صور',
    lead: 'حوّل صفحات ملف PDF إلى صور PNG أو JPG، بالكامل داخل متصفحك.',
    badType: 'صيغة غير مدعومة. يُسمح فقط بملفات PDF.',
    tooBig: `حجم الملف أكبر من ${MAX_FILE_MB}MB.`,
    readFailed: 'تعذّر قراءة الملف. تأكد أنه PDF صالح وغير محمي بكلمة مرور.',
    convertFailed: 'تعذّر تحويل الملف إلى صور.',
    hint: `PDF فقط — حتى ${MAX_FILE_MB}MB`,
    pageWord: 'صفحة',
    formatLabel: 'الصيغة',
    qualityLabel: 'الجودة',
    qualityPresets: { low: 'منخفضة (سريعة)', medium: 'متوسطة', high: 'عالية' },
    pagesLabel: 'الصفحات',
    allPages: 'كل الصفحات',
    rangeOption: 'نطاق محدد',
    rangeExample: 'مثال: 1-3,5',
    loading: 'جارٍ التحويل...',
    button: 'تحويل وتنزيل'
  },
  en: {
    title: 'Convert PDF to Images',
    lead: 'Convert PDF pages to PNG or JPG images, entirely inside your browser.',
    badType: 'Unsupported format. Only PDF files are allowed.',
    tooBig: `File is larger than ${MAX_FILE_MB}MB.`,
    readFailed: 'Could not read the file. Make sure it’s a valid PDF and not password-protected.',
    convertFailed: 'Could not convert the file to images.',
    hint: `PDF only — up to ${MAX_FILE_MB}MB`,
    pageWord: 'pages',
    formatLabel: 'Format',
    qualityLabel: 'Quality',
    qualityPresets: { low: 'Low (fast)', medium: 'Medium', high: 'High' },
    pagesLabel: 'Pages',
    allPages: 'All pages',
    rangeOption: 'Specific range',
    rangeExample: 'e.g. 1-3,5',
    loading: 'Converting...',
    button: 'Convert and download'
  }
}

const QUALITY_PRESETS = {
  low: { width: 900 },
  medium: { width: 1500 },
  high: { width: 2200 }
}

export default function PdfToImage() {
  const t = useT(TXT)
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
      setError(t.badType)
      return
    }
    if (picked.size > MAX_FILE_MB * 1024 * 1024) {
      setError(t.tooBig)
      return
    }
    setFile(picked)
    try {
      const count = await getPdfPageCount(picked)
      setPageCount(count)
    } catch {
      setError(t.readFailed)
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
      setError(err.message || t.convertFailed)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="tool-page">
      <h1>{t.title}</h1>
      <p className="lead">{t.lead}</p>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="card">
        <FileDrop accept="application/pdf" onFiles={handleFiles} hint={t.hint} />
        {file && pageCount && (
          <div className="file-list">
            <div className="file-row">
              <span>{file.name} — {pageCount} {t.pageWord}</span>
              <button type="button" onClick={() => { setFile(null); setPageCount(null) }}>✕</button>
            </div>
          </div>
        )}
      </div>

      {file && pageCount && (
        <div className="card">
          <div className="field">
            <label>{t.formatLabel}</label>
            <div className="radio-group">
              <label><input type="radio" checked={format === 'png'} onChange={() => setFormat('png')} /> PNG</label>
              <label><input type="radio" checked={format === 'jpeg'} onChange={() => setFormat('jpeg')} /> JPG</label>
            </div>
          </div>

          <div className="field">
            <label>{t.qualityLabel}</label>
            <div className="radio-group">
              {Object.keys(QUALITY_PRESETS).map((key) => (
                <label key={key}>
                  <input type="radio" checked={quality === key} onChange={() => setQuality(key)} /> {t.qualityPresets[key]}
                </label>
              ))}
            </div>
          </div>

          <div className="field">
            <label>{t.pagesLabel}</label>
            <div className="radio-group">
              <label><input type="radio" checked={scope === 'all'} onChange={() => setScope('all')} /> {t.allPages}</label>
              <label><input type="radio" checked={scope === 'ranges'} onChange={() => setScope('ranges')} /> {t.rangeOption}</label>
            </div>
          </div>

          {scope === 'ranges' && (
            <div className="field">
              <label>{t.rangeExample}</label>
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
        {loading ? t.loading : t.button}
      </button>

      <SeoContent {...seo} />
    </div>
  )
}
