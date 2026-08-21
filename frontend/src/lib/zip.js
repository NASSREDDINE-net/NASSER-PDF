import JSZip from 'jszip'
import { downloadBlob } from './imagePdf.js'

export async function downloadFilesAsZip(files, zipName) {
  const zip = new JSZip()
  files.forEach((f) => zip.file(f.name, f.bytes))
  const blob = await zip.generateAsync({ type: 'blob' })
  downloadBlob(blob, zipName)
}
