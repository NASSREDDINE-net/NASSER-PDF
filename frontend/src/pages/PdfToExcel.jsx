import OfficeToPdf from '../components/OfficeToPdf.jsx'
import { convertPdfTo } from '../lib/api.js'

export default function PdfToExcel() {
  return (
    <OfficeToPdf
      title="تحويل PDF إلى Excel"
      lead="ارفع ملف PDF وسيتم تحويله إلى جدول بيانات Excel (XLSX)."
      accept=".pdf"
      extensions={['pdf']}
      hint="PDF فقط — حتى 100MB"
      convertFn={(file) => convertPdfTo(file, 'xlsx')}
      outputExtension="xlsx"
      buttonLabel="تحويل إلى Excel وتنزيل"
      loadingLabel="جارٍ التحويل..."
    />
  )
}
