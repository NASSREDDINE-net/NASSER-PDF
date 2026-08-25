import OfficeToPdf from '../components/OfficeToPdf.jsx'
import { convertPdfTo } from '../lib/api.js'

const seo = {
  about: {
    heading: 'تحويل PDF إلى Word (DOCX) أونلاين مجاناً',
    paragraphs: [
      'أداة تحويل PDF إلى Word تحوّل أي ملف PDF إلى مستند Word (DOCX) قابل للتعديل الكامل، مع محاولة الحفاظ على التنسيق الأصلي قدر الإمكان (الفقرات، الجداول، والصور).',
      'مثالية عندما تحتاج تعديل محتوى ملف PDF — مثل تحديث سيرة ذاتية، تعديل عقد، أو إعادة صياغة تقرير — بدل إعادة كتابته من الصفر.'
    ]
  },
  steps: {
    heading: 'كيف تحوّل PDF إلى Word؟',
    items: [
      'ارفع ملف PDF الذي تريد تحويله.',
      'انتظر إتمام المعالجة (قد تأخذ وقتاً أطول قليلاً للملفات الكبيرة أو المعقدة).',
      'حمّل ملف Word (DOCX) الناتج وعدّله بحرية في Microsoft Word أو أي برنامج مماثل.'
    ]
  },
  faq: [
    { q: 'هل يعمل التحويل مع ملفات PDF الممسوحة ضوئياً (صور)؟', a: 'هذه الأداة مخصصة لملفات PDF التي تحتوي على نص فعلي. لملفات ممسوحة ضوئياً، ننصح باستخدام أداة OCR أولاً لاستخراج النص.' },
    { q: 'هل يبقى التنسيق كما هو تماماً؟', a: 'نحاول الحفاظ على التنسيق قدر الإمكان، لكن ملفات PDF المعقدة (تصاميم متعددة الأعمدة مثلاً) قد تحتاج تعديلاً يدوياً بسيطاً بعد التحويل.' }
  ]
}

export default function PdfToWord() {
  return (
    <OfficeToPdf
      title="تحويل PDF إلى Word"
      lead="ارفع ملف PDF وسيتم تحويله إلى مستند Word (DOCX) قابل للتعديل."
      accept=".pdf"
      extensions={['pdf']}
      hint="PDF فقط — حتى 100MB"
      convertFn={(file) => convertPdfTo(file, 'docx')}
      outputExtension="docx"
      buttonLabel="تحويل إلى Word وتنزيل"
      loadingLabel="جارٍ التحويل..."
      seo={seo}
    />
  )
}
