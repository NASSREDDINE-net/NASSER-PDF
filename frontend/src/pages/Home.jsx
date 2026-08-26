import ToolCard from '../components/ToolCard.jsx'
import { useLanguage, useT } from '../lib/i18n.jsx'

const CONTENT = {
  ar: {
    title: 'NASSER PDF',
    subtitle: 'أدوات مجانية لتحويل الملفات إلى PDF وإنشاء رموز QR، تعمل مباشرة من متصفحك بدون تسجيل دخول أو حفظ لملفاتك.',
    tools: [
      { to: '/word-to-pdf', icon: 'W', title: 'Word → PDF', description: 'حوّل ملفات DOC وDOCX إلى PDF بتنسيق مطابق للأصل.' },
      { to: '/excel-to-pdf', icon: 'X', title: 'Excel → PDF', description: 'حوّل ملفات XLS وXLSX إلى PDF بسهولة.' },
      { to: '/pdf-to-word', icon: 'W', title: 'PDF → Word', description: 'حوّل ملف PDF إلى مستند Word قابل للتعديل.' },
      { to: '/pdf-to-excel', icon: 'X', title: 'PDF → Excel', description: 'حوّل ملف PDF إلى جدول بيانات Excel.' },
      { to: '/image-to-pdf', icon: 'IMG', title: 'صور → PDF', description: 'اجمع صور PNG وJPG في ملف PDF واحد مع خيارات تنسيق كاملة.' },
      { to: '/qr-code', icon: 'QR', title: 'QR Code', description: 'أنشئ رمز QR لرابط أو نص أو بريد أو رقم هاتف أو شبكة واي فاي.' },
      { to: '/pdf-editor', icon: '📝', title: 'PDF Editor', description: 'دمج، تقسيم، ترتيب صفحات، حماية، وإضافة علامة مائية على ملفات PDF.' }
    ]
  },
  en: {
    title: 'NASSER PDF',
    subtitle: 'Free tools to convert files to PDF and generate QR codes, running directly in your browser with no sign-up and no files stored.',
    tools: [
      { to: '/word-to-pdf', icon: 'W', title: 'Word → PDF', description: 'Convert DOC and DOCX files to PDF with matching formatting.' },
      { to: '/excel-to-pdf', icon: 'X', title: 'Excel → PDF', description: 'Convert XLS and XLSX files to PDF easily.' },
      { to: '/pdf-to-word', icon: 'W', title: 'PDF → Word', description: 'Convert a PDF file into an editable Word document.' },
      { to: '/pdf-to-excel', icon: 'X', title: 'PDF → Excel', description: 'Convert a PDF file into an Excel spreadsheet.' },
      { to: '/image-to-pdf', icon: 'IMG', title: 'Image → PDF', description: 'Combine PNG and JPG images into one PDF with full formatting options.' },
      { to: '/qr-code', icon: 'QR', title: 'QR Code', description: 'Generate a QR code for a link, text, email, phone number, or Wi-Fi network.' },
      { to: '/pdf-editor', icon: '📝', title: 'PDF Editor', description: 'Merge, split, organize pages, protect, and watermark PDF files.' }
    ]
  }
}

export default function Home() {
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
