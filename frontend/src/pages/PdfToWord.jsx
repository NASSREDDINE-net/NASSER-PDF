import OfficeToPdf from '../components/OfficeToPdf.jsx'
import { convertPdfTo } from '../lib/api.js'

export default function PdfToWord() {
  return (
    <OfficeToPdf
      title="تحويل PDF إلى Word"
      lead="ارفع ملف PDF وسيتم تحويله إلى مستند Word (DOCX) قابل للتعديل."
      accept=".pdf"
      extensions={['pdf']}
      hint="PDF فقط — حتى 100MB"
      convertFn={(file) => convertPdfTo(file, 'docx')}
      outputExtension="docx"
      buttonLabel="تحويل إلى Word وتنزيل"
      loadingLabel="جارٍ التحويل..."
    />
  )
}
