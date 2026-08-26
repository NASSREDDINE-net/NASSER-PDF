import { useState } from 'react'
import FileDrop from '../components/FileDrop.jsx'
import SeoContent from '../components/SeoContent.jsx'
import { useT } from '../lib/i18n.jsx'
import { getPdfPageCount, organizePdf } from '../lib/pdfEdit.js'
import { downloadBlob } from '../lib/imagePdf.js'

const MAX_FILE_MB = 75

const seo = {
  about: {
    heading: 'ترتيب وتدوير صفحات PDF أونلاين مجاناً',
    paragraphs: [
      'أداة ترتيب صفحات PDF تتيح لك إعادة ترتيب الصفحات، حذف صفحات غير مرغوبة، وتدوير أي صفحة بزاوية معينة، كل ذلك بمعاينة مباشرة قبل الحفظ.',
      'مفيدة لتصحيح ملف تم مسحه ضوئياً بترتيب أو اتجاه خاطئ، أو لإزالة صفحات فارغة قبل إرسال المستند.'
    ]
  },
  steps: {
    heading: 'كيف ترتّب صفحات PDF؟',
    items: [
      'ارفع ملف PDF لتظهر لك قائمة بجميع صفحاته.',
      'استخدم الأسهم لتحريك الصفحات، أزرار التدوير لتغيير الاتجاه، وزر الحذف لإزالة أي صفحة غير مرغوبة.',
      'اضغط حفظ التعديلات وتنزيل للحصول على النسخة الجديدة من الملف.'
    ]
  },
  faq: [
    { q: 'هل يمكنني استرجاع صفحة حذفتها بالخطأ؟', a: 'يمكنك إعادة رفع الملف الأصلي من جديد قبل حفظ التعديلات، لأن الحذف لا يُطبَّق نهائياً إلا بعد الضغط على زر الحفظ.' },
    { q: 'هل التعديلات تتم على جهازي أم على الخادم؟', a: 'كل المعالجة تتم بالكامل داخل متصفحك، لا يتم رفع الملف لأي خادم.' }
  ]
}

const TXT = {
  ar: {
    title: 'ترتيب صفحات PDF',
    lead: 'دوّر، احذف، أو أعد ترتيب صفحات ملف PDF واحد.',
    badType: 'صيغة غير مدعومة. يُسمح فقط بملفات PDF.',
    tooBig: `حجم الملف أكبر من ${MAX_FILE_MB}MB.`,
    readFailed: 'تعذّر قراءة الملف. تأكد أنه PDF صالح وغير محمي بكلمة مرور.',
    applyFailed: 'تعذّر تعديل الملف. حاول مجدداً.',
    hint: `PDF فقط — حتى ${MAX_FILE_MB}MB`,
    remaining: (n) => `${n} صفحة متبقية`,
    page: (n) => `صفحة ${n}`,
    rotated: (deg) => ` — تدوير ${deg}°`,
    up: 'تحريك لأعلى',
    down: 'تحريك لأسفل',
    rotateLeft: 'تدوير لليسار',
    rotateRight: 'تدوير لليمين',
    delete: 'حذف الصفحة',
    loading: 'جارٍ الحفظ...',
    button: 'حفظ التعديلات وتنزيل'
  },
  en: {
    title: 'Organize PDF pages',
    lead: 'Rotate, delete, or reorder the pages of a single PDF file.',
    badType: 'Unsupported format. Only PDF files are allowed.',
    tooBig: `File is larger than ${MAX_FILE_MB}MB.`,
    readFailed: 'Could not read the file. Make sure it’s a valid PDF and not password-protected.',
    applyFailed: 'Could not modify the file. Please try again.',
    hint: `PDF only — up to ${MAX_FILE_MB}MB`,
    remaining: (n) => `${n} pages remaining`,
    page: (n) => `Page ${n}`,
    rotated: (deg) => ` — rotated ${deg}°`,
    up: 'Move up',
    down: 'Move down',
    rotateLeft: 'Rotate left',
    rotateRight: 'Rotate right',
    delete: 'Delete page',
    loading: 'Saving...',
    button: 'Save changes and download'
  }
}

export default function OrganizePdf() {
  const t = useT(TXT)
  const [file, setFile] = useState(null)
  const [pages, setPages] = useState([]) // { id, originalIndex, rotateBy }
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleFiles = async (files) => {
    const picked = files[0]
    setError('')
    setPages([])
    if (picked.type !== 'application/pdf') {
      setError(t.badType)
      return
    }
    if (picked.size > MAX_FILE_MB * 1024 * 1024) {
      setError(t.tooBig)
      return
    }
    try {
      const count = await getPdfPageCount(picked)
      setFile(picked)
      setPages(
        Array.from({ length: count }, (_, i) => ({ id: `p${i}`, originalIndex: i, rotateBy: 0 }))
      )
    } catch {
      setError(t.readFailed)
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
      setError(t.applyFailed)
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
        {file && <p className="hint" style={{ marginTop: 10 }}>{file.name} — {t.remaining(pages.length)}</p>}
      </div>

      {pages.length > 0 && (
        <div className="card">
          <div className="file-list">
            {pages.map((p, index) => (
              <div className="file-row" key={p.id}>
                <span>
                  {t.page(p.originalIndex + 1)}
                  {p.rotateBy ? t.rotated(p.rotateBy) : ''}
                </span>
                <span style={{ display: 'flex', gap: 4 }}>
                  <button type="button" onClick={() => move(index, -1)} disabled={index === 0} title={t.up}>↑</button>
                  <button type="button" onClick={() => move(index, 1)} disabled={index === pages.length - 1} title={t.down}>↓</button>
                  <button type="button" onClick={() => rotate(p.id, -90)} title={t.rotateLeft}>⟲</button>
                  <button type="button" onClick={() => rotate(p.id, 90)} title={t.rotateRight}>⟳</button>
                  <button type="button" onClick={() => remove(p.id)} title={t.delete}>✕</button>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <button className="btn" disabled={pages.length === 0 || loading} onClick={handleApply}>
        {loading && <span className="spinner" />}
        {loading ? t.loading : t.button}
      </button>

      <SeoContent {...seo} />
    </div>
  )
}
