import { PDFDocument, degrees, StandardFonts, rgb } from 'pdf-lib'

export async function mergePdfs(files) {
  const merged = await PDFDocument.create()
  for (const file of files) {
    const bytes = await file.arrayBuffer()
    const src = await PDFDocument.load(bytes)
    const pages = await merged.copyPages(src, src.getPageIndices())
    pages.forEach((page) => merged.addPage(page))
  }
  const bytes = await merged.save()
  return new Blob([bytes], { type: 'application/pdf' })
}

export async function getPdfPageCount(file) {
  const bytes = await file.arrayBuffer()
  const doc = await PDFDocument.load(bytes)
  return doc.getPageCount()
}

export function parsePageRanges(input, maxPage) {
  const parts = input
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)

  if (parts.length === 0) {
    throw new Error('أدخل نطاق صفحات صالح، مثال: 1-3,5,7-9')
  }

  return parts.map((part) => {
    const match = part.match(/^(\d+)(?:-(\d+))?$/)
    if (!match) {
      throw new Error(`نطاق غير صالح: "${part}"`)
    }
    const start = parseInt(match[1], 10)
    const end = match[2] ? parseInt(match[2], 10) : start
    if (start < 1 || end > maxPage || start > end) {
      throw new Error(`نطاق خارج الحدود: "${part}" (الملف فيه ${maxPage} صفحة)`)
    }
    return { start, end }
  })
}

export async function splitPdfByRanges(file, ranges) {
  const bytes = await file.arrayBuffer()
  const src = await PDFDocument.load(bytes)
  const outputs = []
  for (const { start, end } of ranges) {
    const out = await PDFDocument.create()
    const indices = []
    for (let i = start; i <= end; i++) indices.push(i - 1)
    const pages = await out.copyPages(src, indices)
    pages.forEach((page) => out.addPage(page))
    outputs.push({ name: `pages-${start}-${end}.pdf`, bytes: await out.save() })
  }
  return outputs
}

export async function splitPdfToSinglePages(file) {
  const bytes = await file.arrayBuffer()
  const src = await PDFDocument.load(bytes)
  const count = src.getPageCount()
  const outputs = []
  for (let i = 0; i < count; i++) {
    const out = await PDFDocument.create()
    const [page] = await out.copyPages(src, [i])
    out.addPage(page)
    outputs.push({ name: `page-${i + 1}.pdf`, bytes: await out.save() })
  }
  return outputs
}

/**
 * @param {File} file
 * @param {{ originalIndex: number, rotateBy: number }[]} pageOps final order, excluding deleted pages
 */
export async function organizePdf(file, pageOps) {
  const bytes = await file.arrayBuffer()
  const src = await PDFDocument.load(bytes)
  const out = await PDFDocument.create()
  const indices = pageOps.map((op) => op.originalIndex)
  const pages = await out.copyPages(src, indices)
  pages.forEach((page, i) => {
    const rotateBy = pageOps[i].rotateBy || 0
    if (rotateBy) {
      const current = page.getRotation().angle
      page.setRotation(degrees((current + rotateBy + 360) % 360))
    }
    out.addPage(page)
  })
  const outBytes = await out.save()
  return new Blob([outBytes], { type: 'application/pdf' })
}

const WATERMARK_COLORS = {
  gray: rgb(0.5, 0.5, 0.5),
  red: rgb(0.86, 0.15, 0.15),
  blue: rgb(0.15, 0.35, 0.86)
}

export async function watermarkPdf(file, { text, opacity, fontSize, rotationDeg, color }) {
  const bytes = await file.arrayBuffer()
  const doc = await PDFDocument.load(bytes)
  const font = await doc.embedFont(StandardFonts.HelveticaBold)
  const pages = doc.getPages()

  pages.forEach((page) => {
    const { width, height } = page.getSize()
    const textWidth = font.widthOfTextAtSize(text, fontSize)
    page.drawText(text, {
      x: width / 2 - textWidth / 2,
      y: height / 2,
      size: fontSize,
      font,
      color: WATERMARK_COLORS[color] || WATERMARK_COLORS.gray,
      opacity,
      rotate: degrees(rotationDeg)
    })
  })

  const outBytes = await doc.save()
  return new Blob([outBytes], { type: 'application/pdf' })
}
