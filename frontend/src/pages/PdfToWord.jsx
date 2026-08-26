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
      title={{ ar: 'تحويل PDF إلى Word', en: 'PDF to Word' }}
      lead={{
        ar: 'ارفع ملف PDF وسيتم تحويله إلى مستند Word (DOCX) قابل للتعديل.',
        en: 'Upload a PDF file and it will be converted to an editable Word (DOCX) document.'
      }}
      accept=".pdf"
      extensions={['pdf']}
      hint={{ ar: 'PDF فقط — حتى 100MB', en: 'PDF only — up to 100MB' }}
      convertFn={(file) => convertPdfTo(file, 'docx')}
      outputExtension="docx"
      buttonLabel={{ ar: 'تحويل إلى Word وتنزيل', en: 'Convert to Word and download' }}
      loadingLabel={{ ar: 'جارٍ التحويل...', en: 'Converting...' }}
      seo={seo}
    />
  )
}
