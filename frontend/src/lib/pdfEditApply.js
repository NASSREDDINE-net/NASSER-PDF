import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'

function hexToRgb01(hex) {
  const clean = hex.replace('#', '')
  const r = parseInt(clean.substring(0, 2), 16) / 255
  const g = parseInt(clean.substring(2, 4), 16) / 255
  const b = parseInt(clean.substring(4, 6), 16) / 255
  return rgb(r, g, b)
}

/**
 * @param {File} file original PDF
 * @param {Record<number, object[]>} annotationsByPage 1-based page number -> annotation list
 * @param {Record<number, {scale: number}>} pageRenders render scale (px per pt) used per page
 */
export async function applyAnnotations(file, annotationsByPage, pageRenders) {
  const bytes = await file.arrayBuffer()
  const doc = await PDFDocument.load(bytes)
  const font = await doc.embedFont(StandardFonts.Helvetica)
  const imageCache = new Map()

  for (const [pageNumberStr, annotations] of Object.entries(annotationsByPage)) {
    if (!annotations || annotations.length === 0) continue
    const pageNumber = Number(pageNumberStr)
    const page = doc.getPage(pageNumber - 1)
    const { height: pageHeightPts } = page.getSize()
    const scale = pageRenders[pageNumber]?.scale
    if (!scale) continue

    const toPt = (px) => px / scale
    const flipY = (yPx) => pageHeightPts - toPt(yPx)

    for (const ann of annotations) {
      if (ann.type === 'text') {
        page.drawText(ann.text || '', {
          x: toPt(ann.x),
          y: flipY(ann.y + ann.height) ,
          size: toPt(ann.height) * 0.8,
          font,
          color: hexToRgb01(ann.color || '#111111')
        })
      } else if (ann.type === 'image') {
        let embedded = imageCache.get(ann.dataUrl)
        if (!embedded) {
          const isPng = ann.dataUrl.startsWith('data:image/png')
          embedded = isPng ? await doc.embedPng(ann.dataUrl) : await doc.embedJpg(ann.dataUrl)
          imageCache.set(ann.dataUrl, embedded)
        }
        page.drawImage(embedded, {
          x: toPt(ann.x),
          y: flipY(ann.y + ann.height),
          width: toPt(ann.width),
          height: toPt(ann.height)
        })
      } else if (ann.type === 'rect') {
        page.drawRectangle({
          x: toPt(ann.x),
          y: flipY(ann.y + ann.height),
          width: toPt(ann.width),
          height: toPt(ann.height),
          borderColor: hexToRgb01(ann.color || '#111111'),
          borderWidth: ann.strokeWidth || 2
        })
      } else if (ann.type === 'highlight' || ann.type === 'whiteout') {
        page.drawRectangle({
          x: toPt(ann.x),
          y: flipY(ann.y + ann.height),
          width: toPt(ann.width),
          height: toPt(ann.height),
          color: hexToRgb01(ann.type === 'whiteout' ? '#ffffff' : ann.color || '#ffeb3b'),
          opacity: ann.type === 'whiteout' ? 1 : 0.35
        })
      } else if (ann.type === 'ellipse') {
        page.drawEllipse({
          x: toPt(ann.x + ann.width / 2),
          y: flipY(ann.y + ann.height / 2),
          xScale: toPt(ann.width / 2),
          yScale: toPt(ann.height / 2),
          borderColor: hexToRgb01(ann.color || '#111111'),
          borderWidth: ann.strokeWidth || 2
        })
      } else if (ann.type === 'path') {
        const points = ann.points || []
        for (let i = 0; i < points.length - 1; i++) {
          page.drawLine({
            start: { x: toPt(points[i].x), y: flipY(points[i].y) },
            end: { x: toPt(points[i + 1].x), y: flipY(points[i + 1].y) },
            thickness: ann.strokeWidth || 3,
            color: hexToRgb01(ann.color || '#111111')
          })
        }
      }
    }
  }

  const outBytes = await doc.save()
  return new Blob([outBytes], { type: 'application/pdf' })
}
