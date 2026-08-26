import { useState } from 'react'
import FileDrop from '../components/FileDrop.jsx'
import SeoContent from '../components/SeoContent.jsx'
import { useT } from '../lib/i18n.jsx'
import { mergePdfs } from '../lib/pdfEdit.js'
import { downloadBlob } from '../lib/imagePdf.js'

const MAX_FILE_MB = 75
const MAX_FILES = 50

const TXT = {
  ar: {
    title: 'دمج ملفات PDF',
    lead: 'ارفع عدة ملفات PDF ورتّبها بالترتيب اللي تحبه، ثم ادمجها في ملف واحد.',
    badType: 'صيغة غير مدعومة. يُسمح فقط بملفات PDF.',
    tooBig: (name) => `حجم الملف "${name}" أكبر من ${MAX_FILE_MB}MB.`,
    hint: `PDF فقط — حتى ${MAX_FILE_MB}MB لكل ملف، وحتى ${MAX_FILES} ملف`,
    failed: 'تعذّر دمج الملفات. تأكد أنها ملفات PDF صالحة.',
    loading: 'جارٍ الدمج...',
    button: (n) => `دمج ${n || ''} ملفات وتنزيل`,
    addOneMore: 'أضف ملف واحد على الأقل إضافي للدمج.'
  },
  en: {
    title: 'Merge PDF files',
    lead: 'Upload several PDF files, arrange them in the order you want, then merge them into one.',
    badType: 'Unsupported format. Only PDF files are allowed.',
    tooBig: (name) => `File "${name}" is larger than ${MAX_FILE_MB}MB.`,
    hint: `PDF only — up to ${MAX_FILE_MB}MB per file, up to ${MAX_FILES} files`,
    failed: 'Could not merge the files. Make sure they are valid PDFs.',
    loading: 'Merging...',
    button: (n) => `Merge ${n || ''} files and download`,
    addOneMore: 'Add at least one more file to merge.'
  }
}

const seo = {
  about: {
    heading: 'دمج ملفات PDF أونلاين مجاناً',
    paragraphs: [
      'أداة دمج PDF تتيح لك جمع عدة ملفات PDF في ملف واحد منظم، مع إمكانية إعادة ترتيبها بالسحب قبل الدمج النهائي.',
      'مفيدة لدمج فصول كتاب، أوراق امتحان، فواتير شهرية متعددة، أو أي مجموعة مستندات تحتاج تسليمها كملف واحد بدل عدة ملفات منفصلة.'
    ]
  },
  steps: {
    heading: 'كيف تدمج ملفات PDF؟',
    items: [
      'ارفع ملفين PDF أو أكثر (حتى 50 ملفاً).',
      'رتّب الملفات بالترتيب الذي تريده باستخدام أسهم التحريك.',
      'اضغط دمج الملفات وتنزيل — سيتم إنشاء ملف PDF واحد يحتوي على كل الصفحات بالترتيب المحدد.'
    ]
  },
  faq: [
    { q: 'كم ملف يمكنني دمجه دفعة واحدة؟', a: 'يمكنك دمج حتى 50 ملف PDF، بحد أقصى 75 ميجابايت لكل ملف.' },
    { q: 'هل يبقى ترتيب الصفحات داخل كل ملف كما هو؟', a: 'نعم، فقط ترتيب الملفات نفسها هو ما يمكنك التحكم فيه؛ الصفحات داخل كل ملف تبقى بترتيبها الأصلي.' }
  ]
}

export default function MergePdf() {
  const t = useT(TXT)
  const [files, setFiles] = useState([]) // { id, file }
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const addFiles = (picked) => {
    setError('')
    const valid = []
    for (const file of picked) {
      if (file.type !== 'application/pdf') {
        setError(t.badType)
        continue
      }
      if (file.size > MAX_FILE_MB * 1024 * 1024) {
        setError(t.tooBig(file.name))
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
      setError(t.failed)
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
        <FileDrop
          accept="application/pdf"
          multiple
          onFiles={addFiles}
          hint={t.hint}
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
        {loading ? t.loading : t.button(files.length)}
      </button>
      {files.length === 1 && <p className="hint" style={{ marginTop: 10 }}>{t.addOneMore}</p>}

      <SeoContent {...seo} />
    </div>
  )
}
