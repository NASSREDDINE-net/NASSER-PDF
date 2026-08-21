export const config = { maxDuration: 15 }

const CLOUDCONVERT_API_KEY = process.env.CLOUDCONVERT_API_KEY
const CLOUDCONVERT_BASE = 'https://api.cloudconvert.com/v2'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  if (!CLOUDCONVERT_API_KEY) {
    res.status(500).json({ error: 'الخادم غير مهيأ بعد (مفتاح CloudConvert غير موجود).' })
    return
  }

  const jobId = req.query.jobId
  if (!jobId || Array.isArray(jobId)) {
    res.status(400).json({ error: 'jobId مفقود أو غير صالح.' })
    return
  }

  try {
    const jobRes = await fetch(`${CLOUDCONVERT_BASE}/jobs/${jobId}`, {
      headers: { Authorization: `Bearer ${CLOUDCONVERT_API_KEY}` }
    })
    if (!jobRes.ok) throw new Error(`CloudConvert status check failed: ${jobRes.status}`)
    const job = (await jobRes.json()).data

    if (job.status === 'finished') {
      const exportTask = job.tasks.find((t) => t.name === 'export-file')
      const downloadUrl = exportTask?.result?.files?.[0]?.url
      if (!downloadUrl) {
        res.status(200).json({ status: 'error', message: 'اكتمل التحويل لكن تعذّر إيجاد رابط الملف.' })
        return
      }
      res.status(200).json({ status: 'finished', downloadUrl })
      return
    }

    if (job.status === 'error') {
      const failedTask = job.tasks.find((t) => t.status === 'error')
      res.status(200).json({ status: 'error', message: failedTask?.message || 'فشل التحويل.' })
      return
    }

    res.status(200).json({ status: 'processing' })
  } catch (err) {
    console.error('CloudConvert status check failed:', err.message)
    res.status(502).json({ error: 'تعذّر التحقق من حالة التحويل.' })
  }
}
