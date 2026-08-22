/**
 * Forces every sheet in an .xlsx file to fit entirely on one landscape page
 * (both width and height), so PDF conversion doesn't split it into many
 * extra pages. Only .xlsx is supported (ExcelJS can't read the legacy
 * binary .xls format) — callers should skip this for .xls files.
 *
 * Note: for very large sheets (hundreds of rows), LibreOffice's fit-to-page
 * scaling has a practical minimum — extremely large sheets may still shrink
 * to the point of being hard to read, or clip, despite this setting.
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
      fitToHeight: 1,
      horizontalCentered: true
    }
  })

  const outBuffer = await workbook.xlsx.writeBuffer()
  return new File([outBuffer], file.name, { type: file.type })
}
