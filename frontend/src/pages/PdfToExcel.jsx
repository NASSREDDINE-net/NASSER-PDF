import OfficeToPdf from '../components/OfficeToPdf.jsx'
import { convertPdfTo } from '../lib/api.js'

const seo = {
  about: {
    heading: 'تحويل PDF إلى Excel (XLSX) أونلاين مجاناً',
    paragraphs: [
      'تستخرج هذه الأداة الجداول والبيانات الرقمية من ملف PDF وتحوّلها إلى جدول بيانات Excel (XLSX) قابل للتعديل والحساب، بدل إعادة إدخال البيانات يدوياً.',
      'مفيدة بشكل خاص للفواتير، الكشوفات البنكية، والتقارير المالية التي تحتوي على جداول تحتاج معالجة إضافية في Excel.'
    ]
  },
  steps: {
    heading: 'كيف تحوّل PDF إلى Excel؟',
    items: [
      'ارفع ملف PDF الذي يحتوي على الجدول أو البيانات.',
      'انتظر معالجة الملف واستخراج البيانات.',
      'حمّل ملف Excel (XLSX) وتابع العمل عليه مباشرة.'
    ]
  },
  faq: [
    { q: 'هل يستخرج كل الجداول من الملف؟', a: 'الأداة تحاول التعرف على البيانات الجدولية تلقائياً، ودقة الاستخراج تعتمد على مدى وضوح تنسيق الجدول الأصلي في ملف PDF.' },
    { q: 'ماذا لو كان ملفي عبارة عن صور ممسوحة ضوئياً؟', a: 'استخدم أداة OCR أولاً لتحويل الصور إلى نص قابل للقراءة، ثم جرّب التحويل إلى Excel.' }
  ]
}

export default function PdfToExcel() {
  return (
    <OfficeToPdf
      title={{ ar: 'تحويل PDF إلى Excel', en: 'PDF to Excel' }}
      lead={{
        ar: 'ارفع ملف PDF وسيتم تحويله إلى جدول بيانات Excel (XLSX).',
        en: 'Upload a PDF file and it will be converted to an Excel (XLSX) spreadsheet.'
      }}
      accept=".pdf"
      extensions={['pdf']}
      hint={{ ar: 'PDF فقط — حتى 100MB', en: 'PDF only — up to 100MB' }}
      convertFn={(file) => convertPdfTo(file, 'xlsx')}
      outputExtension="xlsx"
      buttonLabel={{ ar: 'تحويل إلى Excel وتنزيل', en: 'Convert to Excel and download' }}
      loadingLabel={{ ar: 'جارٍ التحويل...', en: 'Converting...' }}
      seo={seo}
    />
  )
}
