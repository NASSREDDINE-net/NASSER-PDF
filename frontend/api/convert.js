import { IncomingForm } from 'formidable'
import { readFile } from 'node:fs/promises'

export const config = {
  api: {
    bodyParser: false
  },
  maxDuration: 60
}

const MAX_FILE_BYTES = 15 * 1024 * 1024
const ALLOWED_EXTENSIONS = new Set(['doc', 'docx', 'xls', 'xlsx'])
const CLOUDCONVERT_API_KEY = process.env.CLOUDCONVERT_API_KEY
const CLOUDCONVERT_BASE = 'https://api.cloudconvert.com/v2'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  if (!CLOUDCONVERT_API_KEY) {
    res.status(500).json({ error: 'الخادم غير مهيأ بعد (مفتاح CloudConvert غير موجود).' })
    return
  }

  let files
  try {
    const form = new IncomingForm({ maxFileSize: MAX_FILE_BYTES })
    ;({ files } = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err)
        else resolve({ fields, files })
      })
    }))
  } catch {
    res.status(413).json({ error: 'حجم الملف أكبر من الحد المسموح به (15MB).' })
    return
  }

  const uploaded = Array.isArray(files.file) ? files.file[0] : files.file
  if (!uploaded) {
    res.status(400).json({ error: 'لم يتم إرفاق أي ملف.' })
    return
  }

  const originalName = uploaded.originalFilename || 'file'
  const ext = originalName.split('.').pop()?.toLowerCase()
  if (!ext || !ALLOWED_EXTENSIONS.has(ext)) {
    res.status(400).json({ error: 'صيغة الملف غير مدعومة. يُسمح فقط بـ DOC, DOCX, XLS, XLSX.' })
    return
  }

  try {
    const pdfBuffer = await convertWithCloudConvert(uploaded.filepath, originalName)
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', 'attachment; filename="converted.pdf"')
    res.status(200).send(pdfBuffer)
  } catch (err) {
    console.error('CloudConvert conversion failed:', err.message)
    res.status(502).json({ error: 'تعذّر تحويل الملف عبر خدمة التحويل. تأكد أنه ملف صالح وحاول مجدداً.' })
  }
}

async function convertWithCloudConvert(filepath, filename) {
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
  const { url: uploadUrl, parameters: uploadParams } = importTask.result.form

  const fileBuffer = await readFile(filepath)
  const uploadForm = new FormData()
  Object.entries(uploadParams).forEach(([key, value]) => uploadForm.append(key, value))
  uploadForm.append('file', new Blob([fileBuffer]), filename)

  const uploadRes = await fetch(uploadUrl, { method: 'POST', body: uploadForm })
  if (!uploadRes.ok) throw new Error(`CloudConvert upload failed: ${uploadRes.status}`)

  const finishedJob = await waitForJob(job.id)
  const exportTask = finishedJob.tasks.find((t) => t.name === 'export-file')
  const fileUrl = exportTask.result.files[0].url

  const pdfRes = await fetch(fileUrl)
  if (!pdfRes.ok) throw new Error('Failed to download converted file')
  return Buffer.from(await pdfRes.arrayBuffer())
}

async function waitForJob(jobId, timeoutMs = 50000, intervalMs = 1500) {
  const start = Date.now()
  while (Date.now() - start < timeoutMs) {
    const res = await fetch(`${CLOUDCONVERT_BASE}/jobs/${jobId}`, {
      headers: { Authorization: `Bearer ${CLOUDCONVERT_API_KEY}` }
    })
    const job = (await res.json()).data
    if (job.status === 'finished') return job
    if (job.status === 'error') throw new Error('CloudConvert job failed')
    await new Promise((r) => setTimeout(r, intervalMs))
  }
  throw new Error('CloudConvert job timed out')
}
