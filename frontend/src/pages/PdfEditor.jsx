import ToolCard from '../components/ToolCard.jsx'
import { useLanguage, useT } from '../lib/i18n.jsx'

const CONTENT = {
  ar: {
    title: 'PDF Editor',
    subtitle: 'أدوات تحرير PDF شاملة — أغلبها يعمل بالكامل داخل متصفحك، وبعضها (زي الضغط) يمر عبر خدمة تحويل خارجية.',
    tools: [
      { to: '/merge-pdf', icon: '🔗', title: 'دمج PDF', description: 'ادمج عدة ملفات PDF في ملف واحد بالترتيب اللي تختاره.' },
      { to: '/split-pdf', icon: '✂️', title: 'تقسيم PDF', description: 'استخرج نطاق صفحات معين أو قسّم كل صفحة في ملف مستقل.' },
      { to: '/organize-pdf', icon: '📑', title: 'ترتيب الصفحات', description: 'دوّر، احذف، أو أعد ترتيب صفحات ملف PDF.' },
      { to: '/watermark-pdf', icon: '💧', title: 'علامة مائية', description: 'أضف نص علامة مائية فوق كل صفحات الملف.' },
      { to: '/edit-pdf', icon: '✏️', title: 'تحرير PDF', description: 'أضف نص، صور، أشكال، رسم حر، تظليل، إخفاء، أو توقيع مباشرة فوق الصفحات.' },
      { to: '/pdf-to-image', icon: '🖼️', title: 'PDF → صورة', description: 'حوّل صفحات PDF إلى صور PNG أو JPG بجودة تختارها.' },
      { to: '/extract-text', icon: '📄', title: 'استخراج نص', description: 'استخرج كل النص من ملف PDF وانسخه أو نزّله.' },
      { to: '/fill-pdf-form', icon: '🖊️', title: 'تعبئة نماذج', description: 'عبّئ الحقول القابلة للتعبئة في ملف PDF ونزّل النسخة المكتملة.' },
      { to: '/compress-pdf', icon: '🗜️', title: 'ضغط PDF', description: 'قلّل حجم ملف PDF مع الحفاظ على جودة معقولة.' },
      { to: '/protect-pdf', icon: '🔒', title: 'حماية PDF', description: 'أضف كلمة مرور لملف PDF أو أزل كلمة مرور موجودة تعرفها.' },
      { to: '/compare-pdf', icon: '🔍', title: 'مقارنة PDF', description: 'قارن بين ملفي PDF وشوف الفروقات كلمة بكلمة.' },
      { to: '/ocr', icon: '🔤', title: 'استخراج نص من صورة (OCR)', description: 'حوّل نص داخل صورة أو PDF ممسوح ضوئياً إلى نص قابل للنسخ.' }
    ]
  },
  en: {
    title: 'PDF Editor',
    subtitle: 'A full suite of PDF editing tools — most run entirely in your browser, a few (like Compress) go through an external conversion service.',
    tools: [
      { to: '/merge-pdf', icon: '🔗', title: 'Merge PDF', description: 'Combine several PDF files into one, in the order you choose.' },
      { to: '/split-pdf', icon: '✂️', title: 'Split PDF', description: 'Extract a page range or split every page into its own file.' },
      { to: '/organize-pdf', icon: '📑', title: 'Organize Pages', description: 'Rotate, delete, or reorder pages in a PDF file.' },
      { to: '/watermark-pdf', icon: '💧', title: 'Watermark', description: 'Add a text watermark across every page of the file.' },
      { to: '/edit-pdf', icon: '✏️', title: 'Edit PDF', description: 'Add text, images, shapes, freehand drawing, highlights, whiteout, or a signature directly on the pages.' },
      { to: '/pdf-to-image', icon: '🖼️', title: 'PDF → Image', description: 'Convert PDF pages to PNG or JPG images at the quality you choose.' },
      { to: '/extract-text', icon: '📄', title: 'Extract Text', description: 'Pull all the text out of a PDF file to copy or download.' },
      { to: '/fill-pdf-form', icon: '🖊️', title: 'Fill Forms', description: 'Fill in the fillable fields of a PDF and download the completed copy.' },
      { to: '/compress-pdf', icon: '🗜️', title: 'Compress PDF', description: 'Shrink a PDF file while keeping reasonable quality.' },
      { to: '/protect-pdf', icon: '🔒', title: 'Protect PDF', description: 'Add a password to a PDF, or remove an existing one you know.' },
      { to: '/compare-pdf', icon: '🔍', title: 'Compare PDF', description: 'Compare two PDF files and see the differences word by word.' },
      { to: '/ocr', icon: '🔤', title: 'OCR (Image to Text)', description: 'Turn text inside an image or scanned PDF into copyable text.' }
    ]
  }
}

export default function PdfEditor() {
  const t = useT(CONTENT)
  const { withLang } = useLanguage()
  return (
    <div>
      <div className="hero">
        <h1>{t.title}</h1>
        <p>{t.subtitle}</p>
      </div>
      <div className="tool-grid">
        {t.tools.map((tool) => (
          <ToolCard key={tool.to} {...tool} to={withLang(tool.to)} />
        ))}
      </div>
    </div>
  )
}
