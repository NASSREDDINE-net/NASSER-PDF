const RENDER_API_URL = import.meta.env.VITE_RENDER_API_URL || ''

export class ApiError extends Error {
  constructor(message, status) {
    super(message)
    this.status = status
  }
}

export async function convertOfficeToPdf(file) {
  return convertWithFallback(file, { target: 'pdf' })
}

export async function convertPdfTo(file, target) {
  return convertWithFallback(file, { target })
}

export async function compressPdf(file, profile = 'web') {
  // الضغط متاح فقط عبر CloudConvert حالياً (لا يوجد خادم LibreOffice احتياطي له)
  return convertViaCloudConvert(file, { mode: 'compress', profile })
}

/**
 * يجرّب CloudConvert أولاً؛ إذا فشل ويوجد خادم LibreOffice احتياطي مهيأ
 * (VITE_RENDER_API_URL)، يعيد المحاولة عليه قبل الاستسلام.
 */
async function convertWithFallback(file, jobOptions) {
  try {
    return await convertViaCloudConvert(file, jobOptions)
  } catch (cloudConvertError) {
    if (!RENDER_API_URL) throw cloudConvertError
    try {
      return await convertViaRenderBackend(file, jobOptions.target)
    } catch (renderError) {
      throw new ApiError(
        `تعذّر التحويل عبر الطريقتين المتاحتين — CloudConvert: ${cloudConvertError.message} — الخادم الاحتياطي: ${renderError.message}`,
        cloudConvertError.status
      )
    }
  }
}

async function convertViaRenderBackend(file, target) {
  const form = new FormData()
  form.append('file', file)
  form.append('target', target)

  let response
  try {
    response = await fetch(`${RENDER_API_URL}/api/convert`, { method: 'POST', body: form })
  } catch {
    throw new ApiError('تعذّر الاتصال بالخادم الاحتياطي.', 0)
  }
  if (!response.ok) {
    throw new ApiError(await safeErrorMessage(response, 'فشل التحويل عبر الخادم الاحتياطي.'), response.status)
  }
  return response.blob()
}

async function convertViaCloudConvert(file, jobOptions) {
  const { jobId, uploadUrl, uploadParameters } = await createConvertJob(file.name, jobOptions)
  await uploadToCloudConvert(uploadUrl, uploadParameters, file)
  const downloadUrl = await pollForResult(jobId)
  return downloadConvertedFile(downloadUrl)
}

async function createConvertJob(filename, jobOptions) {
  let response
  try {
    response = await fetch('/api/convert-job', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filename, ...jobOptions })
    })
  } catch {
    throw new ApiError('تعذّر الاتصال بخادم التحويل. تحقق من اتصالك بالإنترنت وحاول مجدداً.', 0)
  }

  if (!response.ok) {
    throw new ApiError(await safeErrorMessage(response, 'تعذّر بدء عملية التحويل.'), response.status)
  }

  return response.json()
}

async function uploadToCloudConvert(uploadUrl, uploadParameters, file) {
  const form = new FormData()
  Object.entries(uploadParameters).forEach(([key, value]) => form.append(key, value))
  form.append('file', file)

  let response
  try {
    response = await fetch(uploadUrl, { method: 'POST', body: form })
  } catch {
    throw new ApiError('تعذّر رفع الملف. تحقق من اتصالك بالإنترنت وحاول مجدداً.', 0)
  }

  if (!response.ok) {
    throw new ApiError('تعذّر رفع الملف إلى خدمة التحويل.', response.status)
  }
}

async function pollForResult(jobId, timeoutMs = 90000, intervalMs = 1500) {
  const start = Date.now()
  while (Date.now() - start < timeoutMs) {
    const response = await fetch(`/api/convert-status?jobId=${encodeURIComponent(jobId)}`)
    if (!response.ok) {
      throw new ApiError(await safeErrorMessage(response, 'تعذّر التحقق من حالة التحويل.'), response.status)
    }
    const data = await response.json()
    if (data.status === 'finished') return data.downloadUrl
    if (data.status === 'error') throw new ApiError(data.message || 'فشل التحويل.', 422)
    await new Promise((resolve) => setTimeout(resolve, intervalMs))
  }
  throw new ApiError('استغرق التحويل وقتاً أطول من المتوقع. حاول مجدداً.', 504)
}

async function downloadConvertedFile(downloadUrl) {
  let response
  try {
    response = await fetch(downloadUrl)
  } catch {
    throw new ApiError('تعذّر تنزيل الملف المحوَّل.', 0)
  }
  if (!response.ok) {
    throw new ApiError('تعذّر تنزيل الملف المحوَّل.', response.status)
  }
  return response.blob()
}

async function safeErrorMessage(response, fallback) {
  try {
    const data = await response.json()
    return data?.error || fallback
  } catch {
    return fallback
  }
}
