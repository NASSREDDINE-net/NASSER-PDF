import { useState } from 'react'
import FileDrop from '../components/FileDrop.jsx'
import GoogleSignInGate from '../components/GoogleSignInGate.jsx'
import SeoContent from '../components/SeoContent.jsx'
import { useT } from '../lib/i18n.jsx'
import { protectPdf, ApiError } from '../lib/api.js'
import { downloadBlob } from '../lib/imagePdf.js'

const MAX_FILE_MB = 100

const seo = {
  about: {
    heading: 'حماية وفك حماية ملفات PDF بكلمة مرور أونلاين مجاناً',
    paragraphs: [
      'أداة حماية PDF تتيح لك إضافة كلمة مرور لملف PDF بحيث لا يستطيع فتحه إلا من يعرف كلمة المرور، أو إزالة كلمة مرور موجودة مسبقاً إذا كنت تعرفها.',
      'مفيدة لحماية مستندات حساسة (عقود، كشوفات راتب، ملفات شخصية) قبل إرسالها بالبريد الإلكتروني، أو لفك حماية ملف قديم تعرف كلمة مروره ولم تعد بحاجة لها.'
    ]
  },
  steps: {
    heading: 'كيف تحمي أو تفك حماية ملف PDF؟',
    items: [
      'ارفع ملف PDF.',
      'اختر "إضافة حماية" لتعيين كلمة مرور جديدة، أو "إزالة حماية" إذا كان الملف محمياً وتعرف كلمة مروره الحالية.',
      'اكتب كلمة المرور، ثم اضغط تنفيذ وتنزيل.'
    ]
  },
  faq: [
    { q: 'ماذا لو نسيت كلمة مرور ملف PDF؟', a: 'هذه الأداة تتطلب معرفة كلمة المرور الحالية لفك الحماية؛ لا يمكنها كسر أو تجاوز كلمة مرور مجهولة.' },
    { q: 'هل تُحفظ كلمة المرور عندي؟', a: 'لا، تُستخدم كلمة المرور فقط أثناء المعالجة ولا يتم تخزينها في أي مكان.' }
  ]
}

const TXT = {
  ar: {
    title: 'حماية PDF بكلمة مرور',
    lead: 'أضف كلمة مرور لملف PDF لمنع فتحه بدونها، أو أزل كلمة مرور موجودة إذا كنت تعرفها.',
    badType: 'صيغة غير مدعومة. يُسمح فقط بملفات PDF.',
    tooBig: `حجم الملف أكبر من ${MAX_FILE_MB}MB.`,
    unexpected: 'حدث خطأ غير متوقع.',
    success: 'تمت العملية بنجاح، بدأ تنزيل الملف.',
    hint: `PDF فقط — حتى ${MAX_FILE_MB}MB`,
    actionLabel: 'العملية',
    addOption: 'إضافة حماية (تعيين كلمة مرور جديدة)',
    removeOption: 'إزالة حماية (أعرف كلمة المرور الحالية)',
    newPassword: 'كلمة المرور الجديدة',
    currentPassword: 'كلمة المرور الحالية',
    loading: 'جارٍ المعالجة...',
    addButton: 'إضافة الحماية وتنزيل',
    removeButton: 'إزالة الحماية وتنزيل'
  },
  en: {
    title: 'Protect PDF with a password',
    lead: 'Add a password to a PDF so it can’t be opened without it, or remove an existing password if you know it.',
    badType: 'Unsupported format. Only PDF files are allowed.',
    tooBig: `File is larger than ${MAX_FILE_MB}MB.`,
    unexpected: 'An unexpected error occurred.',
    success: 'Done — your file download has started.',
    hint: `PDF only — up to ${MAX_FILE_MB}MB`,
    actionLabel: 'Action',
    addOption: 'Add protection (set a new password)',
    removeOption: 'Remove protection (I know the current password)',
    newPassword: 'New password',
    currentPassword: 'Current password',
    loading: 'Processing...',
    addButton: 'Add protection and download',
    removeButton: 'Remove protection and download'
  }
}

export default function ProtectPdf() {
  const t = useT(TXT)
  const [file, setFile] = useState(null)
  const [action, setAction] = useState('add')
  const [password, setPassword] = useState('')
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

  const handleRun = async () => {
    if (!file || !password.trim()) return
    setLoading(true)
    setError('')
    setDone(false)
    try {
      const blob = await protectPdf(file, action, password.trim())
      const outName = file.name.replace(/\.pdf$/i, '') + (action === 'add' ? '-protected.pdf' : '-unlocked.pdf')
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
            <label>{t.actionLabel}</label>
            <div className="radio-group">
              <label>
                <input type="radio" checked={action === 'add'} onChange={() => setAction('add')} /> {t.addOption}
              </label>
              <label>
                <input type="radio" checked={action === 'remove'} onChange={() => setAction('remove')} /> {t.removeOption}
              </label>
            </div>
          </div>

          <div className="field">
            <label>{action === 'add' ? t.newPassword : t.currentPassword}</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
        </div>

        <button className="btn" disabled={!file || !password.trim() || loading} onClick={handleRun}>
          {loading && <span className="spinner" />}
          {loading ? t.loading : action === 'add' ? t.addButton : t.removeButton}
        </button>
      </GoogleSignInGate>

      <SeoContent {...seo} />
    </div>
  )
}
