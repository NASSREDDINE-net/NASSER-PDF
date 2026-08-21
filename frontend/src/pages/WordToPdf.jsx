import OfficeToPdf from '../components/OfficeToPdf.jsx'

export default function WordToPdf() {
  return (
    <OfficeToPdf
      title="تحويل Word إلى PDF"
      lead="ارفع ملف DOC أو DOCX وسيتم تحويله إلى PDF بتنسيق مطابق للأصل."
      accept=".doc,.docx"
      extensions={['doc', 'docx']}
      hint="DOC أو DOCX — حتى 15MB"
    />
  )
}
