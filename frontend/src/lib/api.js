export class ApiError extends Error {
  constructor(message, status) {
    super(message)
    this.status = status
  }
}

export async function convertOfficeToPdf(file) {
  return convertViaCloudConvert(file, { target: 'pdf' })
}

export async function convertPdfTo(file, target) {
  return convertViaCloudConvert(file, { target })
}

export async function compressPdf(file, profile = 'web') {
  return convertViaCloudConvert(file, { mode: 'compress', profile })
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
