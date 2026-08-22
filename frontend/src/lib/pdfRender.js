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
