import { isValidSessionToken } from './_session.js'

export const config = { maxDuration: 20 }

const CLOUDCONVERT_API_KEY = process.env.CLOUDCONVERT_API_KEY
const CLOUDCONVERT_BASE = 'https://api.cloudconvert.com/v2'
// Gate is active only once SESSION_SECRET is configured - keeps the site
// working ungated until Google sign-in is actually set up.
const AUTH_REQUIRED = Boolean(process.env.SESSION_SECRET)

// target format -> allowed source extensions
const CONVERT_RULES = {
  pdf: new Set(['doc', 'docx', 'xls', 'xlsx']),
  docx: new Set(['pdf']),
  xlsx: new Set(['pdf'])
}

const COMPRESS_PROFILES = new Set(['web', 'print', 'archive'])
const PROTECT_ACTIONS = new Set(['add', 'remove'])

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  if (!CLOUDCONVERT_API_KEY) {
    res.status(500).json({ error: 'الخادم غير مهيأ بعد (مفتاح CloudConvert غير موجود).' })
    return
  }

  if (AUTH_REQUIRED) {
    const authHeader = req.headers.authorization || ''
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : ''
    if (!isValidSessionToken(token)) {
      res.status(401).json({ error: 'يلزم تسجيل الدخول لاستخدام هذه الأداة.' })
      return
    }
  }

  const filename = typeof req.body?.filename === 'string' ? req.body.filename : 'file'
  const mode = req.body?.mode === 'compress' ? 'compress' : req.body?.mode === 'protect' ? 'protect' : 'convert'
  const ext = filename.split('.').pop()?.toLowerCase()

  let convertTask

  if (mode === 'compress') {
    const profile = COMPRESS_PROFILES.has(req.body?.profile) ? req.body.profile : 'web'
    if (ext !== 'pdf') {
      res.status(400).json({ error: 'الضغط متاح فقط لملفات PDF.' })
      return
    }
    convertTask = { operation: 'optimize', input: 'import-file', input_format: 'pdf', profile }
  } else if (mode === 'protect') {
    const action = PROTECT_ACTIONS.has(req.body?.action) ? req.body.action : 'add'
    const password = typeof req.body?.password === 'string' ? req.body.password : ''
    if (ext !== 'pdf') {
      res.status(400).json({ error: 'هذه الأداة متاحة فقط لملفات PDF.' })
      return
    }
    if (!password) {
      res.status(400).json({ error: 'كلمة المرور مطلوبة.' })
      return
    }
    convertTask =
      action === 'add'
        ? { operation: 'convert', input: 'import-file', input_format: 'pdf', output_format: 'pdf', engine: 'pdftk', password }
        : { operation: 'convert', input: 'import-file', input_format: 'pdf', output_format: 'pdf', engine: 'pdftk', input_password: password }
  } else {
    const target = typeof req.body?.target === 'string' ? req.body.target : 'pdf'
    const allowedExts = CONVERT_RULES[target]
    if (!allowedExts) {
      res.status(400).json({ error: 'صيغة الهدف غير مدعومة.' })
      return
    }
    if (!ext || !allowedExts.has(ext)) {
      res.status(400).json({
        error: `صيغة الملف غير مدعومة لهذا التحويل. الصيغ المسموح بها: ${[...allowedExts].join(', ').toUpperCase()}.`
      })
      return
    }
    convertTask = { operation: 'convert', input: 'import-file', output_format: target }
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
          'convert-file': convertTask,
          'export-file': { operation: 'export/url', input: 'convert-file' }
        }
      })
    })
    if (!jobRes.ok) {
      const errBody = await jobRes.text()
      throw new Error(`CloudConvert job creation failed: ${jobRes.status} ${errBody}`)
    }
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
