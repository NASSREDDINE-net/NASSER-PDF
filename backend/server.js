import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import multer from 'multer'
import rateLimit from 'express-rate-limit'
import { execFile } from 'node:child_process'
import { promises as fs } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import crypto from 'node:crypto'

const PORT = process.env.PORT || 3000
const MAX_FILE_BYTES = 15 * 1024 * 1024 // 15MB
const CONVERT_TIMEOUT_MS = 60_000
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean)

const ALLOWED_EXTENSIONS = {
  '.doc': 'application/msword',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.xls': 'application/vnd.ms-excel',
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
}

const app = express()
app.set('trust proxy', 1)
app.use(helmet())

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || ALLOWED_ORIGINS.length === 0 || ALLOWED_ORIGINS.includes(origin)) {
        return callback(null, true)
      }
      return callback(new Error('Origin not allowed'))
    }
  })
)

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'عدد كبير من الطلبات، الرجاء المحاولة بعد قليل.' }
})
app.use('/api/', limiter)

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_BYTES, files: 1 }
})

app.get('/health', (req, res) => {
  res.json({ status: 'ok' })
})

app.post('/api/convert', (req, res) => {
  upload.single('file')(req, res, async (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({ error: 'حجم الملف أكبر من الحد المسموح به (15MB).' })
      }
      return res.status(400).json({ error: 'فشل رفع الملف.' })
    }

    if (!req.file) {
      return res.status(400).json({ error: 'لم يتم إرفاق أي ملف.' })
    }

    const originalExt = path.extname(req.file.originalname).toLowerCase()
    if (!ALLOWED_EXTENSIONS[originalExt]) {
      return res.status(400).json({ error: 'صيغة الملف غير مدعومة. يُسمح فقط بـ DOC, DOCX, XLS, XLSX.' })
    }

    const jobId = crypto.randomUUID()
    const workDir = path.join(os.tmpdir(), `nasser-pdf-${jobId}`)
    const profileDir = path.join(workDir, 'profile')
    const inputPath = path.join(workDir, `input${originalExt}`)

    try {
      await fs.mkdir(workDir, { recursive: true })
      await fs.writeFile(inputPath, req.file.buffer)

      await new Promise((resolve, reject) => {
        execFile(
          'soffice',
          [
            '--headless',
            '--norestore',
            '--invisible',
            `-env:UserInstallation=file://${profileDir}`,
            '--convert-to',
            'pdf',
            '--outdir',
            workDir,
            inputPath
          ],
          { timeout: CONVERT_TIMEOUT_MS },
          (error, stdout, stderr) => {
            if (error) return reject(new Error(stderr || error.message))
            resolve()
          }
        )
      })

      const outputPath = path.join(workDir, 'input.pdf')
      const pdfBuffer = await fs.readFile(outputPath)

      res.setHeader('Content-Type', 'application/pdf')
      res.setHeader('Content-Disposition', 'attachment; filename="converted.pdf"')
      res.send(pdfBuffer)
    } catch (error) {
      console.error('Conversion failed:', error.message)
      res.status(500).json({ error: 'تعذّر تحويل الملف. تأكد أنه ملف صالح وغير تالف.' })
    } finally {
      fs.rm(workDir, { recursive: true, force: true }).catch(() => {})
    }
  })
})

app.use((req, res) => {
  res.status(404).json({ error: 'المسار غير موجود.' })
})

app.listen(PORT, () => {
  console.log(`NASSER PDF backend listening on port ${PORT}`)
})
