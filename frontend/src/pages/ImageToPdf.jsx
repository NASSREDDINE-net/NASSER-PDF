import { useState } from 'react'
import FileDrop from '../components/FileDrop.jsx'
import SeoContent from '../components/SeoContent.jsx'
import { useT } from '../lib/i18n.jsx'
import { imagesToPdf, downloadBlob } from '../lib/imagePdf.js'

const MAX_FILE_MB = 50
const MAX_FILES = 100
const ACCEPTED = ['image/png', 'image/jpeg']

const seo = {
  about: {
    heading: 'تحويل الصور إلى PDF أونلاين مجاناً',
    paragraphs: [
      'اجمع عدة صور بصيغة PNG أو JPG في ملف PDF واحد، مع تحكم كامل في ترتيب الصور، حجم الصفحة، الاتجاه، والهوامش.',
      'مفيدة لتحويل صور المستندات الممسوحة ضوئياً بالهاتف، الفواتير المصورة، أو مجموعة صور تريد إرسالها كملف واحد منظم بدل صور متفرقة.'
    ]
  },
  steps: {
    heading: 'كيف تحوّل الصور إلى PDF؟',
    items: [
      'ارفع صورة واحدة أو أكثر بصيغة PNG أو JPG.',
      'رتّب الصور بالسحب للأعلى أو الأسفل، واختر حجم الصفحة والاتجاه والجودة المناسبة.',
      'اضغط تحويل إلى PDF وسيبدأ تنزيل الملف تلقائياً.'
    ]
  },
  faq: [
    { q: 'كم صورة يمكنني تحويلها دفعة واحدة؟', a: 'يمكنك رفع حتى 100 صورة في نفس العملية، بحد أقصى 50 ميجابايت لكل صورة.' },
    { q: 'هل يمكنني التحكم في جودة الصور داخل الملف؟', a: 'نعم، توجد أداة تحكم في نسبة الضغط/الجودة قبل إنشاء ملف PDF النهائي.' }
  ]
}

const TXT = {
  ar: {
    title: 'تحويل الصور إلى PDF',
    lead: 'اجمع عدة صور PNG أو JPG في ملف PDF واحد، مع إمكانية ترتيبها والتحكم في التنسيق.',
    badType: 'صيغة غير مدعومة. يُسمح فقط بـ PNG وJPG/JPEG.',
    tooBig: (name) => `حجم الملف "${name}" أكبر من ${MAX_FILE_MB}MB.`,
    hint: `PNG أو JPG — حتى ${MAX_FILE_MB}MB لكل صورة، وحتى ${MAX_FILES} صورة`,
    up: 'تحريك لأعلى',
    down: 'تحريك لأسفل',
    delete: 'حذف',
    pageSizeLabel: 'حجم الصفحة',
    fitToImage: 'حسب حجم الصورة',
    orientationLabel: 'الاتجاه',
    portrait: 'عمودي',
    landscape: 'أفقي',
    margin: (v) => `الهوامش (مم): ${v}`,
    quality: (v) => `جودة الصورة: ${v}%`,
    createFailed: 'حدث خطأ أثناء إنشاء ملف PDF. حاول مجدداً.',
    loading: 'جارٍ الإنشاء...',
    button: (n) => `تحويل ${n || ''} إلى PDF وتنزيل`
  },
  en: {
    title: 'Convert Images to PDF',
    lead: 'Combine several PNG or JPG images into one PDF, with reordering and formatting controls.',
    badType: 'Unsupported format. Only PNG and JPG/JPEG are allowed.',
    tooBig: (name) => `File "${name}" is larger than ${MAX_FILE_MB}MB.`,
    hint: `PNG or JPG — up to ${MAX_FILE_MB}MB per image, up to ${MAX_FILES} images`,
    up: 'Move up',
    down: 'Move down',
    delete: 'Delete',
    pageSizeLabel: 'Page size',
    fitToImage: 'Fit to image size',
    orientationLabel: 'Orientation',
    portrait: 'Portrait',
    landscape: 'Landscape',
    margin: (v) => `Margins (mm): ${v}`,
    quality: (v) => `Image quality: ${v}%`,
    createFailed: 'An error occurred while creating the PDF. Please try again.',
    loading: 'Creating...',
    button: (n) => `Convert ${n || ''} to PDF and download`
  }
}

