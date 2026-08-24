export async function recognizeImages(images, lang, onProgress) {
  const { createWorker } = await import('tesseract.js')
  const worker = await createWorker(lang)
  const results = []
  try {
    for (let i = 0; i < images.length; i++) {
      onProgress?.(i, images.length)
      const { data } = await worker.recognize(images[i])
      results.push(data.text)
    }
  } finally {
    await worker.terminate()
  }
  return results
}
