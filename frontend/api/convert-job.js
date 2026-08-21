export const config = { maxDuration: 20 }

const CLOUDCONVERT_API_KEY = process.env.CLOUDCONVERT_API_KEY
const CLOUDCONVERT_BASE = 'https://api.cloudconvert.com/v2'
const ALLOWED_EXTENSIONS = new Set(['doc', 'docx', 'xls', 'xlsx'])

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  if (!CLOUDCONVERT_API_KEY) {
    res.status(500).json({ error: 'الخادم غير مهيأ بعد (مفتاح CloudConvert غير موجود).' })
    return
  }

  const filename = typeof req.body?.filename === 'string' ? req.body.filename : 'file'
  const ext = filename.split('.').pop()?.toLowerCase()
  if (!ext || !ALLOWED_EXTENSIONS.has(ext)) {
    res.status(400).json({ error: 'صيغة الملف غير مدعومة. يُسمح فقط بـ DOC, DOCX, XLS, XLSX.' })
    return
  }

  try {
    const jobRes = await fetch(`${CLOUDCONVERT_BASE}/jobs`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${CLOUDCONVERT_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        tasks: {
          'import-file': { operation: 'import/upload' },
          'convert-file': {
            operation: 'convert',
            input: 'import-file',
            output_format: 'pdf'
          },
          'export-file': {
            operation: 'export/url',
            input: 'convert-file'
          }
        }
      })
    })
    if (!jobRes.ok) throw new Error(`CloudConvert job creation failed: ${jobRes.status}`)
    const job = (await jobRes.json()).data
    const importTask = job.tasks.find((t) => t.name === 'import-file')

    res.status(200).json({
      jobId: job.id,
      uploadUrl: importTask.result.form.url,
      uploadParameters: importTask.result.form.parameters
    })
  } catch (err) {
    console.error('CloudConvert job creation failed:', err.message)
    res.status(502).json({ error: 'تعذّر بدء عملية التحويل. حاول لاحقاً.' })
  }
}
