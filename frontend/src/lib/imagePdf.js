import { PDFDocument } from 'pdf-lib'

const MM_TO_PT = 72 / 25.4
const PX_TO_PT = 72 / 96

const A4_PT = { width: 595.28, height: 841.89 }

function loadImageElement(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      resolve(img)
      URL.revokeObjectURL(url)
    }
    img.onerror = (err) => {
      URL.revokeObjectURL(url)
      reject(err)
    }
    img.src = url
  })
}

function encodeJpeg(img, quality) {
  const canvas = document.createElement('canvas')
  canvas.width = img.naturalWidth
  canvas.height = img.naturalHeight
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.drawImage(img, 0, 0)
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) return reject(new Error('تعذّر معالجة الصورة'))
        blob.arrayBuffer().then(resolve).catch(reject)
      },
      'image/jpeg',
      quality
    )
  })
}

/**
 * @param {File[]} files images in desired order
 * @param {{pageSize: 'a4'|'fit', orientation: 'portrait'|'landscape', marginMm: number, quality: number}} options
 */
export async function imagesToPdf(files, options) {
  const { pageSize, orientation, marginMm, quality } = options
  const pdfDoc = await PDFDocument.create()
  const margin = marginMm * MM_TO_PT

  for (const file of files) {
    const img = await loadImageElement(file)
    const jpegBytes = await encodeJpeg(img, quality)
    const jpegImage = await pdfDoc.embedJpg(jpegBytes)

    const imgWidthPt = img.naturalWidth * PX_TO_PT
    const imgHeightPt = img.naturalHeight * PX_TO_PT

    let pageWidth
    let pageHeight

    if (pageSize === 'fit') {
      pageWidth = imgWidthPt + margin * 2
      pageHeight = imgHeightPt + margin * 2
    } else {
      pageWidth = A4_PT.width
      pageHeight = A4_PT.height
      if (orientation === 'landscape') {
        ;[pageWidth, pageHeight] = [pageHeight, pageWidth]
      }
    }

    const page = pdfDoc.addPage([pageWidth, pageHeight])

    const availableWidth = pageWidth - margin * 2
    const availableHeight = pageHeight - margin * 2
    const scale = Math.min(availableWidth / imgWidthPt, availableHeight / imgHeightPt, 1)
    const drawWidth = imgWidthPt * scale
    const drawHeight = imgHeightPt * scale

    page.drawImage(jpegImage, {
      x: (pageWidth - drawWidth) / 2,
      y: (pageHeight - drawHeight) / 2,
      width: drawWidth,
      height: drawHeight
    })
  }

  const pdfBytes = await pdfDoc.save()
  return new Blob([pdfBytes], { type: 'application/pdf' })
}

export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}
