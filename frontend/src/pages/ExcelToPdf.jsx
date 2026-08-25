import OfficeToPdf from '../components/OfficeToPdf.jsx'
import { convertOfficeToPdf } from '../lib/api.js'
import { fitExcelToPageWidth } from '../lib/xlsxPageSetup.js'

async function convertExcelToPdf(file) {
  const ext = file.name.split('.').pop()?.toLowerCase()
  let fileToConvert = file

  if (ext === 'xlsx') {
    try {
      fileToConvert = await fitExcelToPageWidth(file)
    } catch (err) {
      console.error('تعذّر ضبط إعدادات الصفحة، سيُرسل الملف الأصلي:', err)
    }
  }

  return convertOfficeToPdf(fileToConvert)
}

const seo = {
  about: {
    heading: 'تحويل ملفات Excel إلى PDF أونلاين مجاناً',
    paragraphs: [
      'حوّل جداول Excel بصيغة XLS أو XLSX إلى ملف PDF جاهز للطباعة والمشاركة، مع ضبط تلقائي لإعدادات الصفحة (الاحتواء الكامل والاتجاه العرضي) لملفات XLSX حتى لا تنقسم الورقة على عدة صفحات.',
      'مفيدة لتحويل الفواتير، كشوفات الحسابات، الجداول المحاسبية، وقوائم البيانات إلى صيغة PDF ثابتة لا يمكن تعديلها بسهولة.'
    ]
  },
  steps: {
    heading: 'كيف تحوّل ملف Excel إلى PDF؟',
    items: [
      'ارفع ملف XLS أو XLSX من جهازك عبر السحب والإفلات أو زر الاختيار.',
      'ننضبط تلقائياً إعدادات الصفحة لملفات XLSX لتفادي تقسيم الجدول على صفحات كثيرة.',
      'حمّل ملف PDF الناتج فور اكتمال التحويل.'
    ]
  },
  faq: [
    { q: 'لماذا كان جدولي ينقسم على صفحات كثيرة سابقاً؟', a: 'نقوم الآن بضبط إعدادات "احتواء بصفحة واحدة" والاتجاه العرضي تلقائياً لملفات XLSX قبل التحويل، مما يقلل هذه المشكلة بشكل كبير.' },
    { q: 'هل يدعم الملفات القديمة بصيغة XLS؟', a: 'نعم، تدعم الأداة كلاً من XLS وXLSX.' },
    { q: 'ما الحد الأقصى لحجم الملف؟', a: 'يمكنك رفع ملفات حتى 100 ميجابايت.' }
  ]
}

export default function ExcelToPdf() {
  return (
    <OfficeToPdf
      title="تحويل Excel إلى PDF"
      lead="ارفع ملف XLS أو XLSX وسيتم تحويله إلى PDF. نضبط إعدادات الصفحة تلقائياً (احتواء كامل بصفحة واحدة، اتجاه Landscape) لملفات XLSX حتى لا تتقسم الورقة على صفحات كثيرة."
      accept=".xls,.xlsx"
      extensions={['xls', 'xlsx']}
      hint="XLS أو XLSX — حتى 100MB"
      convertFn={convertExcelToPdf}
      seo={seo}
    />
  )
}
