import { useState } from 'react'
import FileDrop from '../components/FileDrop.jsx'
import { loadFormFields, fillForm } from '../lib/pdfForms.js'
import { downloadBlob } from '../lib/imagePdf.js'

const MAX_FILE_MB = 75

export default function FillPdfForm() {
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
      setError('صيغة غير مدعومة. يُسمح فقط بملفات PDF.')
      return
    }
    if (picked.size > MAX_FILE_MB * 1024 * 1024) {
      setError(`حجم الملف أكبر من ${MAX_FILE_MB}MB.`)
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
      setError('تعذّر قراءة الملف. تأكد أنه PDF صالح وغير محمي بكلمة مرور.')
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
      setError('تعذّر تعبئة النموذج. حاول مجدداً.')
    } finally {
      setLoading(false)
    }
  }

  const fillableFields = (fields || []).filter((f) => f.type !== 'unsupported')

  return (
    <div className="tool-page">
      <h1>تعبئة نماذج PDF</h1>
      <p className="lead">ارفع ملف PDF فيه حقول قابلة للتعبئة، عبّئها، ونزّل النسخة المكتملة.</p>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="card">
        <FileDrop accept="application/pdf" onFiles={handleFiles} hint={`PDF فقط — حتى ${MAX_FILE_MB}MB`} />
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
        <div className="alert alert-error">لا توجد حقول قابلة للتعبئة في هذا الملف.</div>
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
                  مُفعّل
                </label>
              )}
              {(f.type === 'dropdown' || f.type === 'radio') && (
                <select value={values[f.name] || ''} onChange={(e) => setFieldValue(f.name, e.target.value)}>
                  <option value="">— اختر —</option>
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
          {loading ? 'جارٍ التعبئة...' : 'تعبئة وتنزيل PDF'}
        </button>
      )}
    </div>
  )
}
