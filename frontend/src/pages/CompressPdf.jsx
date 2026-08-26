import { useState } from 'react'
import FileDrop from '../components/FileDrop.jsx'
import GoogleSignInGate from '../components/GoogleSignInGate.jsx'
import SeoContent from '../components/SeoContent.jsx'
import { useT } from '../lib/i18n.jsx'
import { compressPdf, ApiError } from '../lib/api.js'
import { downloadBlob } from '../lib/imagePdf.js'

const MAX_FILE_MB = 100

const TXT = {
  ar: {
    title: 'ضغط PDF',
    lead: 'قلّل حجم ملف PDF مع الحفاظ على جودة معقولة حسب الإعداد اللي تختاره.',
    badType: 'صيغة غير مدعومة. يُسمح فقط بملفات PDF.',
    tooBig: `حجم الملف أكبر من ${MAX_FILE_MB}MB.`,
    unexpected: 'حدث خطأ غير متوقع أثناء الضغط.',
    success: 'تم الضغط بنجاح، بدأ تنزيل الملف.',
    hint: `PDF فقط — حتى ${MAX_FILE_MB}MB`,
    levelLabel: 'مستوى الضغط',
    profiles: [
      { id: 'print', label: 'جودة عالية (ضغط أقل)' },
      { id: 'web', label: 'متوازن (موصى به)' },
      { id: 'archive', label: 'أصغر حجم (جودة أقل)' }
    ],
    loading: 'جارٍ الضغط...',
    button: 'ضغط الملف وتنزيل'
  },
  en: {
    title: 'Compress PDF',
    lead: 'Shrink a PDF file while keeping reasonable quality, based on the level you choose.',
    badType: 'Unsupported format. Only PDF files are allowed.',
    tooBig: `File is larger than ${MAX_FILE_MB}MB.`,
    unexpected: 'An unexpected error occurred while compressing.',
    success: 'Compressed successfully — your download has started.',
    hint: `PDF only — up to ${MAX_FILE_MB}MB`,
    levelLabel: 'Compression level',
    profiles: [
      { id: 'print', label: 'High quality (less compression)' },
      { id: 'web', label: 'Balanced (recommended)' },
      { id: 'archive', label: 'Smallest size (lower quality)' }
    ],
    loading: 'Compressing...',
    button: 'Compress file and download'
  }
}

const seo = {
  about: {
    heading: 'ضغط ملفات PDF أونلاين مجاناً',
    paragraphs: [
      'أداة ضغط PDF تقلل حجم ملفك مع الحفاظ على جودة معقولة، وذلك باختيار المستوى المناسب: جودة عالية للطباعة، متوازن للاستخدام العام، أو أصغر حجم ممكن للمشاركة السريعة.',
      'مفيدة عندما يرفض بريد إلكتروني أو موقع إرفاق ملف PDF كبير الحجم، أو عندما تريد توفير مساحة تخزين.'
    ]
  },
  steps: {
    heading: 'كيف تضغط ملف PDF؟',
    items: [
      'ارفع ملف PDF الذي تريد تقليل حجمه.',
      'اختر مستوى الضغط المناسب لاحتياجك.',
      'اضغط ضغط الملف وتنزيل للحصول على النسخة المصغّرة.'
    ]
  },
  faq: [
    { q: 'كم يمكن أن يقل حجم الملف؟', a: 'يعتمد ذلك على محتوى الملف — الملفات التي تحتوي على صور عالية الدقة تستفيد من الضغط أكثر من الملفات النصية البحتة.' },
    { q: 'هل الضغط يؤثر على وضوح النص؟', a: 'النص يبقى واضحاً في كل المستويات؛ الضغط يؤثر بشكل أساسي على جودة الصور المضمّنة في الملف.' }
  ]
}
export default function CompressPdf() {
  const t = useT(TXT)
  const [file, setFile] = useState(null)
  const [profile, setProfile] = useState('web')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  const handleFiles = (files) => {
    const picked = files[0]
    setError('')
    setDone(false)
    if (picked.type !== 'application/pdf') {
      setError(t.badType)
      return
    }
    if (picked.size > MAX_FILE_MB * 1024 * 1024) {
      setError(t.tooBig)
      return
    }
    setFile(picked)
  }

  const handleCompress = async () => {
    if (!file) return
    setLoading(true)
    setError('')
    setDone(false)
    try {
      const blob = await compressPdf(file, profile)
      const outName = file.name.replace(/\.pdf$/i, '') + '-compressed.pdf'
      downloadBlob(blob, outName)
      setDone(true)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t.unexpected)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="tool-page">
      <h1>{t.title}</h1>
      <p className="lead">{t.lead}</p>

      {error && <div className="alert alert-error">{error}</div>}
      {done && <div className="alert alert-success">{t.success}</div>}

      <GoogleSignInGate>
        <div className="card">
          <FileDrop accept="application/pdf" onFiles={handleFiles} hint={t.hint} />
          {file && (
            <div className="file-list">
              <div className="file-row">
                <span>{file.name}</span>
                <button type="button" onClick={() => setFile(null)}>✕</button>
              </div>
            </div>
          )}
        </div>

        <div className="card">
          <div className="field">
            <label>{t.levelLabel}</label>
            <div className="radio-group">
              {t.profiles.map((p) => (
                <label key={p.id}>
                  <input type="radio" checked={profile === p.id} onChange={() => setProfile(p.id)} /> {p.label}
                </label>
              ))}
            </div>
          </div>
        </div>

        <button className="btn" disabled={!file || loading} onClick={handleCompress}>
          {loading && <span className="spinner" />}
          {loading ? t.loading : t.button}
        </button>
      </GoogleSignInGate>

      <SeoContent {...seo} />
    </div>
  )
}
