import ToolCard from '../components/ToolCard.jsx'

const TOOLS = [
  {
    to: '/merge-pdf',
    icon: '🔗',
    title: 'دمج PDF',
    description: 'ادمج عدة ملفات PDF في ملف واحد بالترتيب اللي تختاره.'
  },
  {
    to: '/split-pdf',
    icon: '✂️',
    title: 'تقسيم PDF',
    description: 'استخرج نطاق صفحات معين أو قسّم كل صفحة في ملف مستقل.'
  },
  {
    to: '/organize-pdf',
    icon: '📑',
    title: 'ترتيب الصفحات',
    description: 'دوّر، احذف، أو أعد ترتيب صفحات ملف PDF.'
  },
  {
    to: '/watermark-pdf',
    icon: '💧',
    title: 'علامة مائية',
    description: 'أضف نص علامة مائية فوق كل صفحات الملف.'
  },
  {
    to: '/edit-pdf',
    icon: '✏️',
    title: 'تحرير PDF',
    description: 'أضف نص، صور، أشكال، رسم حر، تظليل، إخفاء، أو توقيع مباشرة فوق الصفحات.'
  },
  {
    to: '/pdf-to-image',
    icon: '🖼️',
    title: 'PDF → صورة',
    description: 'حوّل صفحات PDF إلى صور PNG أو JPG بجودة تختارها.'
  },
  {
    to: '/extract-text',
    icon: '📄',
    title: 'استخراج نص',
    description: 'استخرج كل النص من ملف PDF وانسخه أو نزّله.'
  },
  {
    to: '/fill-pdf-form',
    icon: '🖊️',
    title: 'تعبئة نماذج',
    description: 'عبّئ الحقول القابلة للتعبئة في ملف PDF ونزّل النسخة المكتملة.'
  },
  {
    to: '/compress-pdf',
    icon: '🗜️',
    title: 'ضغط PDF',
    description: 'قلّل حجم ملف PDF مع الحفاظ على جودة معقولة.'
  }
]

export default function PdfEditor() {
  return (
    <div>
      <div className="hero">
        <h1>PDF Editor</h1>
        <p>أدوات تحرير PDF شاملة — أغلبها يعمل بالكامل داخل متصفحك، وبعضها (زي الضغط) يمر عبر خدمة تحويل خارجية.</p>
      </div>
      <div className="tool-grid">
        {TOOLS.map((tool) => (
          <ToolCard key={tool.to} {...tool} />
        ))}
      </div>
    </div>
  )
}
