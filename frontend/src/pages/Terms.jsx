import { useT } from '../lib/i18n.jsx'

const TXT = {
  ar: {
    title: 'شروط الاستخدام',
    updated: 'آخر تحديث: 2026',
    h1: 'الاستخدام المقبول',
    p1: 'NASSER PDF أداة مجانية للاستخدام الشخصي. يُمنع استخدام الموقع لرفع محتوى غير قانوني، أو محاولة إساءة استخدام الخدمة (مثل الإرسال الآلي المكثف للطلبات).',
    h2: 'حدود الخدمة',
    p2: 'هناك حد أقصى لحجم الملفات المسموح برفعها، وقد يتم تقييد عدد الطلبات في حال ملاحظة استخدام غير اعتيادي للحفاظ على استقرار الخدمة لجميع المستخدمين.',
    h3: 'إخلاء مسؤولية',
    p3: 'يُقدَّم الموقع "كما هو" دون أي ضمانات. لا نتحمل مسؤولية أي فقدان بيانات أو أضرار ناتجة عن استخدام الأدوات. يُنصح بالاحتفاظ بنسخة من ملفاتك الأصلية قبل التحويل.',
    h4: 'التعديلات',
    p4: 'قد تُحدَّث هذه الشروط من وقت لآخر، وسيُعتبر استمرار استخدام الموقع موافقة على أي تعديل.'
  },
  en: {
    title: 'Terms of Use',
    updated: 'Last updated: 2026',
    h1: 'Acceptable use',
    p1: 'NASSER PDF is a free tool for personal use. Using the site to upload illegal content, or to abuse the service (e.g. heavy automated requests), is not allowed.',
    h2: 'Service limits',
    p2: 'There is a maximum file size for uploads, and request rates may be limited if unusual usage is detected, in order to keep the service stable for all users.',
    h3: 'Disclaimer',
    p3: 'The site is provided "as is" with no warranties. We are not liable for any data loss or damages resulting from using the tools. We recommend keeping a copy of your original files before converting them.',
    h4: 'Changes',
    p4: 'These terms may be updated from time to time. Continued use of the site constitutes acceptance of any changes.'
  }
}

export default function Terms() {
  const t = useT(TXT)
  return (
    <div className="static-page">
      <h1>{t.title}</h1>
      <p>{t.updated}</p>

      <h2>{t.h1}</h2>
      <p>{t.p1}</p>

      <h2>{t.h2}</h2>
      <p>{t.p2}</p>

      <h2>{t.h3}</h2>
      <p>{t.p3}</p>

      <h2>{t.h4}</h2>
      <p>{t.p4}</p>
    </div>
  )
}
