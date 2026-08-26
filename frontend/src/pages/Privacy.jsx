import { useT } from '../lib/i18n.jsx'

const TXT = {
  ar: {
    title: 'سياسة الخصوصية',
    updated: 'آخر تحديث: 2026',
    h1: 'معالجة الملفات',
    p1: 'أدوات تحويل الصور إلى PDF وإنشاء رموز QR تعمل بالكامل داخل متصفحك، ولا يتم رفع أي ملف إلى أي خادم.',
    p2: 'أدوات تحويل Word وExcel إلى PDF تحتاج معالجة على الخادم لإجراء التحويل. يتم رفع الملف مؤقتاً، تحويله، إرسال الناتج إليك، ثم حذف الملف الأصلي والناتج فوراً من الخادم. لا تُحفظ الملفات ولا يتم الاطلاع على محتواها من قِبل أي شخص.',
    h2: 'البيانات التي نجمعها',
    p3: 'لا يتطلب استخدام الموقع إنشاء حساب أو تقديم بيانات شخصية. قد يتم جمع بيانات استخدام تقنية أساسية (مثل عنوان IP ونوع المتصفح) لأغراض الحماية من إساءة الاستخدام فقط.',
    h3: 'ملفات تعريف الارتباط',
    p4: 'الموقع لا يستخدم ملفات تعريف ارتباط للتتبع أو الإعلانات.',
    h4: 'التواصل',
    p5: 'لأي استفسار حول الخصوصية يمكنك التواصل عبر البريد الإلكتروني الموضح في صفحة حول الموقع.'
  },
  en: {
    title: 'Privacy Policy',
    updated: 'Last updated: 2026',
    h1: 'File processing',
    p1: 'The image-to-PDF and QR code tools run entirely in your browser — no file is ever uploaded to a server.',
    p2: 'Word and Excel to PDF conversion requires brief server-side processing. The file is uploaded temporarily, converted, the result sent back to you, then both the original file and the output are deleted immediately from the server. Files are never stored, and their content is never viewed by anyone.',
    h2: 'Data we collect',
    p3: 'Using the site does not require creating an account or providing personal information. Basic technical usage data (such as IP address and browser type) may be collected solely for abuse prevention.',
    h3: 'Cookies',
    p4: 'The site does not use tracking or advertising cookies.',
    h4: 'Contact',
    p5: 'For any privacy inquiries, you can reach out via the email address listed on the About page.'
  }
}

export default function Privacy() {
  const t = useT(TXT)
  return (
    <div className="static-page">
      <h1>{t.title}</h1>
      <p>{t.updated}</p>

      <h2>{t.h1}</h2>
      <p>{t.p1}</p>
      <p>{t.p2}</p>

      <h2>{t.h2}</h2>
      <p>{t.p3}</p>

      <h2>{t.h3}</h2>
      <p>{t.p4}</p>

      <h2>{t.h4}</h2>
      <p>{t.p5}</p>
    </div>
  )
}