export default function ImageToPdf() {
  const t = useT(TXT)
  const [images, setImages] = useState([]) // { id, file, previewUrl }
  const [pageSize, setPageSize] = useState('a4')
  const [orientation, setOrientation] = useState('portrait')
  const [margin, setMargin] = useState(10)
  const [quality, setQuality] = useState(0.85)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const addFiles = (files) => {
    setError('')
    const valid = []
    for (const file of files) {
      if (!ACCEPTED.includes(file.type)) {
        setError(t.badType)
        continue
      }
      if (file.size > MAX_FILE_MB * 1024 * 1024) {
        setError(t.tooBig(file.name))
        continue
      }
      valid.push(file)
    }
    setImages((prev) => {
      const next = [
        ...prev,
        ...valid.map((file) => ({
          id: `${file.name}-${file.lastModified}-${Math.random()}`,
          file,
          previewUrl: URL.createObjectURL(file)
        }))
      ]
      return next.slice(0, MAX_FILES)
    })
  }

  const removeImage = (id) => {
    setImages((prev) => prev.filter((img) => img.id !== id))
  }

  const move = (index, direction) => {
    setImages((prev) => {
      const next = [...prev]
      const target = index + direction
      if (target < 0 || target >= next.length) return prev
      ;[next[index], next[target]] = [next[target], next[index]]
      return next
    })
  }

  const handleConvert = async () => {
    if (images.length === 0) return
    setLoading(true)
    setError('')
    try {
      const blob = await imagesToPdf(
        images.map((img) => img.file),
        { pageSize, orientation, marginMm: Number(margin), quality: Number(quality) }
      )
      downloadBlob(blob, 'nasser-pdf-images.pdf')
    } catch (err) {
      console.error(err)
      setError(t.createFailed)
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
          accept="image/png,image/jpeg"
          multiple
          onFiles={addFiles}
          hint={t.hint}
        />

        {images.length > 0 && (
          <div className="file-list">
            {images.map((img, index) => (
              <div className="file-row" key={img.id}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <img src={img.previewUrl} alt="" style={{ width: 36, height: 36, objectFit: 'cover', borderRadius: 6 }} />
                  {img.file.name}
                </span>
                <span style={{ display: 'flex', gap: 4 }}>
                  <button type="button" onClick={() => move(index, -1)} title={t.up} disabled={index === 0}>↑</button>
                  <button type="button" onClick={() => move(index, 1)} title={t.down} disabled={index === images.length - 1}>↓</button>
                  <button type="button" onClick={() => removeImage(img.id)} title={t.delete}>✕</button>
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card">
        <div className="field">
          <label>{t.pageSizeLabel}</label>
          <div className="radio-group">
            <label>
              <input type="radio" checked={pageSize === 'a4'} onChange={() => setPageSize('a4')} /> A4
            </label>
            <label>
              <input type="radio" checked={pageSize === 'fit'} onChange={() => setPageSize('fit')} /> {t.fitToImage}
            </label>
          </div>
        </div>

        {pageSize === 'a4' && (
          <div className="field">
            <label>{t.orientationLabel}</label>
            <div className="radio-group">
              <label>
                <input type="radio" checked={orientation === 'portrait'} onChange={() => setOrientation('portrait')} /> {t.portrait}
              </label>
              <label>
                <input type="radio" checked={orientation === 'landscape'} onChange={() => setOrientation('landscape')} /> {t.landscape}
              </label>
            </div>
          </div>
        )}

        <div className="field">
          <label>{t.margin(margin)}</label>
          <input type="range" min="0" max="30" step="1" value={margin} onChange={(e) => setMargin(e.target.value)} style={{ width: '100%' }} />
        </div>

        <div className="field">
          <label>{t.quality(Math.round(quality * 100))}</label>
          <input type="range" min="0.4" max="1" step="0.05" value={quality} onChange={(e) => setQuality(e.target.value)} style={{ width: '100%' }} />
        </div>
      </div>

      <button className="btn" disabled={images.length === 0 || loading} onClick={handleConvert}>
        {loading && <span className="spinner" />}
        {loading ? t.loading : t.button(images.length)}
      </button>

      <SeoContent {...seo} />
    </div>
  )
}
