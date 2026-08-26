import { useState } from 'react'
import FileDrop from '../components/FileDrop.jsx'
import SeoContent from '../components/SeoContent.jsx'
import { useT } from '../lib/i18n.jsx'
import { loadPdfForRendering, extractPdfText } from '../lib/pdfRender.js'

const MAX_FILE_MB = 75

const seo = {
  about: {
    heading: 'مقارنة ملفي PDF أونلاين مجاناً',
    paragraphs: [
      'أداة مقارنة PDF تقارن نص ملفين تلقائياً وتُظهر الفروقات كلمة بكلمة، مع تلوين الإضافات باللون الأخضر والحذف باللون الأحمر.',
      'مفيدة لمقارنة نسختين من عقد بعد التفاوض، تتبع التغييرات بين إصدارين من تقرير، أو التأكد من عدم وجود تعديلات غير مقصودة في مستند.'
    ]
  },
  steps: {
    heading: 'كيف تقارن ملفي PDF؟',
    items: [
      'ارفع الملف الأول ثم الملف الثاني.',
      'اضغط "قارن الملفين" لتحليل النصين.',
      'راجع النتيجة: النص المضاف يظهر باللون الأخضر، والمحذوف بخط مشطوب أحمر.'
    ]
  },
  faq: [
    { q: 'هل تقارن التصميم أيضاً أم النص فقط؟', a: 'المقارنة نصية فقط (كلمة بكلمة)، ولا تقارن التنسيق البصري أو الصور.' },
    { q: 'هل تعمل مع ملفات PDF ممسوحة ضوئياً؟', a: 'تحتاج الملفات إلى طبقة نص فعلية؛ للملفات الممسوحة ضوئياً استخدم أداة OCR أولاً على كل ملف.' }
  ]
}

const TXT = {
  ar: {
    title: 'مقارنة ملفي PDF',
    lead: 'ارفع ملفين PDF وشوف الفرق بينهم كلمة بكلمة (مقارنة نصية).',
    badType: 'صيغة غير مدعومة. يُسمح فقط بملفات PDF.',
    tooBig: `حجم الملف أكبر من ${MAX_FILE_MB}MB.`,
    compareFailed: 'تعذّر مقارنة الملفين. تأكد أنهما PDF صالحين وغير محميين بكلمة مرور.',
    hint: `PDF فقط — حتى ${MAX_FILE_MB}MB`,
    fileALabel: 'الملف الأول',
    fileBLabel: 'الملف الثاني',
    loading: 'جارٍ المقارنة...',
    button: 'قارن الملفين',
    pageWord: 'صفحة',
    added: (n) => `+${n} حرف مُضاف`,
    removed: (n) => `-${n} حرف محذوف`
  },
  en: {
    title: 'Compare two PDF files',
    lead: 'Upload two PDF files and see the difference between them word by word.',
    badType: 'Unsupported format. Only PDF files are allowed.',
    tooBig: `File is larger than ${MAX_FILE_MB}MB.`,
    compareFailed: 'Could not compare the files. Make sure both are valid, non-password-protected PDFs.',
    hint: `PDF only — up to ${MAX_FILE_MB}MB`,
    fileALabel: 'First file',
    fileBLabel: 'Second file',
    loading: 'Comparing...',
    button: 'Compare files',
    pageWord: 'pages',
    added: (n) => `+${n} characters added`,
    removed: (n) => `-${n} characters removed`
  }
}

export default function ComparePdf() {
  const t = useT(TXT)
  const [fileA, setFileA] = useState(null)
  const [fileB, setFileB] = useState(null)
  const [diffParts, setDiffParts] = useState(null)
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const pickFile = (setter) => (files) => {
    const picked = files[0]
    setError('')
    setDiffParts(null)
    if (picked.type !== 'application/pdf') {
      setError(t.badType)
      return
    }
    if (picked.size > MAX_FILE_MB * 1024 * 1024) {
      setError(t.tooBig)
      return
    }
    setter(picked)
  }

  const handleCompare = async () => {
    if (!fileA || !fileB) return
    setLoading(true)
    setError('')
    setDiffParts(null)
    try {
      const { diffWords } = await import('diff')
      const [pdfA, pdfB] = await Promise.all([loadPdfForRendering(fileA), loadPdfForRendering(fileB)])
      const [pagesA, pagesB] = await Promise.all([extractPdfText(pdfA), extractPdfText(pdfB)])
      const textA = pagesA.join('\n\n')
      const textB = pagesB.join('\n\n')

      const parts = diffWords(textA, textB)
      setDiffParts(parts)

      const added = parts.filter((p) => p.added).reduce((sum, p) => sum + p.count, 0)
      const removed = parts.filter((p) => p.removed).reduce((sum, p) => sum + p.count, 0)
      setStats({ added, removed, pagesA: pagesA.length, pagesB: pagesB.length })
    } catch (err) {
      console.error(err)
      setError(t.compareFailed)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="tool-page" style={{ maxWidth: 800 }}>
      <h1>{t.title}</h1>
      <p className="lead">{t.lead}</p>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="card">
        <div className="field">
          <label>{t.fileALabel}</label>
          <FileDrop accept="application/pdf" onFiles={pickFile(setFileA)} hint={t.hint} />
          {fileA && (
            <div className="file-list">
              <div className="file-row">
                <span>{fileA.name}</span>
                <button type="button" onClick={() => setFileA(null)}>✕</button>
              </div>
            </div>
          )}
        </div>

        <div className="field">
          <label>{t.fileBLabel}</label>
          <FileDrop accept="application/pdf" onFiles={pickFile(setFileB)} hint={t.hint} />
          {fileB && (
            <div className="file-list">
              <div className="file-row">
                <span>{fileB.name}</span>
                <button type="button" onClick={() => setFileB(null)}>✕</button>
              </div>
            </div>
          )}
        </div>
      </div>

      <button className="btn" disabled={!fileA || !fileB || loading} onClick={handleCompare}>
        {loading && <span className="spinner" />}
        {loading ? t.loading : t.button}
      </button>

      {stats && (
        <div className="card" style={{ marginTop: 16 }}>
          <p className="hint">
            {fileA.name}: {stats.pagesA} {t.pageWord} — {fileB.name}: {stats.pagesB} {t.pageWord}
          </p>
          <p>
            <span style={{ color: '#166534' }}>{t.added(stats.added)}</span>
            {' — '}
            <span style={{ color: '#b91c1c' }}>{t.removed(stats.removed)}</span>
          </p>
        </div>
      )}

      {diffParts && (
        <div className="card" style={{ marginTop: 16, maxHeight: 500, overflowY: 'auto', lineHeight: 2 }}>
          {diffParts.map((part, i) => (
            <span
              key={i}
              style={{
                background: part.added ? '#dcfce7' : part.removed ? '#fee2e2' : 'transparent',
                textDecoration: part.removed ? 'line-through' : 'none',
                color: part.added ? '#166534' : part.removed ? '#b91c1c' : 'inherit'
              }}
            >
              {part.value}
            </span>
          ))}
        </div>
      )}

      <SeoContent {...seo} />
    </div>
  )
}
