import { useState } from 'react'
import FileDrop from '../components/FileDrop.jsx'
import SeoContent from '../components/SeoContent.jsx'
import { loadPdfForRendering, renderPageToImageBlob } from '../lib/pdfRender.js'
import { recognizeImages } from '../lib/ocr.js'
import { downloadBlob } from '../lib/imagePdf.js'

const MAX_FILE_MB = 30

const seo = {
  about: {
    heading: 'استخراج نص من صورة أو PDF ممسوح ضوئياً (OCR) مجاناً',
    paragraphs: [
      'أداة التعرف الضوئي على الحروف (OCR) تحوّل النص الموجود داخل صورة أو ملف PDF ممسوح ضوئياً (بدون طبقة نص حقيقية) إلى نص قابل للنسخ والتعديل، بدعم اللغتين العربية والإنجليزية.',
      'مفيدة لاستخراج نص من صورة فاتورة، مستند مصوّر بالهاتف، أو كتاب قديم تم مسحه ضوئياً كصور فقط.'
    ]
  },
  steps: {
    heading: 'كيف تستخرج نص من صورة أو PDF ممسوح؟',
    items: [
      'ارفع صورة (PNG أو JPG) أو ملف PDF ممسوح ضوئياً.',
      'اختر لغة النص: عربي، إنجليزي، أو كلاهما معاً.',
      'اضغط استخراج النص، وانتظر اكتمال المعالجة حسب عدد الصفحات، ثم انسخ النتيجة أو نزّلها كملف .txt.'
    ]
  },
  faq: [
    { q: 'ما الفرق بين هذه الأداة وأداة "استخراج نص من PDF"؟', a: 'أداة "استخراج نص" تعمل مع ملفات PDF التي تحتوي على طبقة نص فعلية بالفعل، بينما OCR مخصصة للصور أو الملفات الممسوحة ضوئياً التي لا تحتوي على نص قابل للقراءة أصلاً.' },
    { q: 'هل تدعم اللغة العربية؟', a: 'نعم، يمكنك اختيار العربية أو الإنجليزية أو كلتيهما معاً حسب لغة النص في الصورة.' },
    { q: 'هل تتم المعالجة على جهازي أم على خادم خارجي؟', a: 'كل المعالجة تتم بالكامل داخل متصفحك، ولا يتم رفع أي صورة أو ملف لأي خادم.' }
  ]
}
const LANGS = [
  { id: 'ara', label: 'العربية' },
  { id: 'eng', label: 'الإنجليزية' },
  { id: 'ara+eng', label: 'عربي + إنجليزي' }
]

export default function OcrTool() {
  const [files, setFiles] = useState([])
  const [lang, setLang] = useState('ara')
  const [text, setText] = useState('')
  const [progress, setProgress] = useState(null)
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleFiles = (picked) => {
    setError('')
    setText('')
    const hasPdf = picked.some((f) => f.type === 'application/pdf')
    const hasImage = picked.some((f) => f.type === 'image/png' || f.type === 'image/jpeg')
    const invalid = picked.some((f) => f.type !== 'application/pdf' && f.type !== 'image/png' && f.type !== 'image/jpeg')

    if (invalid) {
      setError('صيغة غير مدعومة. يُسمح فقط بـ PDF أو PNG أو JPG.')
      return
    }
    if (hasPdf && hasImage) {
      setError('ارفع إما ملف PDF واحد، أو صورة/أكثر — مو مزيج من الاثنين.')
      return
    }
    if (hasPdf && picked.length > 1) {
      setError('ارفع ملف PDF واحد فقط في كل مرة.')
      return
    }
    for (const f of picked) {
      if (f.size > MAX_FILE_MB * 1024 * 1024) {
        setError(`حجم الملف "${f.name}" أكبر من ${MAX_FILE_MB}MB.`)
        return
      }
    }
    setFiles(picked)
  }

  const handleRun = async () => {
    if (files.length === 0) return
    setLoading(true)
    setError('')
    setText('')
    setProgress(null)
    try {
      let images = files
      if (files[0].type === 'application/pdf') {
        const pdfDoc = await loadPdfForRendering(files[0])
        images = []
        for (let p = 1; p <= pdfDoc.numPages; p++) {
          const blob = await renderPageToImageBlob(pdfDoc, p, 1800, 'png')
          images.push(blob)
        }
      }

      const results = await recognizeImages(images, lang, (i, total) => setProgress({ current: i + 1, total }))
      const joined = results.map((t, i) => (results.length > 1 ? `--- ${i + 1} ---\n${t}` : t)).join('\n\n')
      setText(joined.trim() || 'لم يُعثر على نص في الملف.')
    } catch (err) {
      console.error(err)
      setError('تعذّرت عملية التعرف الضوئي على النص. حاول بملف أوضح أو أصغر.')
    } finally {
      setLoading(false)
      setProgress(null)
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
    downloadBlob(new Blob([text], { type: 'text/plain;charset=utf-8' }), 'nasser-pdf-ocr.txt')
  }

  return (
    <div className="tool-page">
      <h1>استخراج نص من صورة (OCR)</h1>
      <p className="lead">
        حوّل نص داخل صورة أو ملف PDF ممسوح ضوئياً (صور بدون طبقة نص) إلى نص قابل للنسخ. يعمل بالكامل داخل متصفحك.
      </p>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="card">
        <FileDrop
          accept="image/png,image/jpeg,application/pdf"
          multiple
          onFiles={handleFiles}
          hint={`PDF أو PNG أو JPG — حتى ${MAX_FILE_MB}MB لكل ملف`}
        />
        {files.length > 0 && (
          <div className="file-list">
            {files.map((f) => (
              <div className="file-row" key={f.name + f.size}>
                <span>{f.name}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card">
        <div className="field">
          <label>لغة النص</label>
          <div className="radio-group">
            {LANGS.map((l) => (
              <label key={l.id}>
                <input type="radio" checked={lang === l.id} onChange={() => setLang(l.id)} /> {l.label}
              </label>
            ))}
          </div>
        </div>
      </div>

      <button className="btn" disabled={files.length === 0 || loading} onClick={handleRun}>
        {loading && <span className="spinner" />}
        {loading
          ? progress
            ? `جارٍ المعالجة (${progress.current}/${progress.total})...`
            : 'جارٍ التحضير...'
          : 'استخراج النص'}
      </button>

      {text && !loading && (
        <div className="card" style={{ marginTop: 16 }}>
          <textarea
            readOnly
            value={text}
            rows={14}
            style={{ width: '100%', fontFamily: 'monospace', fontSize: '0.85rem' }}
          />
          <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
            <button className="btn" onClick={handleDownload}>تنزيل كملف .txt</button>
            <button className="btn btn-secondary" onClick={handleCopy}>{copied ? 'تم النسخ ✓' : 'نسخ النص'}</button>
          </div>
        </div>
      )}

      <SeoContent {...seo} />
    </div>
  )
}
