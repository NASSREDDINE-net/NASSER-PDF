import ToolCard from '../components/ToolCard.jsx'

const TOOLS = [
  {
    to: '/word-to-pdf',
    icon: 'W',
    title: 'Word → PDF',
    description: 'حوّل ملفات DOC وDOCX إلى PDF بتنسيق مطابق للأصل.'
  },
  {
    to: '/excel-to-pdf',
    icon: 'X',
    title: 'Excel → PDF',
    description: 'حوّل ملفات XLS وXLSX إلى PDF بسهولة.'
  },
  {
    to: '/pdf-to-word',
    icon: 'W',
    title: 'PDF → Word',
    description: 'حوّل ملف PDF إلى مستند Word قابل للتعديل.'
  },
  {
    to: '/pdf-to-excel',
    icon: 'X',
    title: 'PDF → Excel',
    description: 'حوّل ملف PDF إلى جدول بيانات Excel.'
  },
  {
    to: '/image-to-pdf',
    icon: 'IMG',
    title: 'صور → PDF',
    description: 'اجمع صور PNG وJPG في ملف PDF واحد مع خيارات تنسيق كاملة.'
  },
  {
    to: '/qr-code',
    icon: 'QR',
    title: 'QR Code',
    description: 'أنشئ رمز QR لرابط أو نص أو بريد أو رقم هاتف أو شبكة واي فاي.'
  },
  {
    to: '/pdf-editor',
    icon: '📝',
    title: 'PDF Editor',
    description: 'دمج، تقسيم، ترتيب صفحات، وإضافة علامة مائية على ملفات PDF.'
  }
]

export default function Home() {
  return (
    <div>
      <div className="hero">
        <h1>NASSER PDF</h1>
        <p>أدوات مجانية لتحويل الملفات إلى PDF وإنشاء رموز QR، تعمل مباشرة من متصفحك بدون تسجيل دخول أو حفظ لملفاتك.</p>
      </div>
      <div className="tool-grid">
        {TOOLS.map((tool) => (
          <ToolCard key={tool.to} {...tool} />
        ))}
      </div>
    </div>
  )
}
