import { useState } from 'react'
import FileDrop from '../components/FileDrop.jsx'
import SeoContent from '../components/SeoContent.jsx'
import { useT } from '../lib/i18n.jsx'
import { loadFormFields, fillForm } from '../lib/pdfForms.js'
import { downloadBlob } from '../lib/imagePdf.js'

const MAX_FILE_MB = 75

const seo = {
  about: {
    heading: 'تعبئة نماذج PDF أونلاين مجاناً',
    paragraphs: [
      'أداة تعبئة نماذج PDF تكتشف تلقائياً الحقول القابلة للتعبئة (نص، مربعات اختيار، قوائم منسدلة) داخل ملف PDF وتتيح لك ملأها مباشرة من المتصفح دون طباعة الملف.',
      'مناسبة لتعبئة استمارات رسمية، طلبات توظيف، أو أي نموذج PDF تفاعلي تستلمه عبر البريد الإلكتروني.'
    ]
  },
  steps: {
    heading: 'كيف تعبّئ نموذج PDF؟',
    items: [
      'ارفع ملف PDF الذي يحتوي على النموذج.',
      'ستظهر كل الحقول القابلة للتعبئة تلقائياً — املأها واحداً تلو الآخر.',
      'اضغط تعبئة وتنزيل للحصول على النسخة المكتملة من الملف.'
    ]
  },
  faq: [
    { q: 'ماذا لو ظهرت رسالة "لا توجد حقول قابلة للتعبئة"؟', a: 'هذا يعني أن ملف PDF لا يحتوي على نموذج تفاعلي حقيقي، بل هو نص أو صورة ثابتة. يمكنك استخدام أداة "تحرير PDF" لإضافة النص يدوياً في هذه الحالة.' },
    { q: 'هل يدعم كل أنواع الحقول؟', a: 'نعم، يدعم حقول النص، مربعات الاختيار، الأزرار الدائرية (radio)، والقوائم المنسدلة.' }
  ]
}

const TXT = {
  ar: {
    title: 'تعبئة نماذج PDF',
    lead: 'ارفع ملف PDF فيه حقول قابلة للتعبئة، عبّئها، ونزّل النسخة المكتملة.',
    badType: 'صيغة غير مدعومة. يُسمح فقط بملفات PDF.',
    tooBig: `حجم الملف أكبر من ${MAX_FILE_MB}MB.`,
    readFailed: 'تعذّر قراءة الملف. تأكد أنه PDF صالح وغير محمي بكلمة مرور.',
    fillFailed: 'تعذّر تعبئة النموذج. حاول مجدداً.',
    hint: `PDF فقط — حتى ${MAX_FILE_MB}MB`,
    noFields: 'لا توجد حقول قابلة للتعبئة في هذا الملف.',
    enabled: 'مُفعّل',
    choose: '— اختر —',
    loading: 'جارٍ التعبئة...',
    button: 'تعبئة وتنزيل PDF'
  },
  en: {
    title: 'Fill PDF Forms',
    lead: 'Upload a PDF with fillable fields, fill them in, and download the completed copy.',
    badType: 'Unsupported format. Only PDF files are allowed.',
    tooBig: `File is larger than ${MAX_FILE_MB}MB.`,
    readFailed: 'Could not read the file. Make sure it’s a valid PDF and not password-protected.',
    fillFailed: 'Could not fill the form. Please try again.',
    hint: `PDF only — up to ${MAX_FILE_MB}MB`,
    noFields: 'This file has no fillable fields.',
    enabled: 'Enabled',
    choose: '— Choose —',
    loading: 'Filling...',
    button: 'Fill and download PDF'
  }
}

export default function FillPdfForm() {
  const t = useT(TXT)
  const [file, setFile] = useState(null)
  const [fields, setFields] = useState(null)
  const [values, setValues] = useState({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleFiles = async (files) => {
    const picked = files[0]
    setError('')
    setFields(null)
    setValues({})
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
      const loadedFields = await loadFormFields(picked)
      setFields(loadedFields)
      const initial = {}
      loadedFields.forEach((f) => {
        initial[f.name] = f.value
      })
      setValues(initial)
    } catch (err) {
      console.error(err)
      setError(t.readFailed)
      setFile(null)
    }
  }

  const setFieldValue = (name, value) => setValues((prev) => ({ ...prev, [name]: value }))

  const handleFill = async () => {
    if (!file) return
    setLoading(true)
    setError('')
    try {
      const blob = await fillForm(file, values)
      downloadBlob(blob, 'nasser-pdf-filled.pdf')
    } catch (err) {
      console.error(err)
      setError(t.fillFailed)
    } finally {
      setLoading(false)
    }
  }

  const fillableFields = (fields || []).filter((f) => f.type !== 'unsupported')

  return (
    <div className="tool-page">
      <h1>{t.title}</h1>
      <p className="lead">{t.lead}</p>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="card">
        <FileDrop accept="application/pdf" onFiles={handleFiles} hint={t.hint} />
        {file && (
          <div className="file-list">
            <div className="file-row">
              <span>{file.name}</span>
              <button type="button" onClick={() => { setFile(null); setFields(null) }}>✕</button>
            </div>
          </div>
        )}
      </div>

      {fields && fillableFields.length === 0 && (
        <div className="alert alert-error">{t.noFields}</div>
      )}

      {fillableFields.length > 0 && (
        <div className="card">
          {fillableFields.map((f) => (
            <div className="field" key={f.name}>
              <label>{f.name}</label>
              {f.type === 'text' && (
                <input type="text" value={values[f.name] || ''} onChange={(e) => setFieldValue(f.name, e.target.value)} />
              )}
              {f.type === 'checkbox' && (
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 400 }}>
                  <input
                    type="checkbox"
                    checked={!!values[f.name]}
                    onChange={(e) => setFieldValue(f.name, e.target.checked)}
                  />
                  {t.enabled}
                </label>
              )}
              {(f.type === 'dropdown' || f.type === 'radio') && (
                <select value={values[f.name] || ''} onChange={(e) => setFieldValue(f.name, e.target.value)}>
                  <option value="">{t.choose}</option>
                  {(f.options || []).map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              )}
              {f.type === 'optionlist' && (
                <select
                  multiple
                  value={values[f.name] || []}
                  onChange={(e) => setFieldValue(f.name, Array.from(e.target.selectedOptions, (o) => o.value))}
                >
                  {(f.options || []).map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              )}
            </div>
          ))}
        </div>
      )}

      {fillableFields.length > 0 && (
        <button className="btn" disabled={loading} onClick={handleFill}>
          {loading && <span className="spinner" />}
          {loading ? t.loading : t.button}
        </button>
      )}

      <SeoContent {...seo} />
    </div>
  )
}
