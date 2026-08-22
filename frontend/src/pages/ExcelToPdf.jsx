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

export default function ExcelToPdf() {
  return (
    <OfficeToPdf
      title="تحويل Excel إلى PDF"
      lead="ارفع ملف XLS أو XLSX وسيتم تحويله إلى PDF. نضبط إعدادات الصفحة تلقائياً (احتواء أفقي، اتجاه Landscape) لملفات XLSX حتى لا تتقسم الأعمدة على صفحات كثيرة."
      accept=".xls,.xlsx"
      extensions={['xls', 'xlsx']}
      hint="XLS أو XLSX — حتى 100MB"
      convertFn={convertExcelToPdf}
    />
  )
}
