import { useT } from '../lib/i18n.jsx'

const TXT = {
  ar: {
    title: 'حول NASSER PDF',
    intro:
      'NASSER PDF موقع مجاني لتحويل الملفات إلى PDF وإنشاء رموز QR، بدون حاجة لإنشاء حساب أو تسجيل دخول. الهدف هو توفير أدوات سريعة وبسيطة تنجز المهمة مباشرة دون تعقيد.',
    offersHeading: 'ماذا يقدّم الموقع؟',
    offers: [
      'تحويل Word (DOC/DOCX) إلى PDF بتنسيق مطابق للأصل.',
      'تحويل Excel (XLS/XLSX) إلى PDF.',
      'تحويل الصور (PNG/JPG/JPEG) إلى ملف PDF واحد أو أكثر.',
      'إنشاء رموز QR لروابط ونصوص وبيانات تواصل وشبكات واي فاي.'
    ],
    privacyHeading: 'الخصوصية أولاً',
    privacyText:
      'أدوات الصور ورموز QR تعمل بالكامل داخل متصفحك، أما تحويل Word وExcel فيُعالَج مؤقتاً على الخادم لإجراء التحويل ثم يُحذف الملف فوراً بعد إرسال النتيجة. لمزيد من التفاصيل راجع صفحة الخصوصية.'
  },
  en: {
    title: 'About NASSER PDF',
    intro:
      'NASSER PDF is a free site for converting files to PDF and generating QR codes, with no account or sign-up required. The goal is to offer fast, simple tools that get the job done without complication.',
    offersHeading: 'What does the site offer?',
    offers: [
      'Convert Word (DOC/DOCX) to PDF with matching formatting.',
      'Convert Excel (XLS/XLSX) to PDF.',
      'Convert images (PNG/JPG/JPEG) into one or more PDF files.',
      'Generate QR codes for links, text, contact details, and Wi-Fi networks.'
    ],
    privacyHeading: 'Privacy first',
    privacyText:
      'Image and QR code tools run entirely in your browser. Word and Excel conversion is processed briefly on the server to perform the conversion, then the file is deleted immediately after the result is sent back. See the Privacy page for more details.'
  }
}

export default function About() {
  const t = useT(TXT)
  return (
    <div className="static-page">
      <h1>{t.title}</h1>
      <p>{t.intro}</p>
      <h2>{t.offersHeading}</h2>
      <ul>
        {t.offers.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
      <h2>{t.privacyHeading}</h2>
      <p>{t.privacyText}</p>
    </div>
  )
}
