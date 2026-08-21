import OfficeToPdf from '../components/OfficeToPdf.jsx'

export default function ExcelToPdf() {
  return (
    <OfficeToPdf
      title="تحويل Excel إلى PDF"
      lead="ارفع ملف XLS أو XLSX وسيتم تحويله إلى PDF."
      accept=".xls,.xlsx"
      extensions={['xls', 'xlsx']}
      hint="XLS أو XLSX — حتى 100MB"
    />
  )
}
