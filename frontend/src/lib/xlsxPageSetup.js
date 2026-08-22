/**
 * Forces every sheet in an .xlsx file to fit its columns within a single
 * page width (landscape), so PDF conversion doesn't split wide sheets into
 * many extra portrait pages. Only .xlsx is supported (ExcelJS can't read
 * the legacy binary .xls format) — callers should skip this for .xls files.
 *
 * exceljs is loaded lazily (dynamic import) so its ~1MB isn't part of the
 * main bundle every visitor downloads — only paid for when this tool is used.
 */
export async function fitExcelToPageWidth(file) {
  const { default: ExcelJS } = await import('exceljs')
  const buffer = await file.arrayBuffer()
  const workbook = new ExcelJS.Workbook()
  await workbook.xlsx.load(buffer)

  workbook.eachSheet((sheet) => {
    sheet.pageSetup = {
      ...sheet.pageSetup,
      orientation: 'landscape',
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 0,
      horizontalCentered: true
    }
  })

  const outBuffer = await workbook.xlsx.writeBuffer()
  return new File([outBuffer], file.name, { type: file.type })
}
