import { lazy, Suspense, useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/react'
import Layout from './components/Layout.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import { useLanguage } from './lib/i18n.jsx'
import Home from './pages/Home.jsx'

const WordToPdf = lazy(() => import('./pages/WordToPdf.jsx'))
const ExcelToPdf = lazy(() => import('./pages/ExcelToPdf.jsx'))
const ImageToPdf = lazy(() => import('./pages/ImageToPdf.jsx'))
const QrCode = lazy(() => import('./pages/QrCode.jsx'))
const PdfEditor = lazy(() => import('./pages/PdfEditor.jsx'))
const MergePdf = lazy(() => import('./pages/MergePdf.jsx'))
const SplitPdf = lazy(() => import('./pages/SplitPdf.jsx'))
const OrganizePdf = lazy(() => import('./pages/OrganizePdf.jsx'))
const WatermarkPdf = lazy(() => import('./pages/WatermarkPdf.jsx'))
const EditPdf = lazy(() => import('./pages/EditPdf.jsx'))
const PdfToImage = lazy(() => import('./pages/PdfToImage.jsx'))
const ExtractText = lazy(() => import('./pages/ExtractText.jsx'))
const FillPdfForm = lazy(() => import('./pages/FillPdfForm.jsx'))
const PdfToWord = lazy(() => import('./pages/PdfToWord.jsx'))
const PdfToExcel = lazy(() => import('./pages/PdfToExcel.jsx'))
const CompressPdf = lazy(() => import('./pages/CompressPdf.jsx'))
const ProtectPdf = lazy(() => import('./pages/ProtectPdf.jsx'))
const ComparePdf = lazy(() => import('./pages/ComparePdf.jsx'))
const OcrTool = lazy(() => import('./pages/OcrTool.jsx'))
const Privacy = lazy(() => import('./pages/Privacy.jsx'))
const Terms = lazy(() => import('./pages/Terms.jsx'))
const About = lazy(() => import('./pages/About.jsx'))
const NotFound = lazy(() => import('./pages/NotFound.jsx'))

// Base (Arabic) routes. The /en/ variant of every one of these is generated below.
const ROUTES = [
  { path: '/', Component: Home, meta: { ar: { title: 'NASSER PDF — تحويل الملفات إلى PDF مجاناً', description: 'حوّل ملفات Word وExcel والصور إلى PDF، وأنشئ رموز QR مجاناً وبدون تسجيل.' }, en: { title: 'NASSER PDF — Free File to PDF Converter', description: 'Convert Word, Excel, and images to PDF, and generate QR codes for free with no sign-up.' } } },
  { path: '/word-to-pdf', Component: WordToPdf, meta: { ar: { title: 'تحويل Word إلى PDF مجاناً — NASSER PDF', description: 'حوّل ملفات DOC وDOCX إلى PDF بتنسيق مطابق للأصل، مجاناً وبدون تسجيل.' }, en: { title: 'Word to PDF Converter — Free — NASSER PDF', description: 'Convert DOC and DOCX files to PDF with matching formatting, free and with no sign-up.' } } },
  { path: '/excel-to-pdf', Component: ExcelToPdf, meta: { ar: { title: 'تحويل Excel إلى PDF مجاناً — NASSER PDF', description: 'حوّل ملفات XLS وXLSX إلى PDF مع ضبط تلقائي لإعدادات الصفحة.' }, en: { title: 'Excel to PDF Converter — Free — NASSER PDF', description: 'Convert XLS and XLSX files to PDF with automatic page fitting.' } } },
  { path: '/image-to-pdf', Component: ImageToPdf, meta: { ar: { title: 'تحويل الصور إلى PDF مجاناً — NASSER PDF', description: 'اجمع صور PNG وJPG في ملف PDF واحد مع خيارات تنسيق كاملة.' }, en: { title: 'Image to PDF Converter — Free — NASSER PDF', description: 'Combine PNG and JPG images into one PDF with full formatting options.' } } },
  { path: '/qr-code', Component: QrCode, meta: { ar: { title: 'إنشاء رمز QR مجاناً — NASSER PDF', description: 'أنشئ رمز QR لرابط أو نص أو بريد أو رقم هاتف أو شبكة واي فاي.' }, en: { title: 'Free QR Code Generator — NASSER PDF', description: 'Generate a QR code for a link, text, email, phone number, or Wi-Fi network.' } } },
  { path: '/pdf-editor', Component: PdfEditor, meta: { ar: { title: 'أدوات تحرير PDF — NASSER PDF', description: 'دمج، تقسيم، ترتيب صفحات، حماية، وإضافة علامة مائية على ملفات PDF.' }, en: { title: 'PDF Editor Tools — NASSER PDF', description: 'Merge, split, organize pages, protect, and watermark PDF files.' } } },
  { path: '/merge-pdf', Component: MergePdf, meta: { ar: { title: 'دمج ملفات PDF مجاناً — NASSER PDF', description: 'ادمج عدة ملفات PDF في ملف واحد بالترتيب اللي تختاره.' }, en: { title: 'Merge PDF Files Free — NASSER PDF', description: 'Combine several PDF files into one, in the order you choose.' } } },
  { path: '/split-pdf', Component: SplitPdf, meta: { ar: { title: 'تقسيم ملفات PDF مجاناً — NASSER PDF', description: 'استخرج نطاق صفحات معين أو قسّم كل صفحة في ملف مستقل.' }, en: { title: 'Split PDF Files Free — NASSER PDF', description: 'Extract a page range or split every page into its own file.' } } },
  { path: '/organize-pdf', Component: OrganizePdf, meta: { ar: { title: 'ترتيب صفحات PDF مجاناً — NASSER PDF', description: 'دوّر، احذف، أو أعد ترتيب صفحات ملف PDF.' }, en: { title: 'Organize PDF Pages Free — NASSER PDF', description: 'Rotate, delete, or reorder the pages of a PDF file.' } } },
  { path: '/watermark-pdf', Component: WatermarkPdf, meta: { ar: { title: 'إضافة علامة مائية لـ PDF مجاناً — NASSER PDF', description: 'أضف نص علامة مائية فوق كل صفحات الملف.' }, en: { title: 'Add Watermark to PDF Free — NASSER PDF', description: 'Add a text watermark across every page of a PDF file.' } } },
  { path: '/edit-pdf', Component: EditPdf, meta: { ar: { title: 'تحرير PDF أونلاين مجاناً — NASSER PDF', description: 'أضف نص، صور، أشكال، رسم حر، تظليل، إخفاء، أو توقيع مباشرة فوق الصفحات.' }, en: { title: 'Edit PDF Online Free — NASSER PDF', description: 'Add text, images, shapes, drawing, highlights, whiteout, or a signature directly on the pages.' } } },
  { path: '/pdf-to-image', Component: PdfToImage, meta: { ar: { title: 'تحويل PDF إلى صور مجاناً — NASSER PDF', description: 'حوّل صفحات PDF إلى صور PNG أو JPG بجودة تختارها.' }, en: { title: 'Convert PDF to Images Free — NASSER PDF', description: 'Convert PDF pages to PNG or JPG images at the quality you choose.' } } },
  { path: '/extract-text', Component: ExtractText, meta: { ar: { title: 'استخراج نص من PDF مجاناً — NASSER PDF', description: 'استخرج كل النص من ملف PDF وانسخه أو نزّله.' }, en: { title: 'Extract Text from PDF Free — NASSER PDF', description: 'Pull all the text out of a PDF file to copy or download.' } } },
  { path: '/fill-pdf-form', Component: FillPdfForm, meta: { ar: { title: 'تعبئة نماذج PDF مجاناً — NASSER PDF', description: 'عبّئ الحقول القابلة للتعبئة في ملف PDF ونزّل النسخة المكتملة.' }, en: { title: 'Fill PDF Forms Free — NASSER PDF', description: 'Fill in the fillable fields of a PDF and download the completed copy.' } } },
  { path: '/pdf-to-word', Component: PdfToWord, meta: { ar: { title: 'تحويل PDF إلى Word مجاناً — NASSER PDF', description: 'حوّل ملف PDF إلى مستند Word (DOCX) قابل للتعديل.' }, en: { title: 'PDF to Word Converter — Free — NASSER PDF', description: 'Convert a PDF file into an editable Word (DOCX) document.' } } },
  { path: '/pdf-to-excel', Component: PdfToExcel, meta: { ar: { title: 'تحويل PDF إلى Excel مجاناً — NASSER PDF', description: 'حوّل ملف PDF إلى جدول بيانات Excel (XLSX).' }, en: { title: 'PDF to Excel Converter — Free — NASSER PDF', description: 'Convert a PDF file into an Excel (XLSX) spreadsheet.' } } },
  { path: '/compress-pdf', Component: CompressPdf, meta: { ar: { title: 'ضغط ملفات PDF مجاناً — NASSER PDF', description: 'قلّل حجم ملف PDF مع الحفاظ على جودة معقولة.' }, en: { title: 'Compress PDF Free — NASSER PDF', description: 'Shrink a PDF file while keeping reasonable quality.' } } },
  { path: '/protect-pdf', Component: ProtectPdf, meta: { ar: { title: 'حماية PDF بكلمة مرور مجاناً — NASSER PDF', description: 'أضف كلمة مرور لملف PDF أو أزل كلمة مرور موجودة تعرفها.' }, en: { title: 'Protect PDF with a Password Free — NASSER PDF', description: 'Add a password to a PDF, or remove an existing one you know.' } } },
  { path: '/compare-pdf', Component: ComparePdf, meta: { ar: { title: 'مقارنة ملفات PDF مجاناً — NASSER PDF', description: 'قارن بين ملفي PDF وشوف الفروقات كلمة بكلمة.' }, en: { title: 'Compare PDF Files Free — NASSER PDF', description: 'Compare two PDF files and see the differences word by word.' } } },
  { path: '/ocr', Component: OcrTool, meta: { ar: { title: 'استخراج نص من صورة (OCR) مجاناً — NASSER PDF', description: 'حوّل نص داخل صورة أو PDF ممسوح ضوئياً إلى نص قابل للنسخ.' }, en: { title: 'OCR — Image to Text Free — NASSER PDF', description: 'Turn text inside an image or scanned PDF into copyable text.' } } },
  { path: '/privacy', Component: Privacy, meta: { ar: { title: 'سياسة الخصوصية — NASSER PDF', description: 'كيف نعالج ملفاتك وبياناتك في NASSER PDF.' }, en: { title: 'Privacy Policy — NASSER PDF', description: 'How NASSER PDF handles your files and data.' } } },
  { path: '/terms', Component: Terms, meta: { ar: { title: 'شروط الاستخدام — NASSER PDF', description: 'شروط استخدام أدوات NASSER PDF.' }, en: { title: 'Terms of Use — NASSER PDF', description: 'Terms for using the NASSER PDF tools.' } } },
  { path: '/about', Component: About, meta: { ar: { title: 'حول NASSER PDF', description: 'تعرّف على NASSER PDF وأدواته المجانية لتحويل الملفات.' }, en: { title: 'About NASSER PDF', description: 'Learn about NASSER PDF and its free file conversion tools.' } } }
]

const SITE_URL = 'https://nasserpdf.devs.surf'

function toEnPath(path) {
  return path === '/' ? '/en' : `/en${path}`
}

function upsertMeta(name, content) {
  let tag = document.querySelector(`meta[name="${name}"]`)
  if (!tag) {
    tag = document.createElement('meta')
    tag.setAttribute('name', name)
    document.head.appendChild(tag)
  }
  tag.setAttribute('content', content)
}

function upsertLink(rel, hreflang, href) {
  const selector = hreflang ? `link[rel="${rel}"][hreflang="${hreflang}"]` : `link[rel="${rel}"]`
  let tag = document.querySelector(selector)
  if (!tag) {
    tag = document.createElement('link')
    tag.setAttribute('rel', rel)
    if (hreflang) tag.setAttribute('hreflang', hreflang)
    document.head.appendChild(tag)
  }
  tag.setAttribute('href', href)
}

function SeoHead() {
  const location = useLocation()
  const { lang, basePath } = useLanguage()

  useEffect(() => {
    const route = ROUTES.find((r) => r.path === basePath)
    const meta = route ? route.meta[lang] : null
    if (meta) {
      document.title = meta.title
      upsertMeta('description', meta.description)
    }

    const arUrl = `${SITE_URL}${basePath}`
    const enUrl = `${SITE_URL}${toEnPath(basePath)}`
    upsertLink('canonical', null, lang === 'ar' ? arUrl : enUrl)
    upsertLink('alternate', 'ar', arUrl)
    upsertLink('alternate', 'en', enUrl)
    upsertLink('alternate', 'x-default', arUrl)
  }, [location.pathname, lang, basePath])

  return null
}

function PageLoading() {
  return (
    <div style={{ textAlign: 'center', padding: '80px 20px' }}>
      <span className="spinner" style={{ borderTopColor: '#dc2626', borderColor: '#fee2e2' }} />
    </div>
  )
}

export default function App() {
  return (
    <ErrorBoundary>
      <SeoHead />
      <Layout>
        <Suspense fallback={<PageLoading />}>
          <Routes>
            {ROUTES.map(({ path, Component }) => (
              <Route key={path} path={path} element={<Component />} />
            ))}
            {ROUTES.map(({ path, Component }) => (
              <Route key={`en${path}`} path={toEnPath(path)} element={<Component />} />
            ))}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </Layout>
      <Analytics />
      <SpeedInsights />
    </ErrorBoundary>
  )
}
