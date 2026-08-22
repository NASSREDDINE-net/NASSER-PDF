import * as pdfjsLib from 'pdfjs-dist'
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url'

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker

export async function loadPdfForRendering(file) {
  const bytes = await file.arrayBuffer()
  const task = pdfjsLib.getDocument({ data: bytes })
  return task.promise
}

/**
 * Renders a 1-based page number to a canvas sized to targetWidth (px),
 * preserving aspect ratio. Returns the data URL plus the render scale
 * (px per PDF point) needed to convert overlay coordinates back to PDF points.
 */
export async function renderPageToDataUrl(pdfDoc, pageNumber, targetWidth = 780) {
  const page = await pdfDoc.getPage(pageNumber)
  const baseViewport = page.getViewport({ scale: 1 })
  const scale = targetWidth / baseViewport.width
  const viewport = page.getViewport({ scale })

  const canvas = document.createElement('canvas')
  canvas.width = Math.round(viewport.width)
  canvas.height = Math.round(viewport.height)
  const ctx = canvas.getContext('2d')

  await page.render({ canvasContext: ctx, viewport }).promise

  return {
    dataUrl: canvas.toDataURL('image/png'),
    width: canvas.width,
    height: canvas.height,
    scale
  }
}

/**
 * Renders a 1-based page number to an image Blob at the given target width (px).
 */
export async function renderPageToImageBlob(pdfDoc, pageNumber, targetWidth, format = 'png', jpegQuality = 0.92) {
  const page = await pdfDoc.getPage(pageNumber)
  const baseViewport = page.getViewport({ scale: 1 })
  const scale = targetWidth / baseViewport.width
  const viewport = page.getViewport({ scale })

  const canvas = document.createElement('canvas')
  canvas.width = Math.round(viewport.width)
  canvas.height = Math.round(viewport.height)
  const ctx = canvas.getContext('2d')

  if (format === 'jpeg') {
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }

  await page.render({ canvasContext: ctx, viewport }).promise

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('تعذّر إنشاء الصورة'))),
      format === 'jpeg' ? 'image/jpeg' : 'image/png',
      format === 'jpeg' ? jpegQuality : undefined
    )
  })
}

/**
 * Extracts plain text content from every page of the document.
 */
export async function extractPdfText(pdfDoc) {
  const pages = []
  for (let i = 1; i <= pdfDoc.numPages; i++) {
    const page = await pdfDoc.getPage(i)
    const content = await page.getTextContent()
    const text = content.items.map((item) => item.str).join(' ')
    pages.push(text)
  }
  return pages
}
