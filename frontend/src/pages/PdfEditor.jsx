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
  }
]

export default function PdfEditor() {
  return (
    <div>
      <div className="hero">
        <h1>PDF Editor</h1>
        <p>أدوات تحرير PDF تعمل بالكامل داخل متصفحك — بدون رفع ملفاتك لأي خادم.</p>
      </div>
      <div className="tool-grid">
        {TOOLS.map((tool) => (
          <ToolCard key={tool.to} {...tool} />
        ))}
      </div>
    </div>
  )
}
