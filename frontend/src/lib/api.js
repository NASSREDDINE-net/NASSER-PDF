const API_BASE = import.meta.env.VITE_API_URL || ''

export class ApiError extends Error {
  constructor(message, status) {
    super(message)
    this.status = status
  }
}

export async function convertOfficeToPdf(file) {
  const formData = new FormData()
  formData.append('file', file)

  let response
  try {
    response = await fetch(`${API_BASE}/api/convert`, {
      method: 'POST',
      body: formData
    })
  } catch {
    throw new ApiError('تعذّر الاتصال بخادم التحويل. تحقق من اتصالك بالإنترنت وحاول مجدداً.', 0)
  }

  if (!response.ok) {
    if (response.status === 413) {
      throw new ApiError('حجم الملف أكبر من الحد المسموح به.', 413)
    }
    if (response.status === 429) {
      throw new ApiError('عدد كبير من الطلبات، الرجاء المحاولة بعد قليل.', 429)
    }
    let message = 'تعذّر تحويل الملف. تأكد أنه ملف صالح وحاول مجدداً.'
    try {
      const data = await response.json()
      if (data?.error) message = data.error
    } catch {
      /* ignore parse errors */
    }
    throw new ApiError(message, response.status)
  }

  return response.blob()
}
