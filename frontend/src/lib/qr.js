import QRCode from 'qrcode'

export function buildPayload(type, fields) {
  switch (type) {
    case 'url': {
      const raw = (fields.url || '').trim()
      if (!raw) return ''
      return /^https?:\/\//i.test(raw) ? raw : `https://${raw}`
    }
    case 'text':
      return (fields.text || '').trim()
    case 'email': {
      const email = (fields.email || '').trim()
      if (!email) return ''
      const params = new URLSearchParams()
      if (fields.subject) params.set('subject', fields.subject)
      if (fields.body) params.set('body', fields.body)
      const query = params.toString()
      return `mailto:${email}${query ? `?${query}` : ''}`
    }
    case 'phone': {
      const phone = (fields.phone || '').trim()
      return phone ? `tel:${phone}` : ''
    }
    case 'wifi': {
      const ssid = (fields.ssid || '').trim()
      if (!ssid) return ''
      const enc = fields.encryption || 'WPA'
      const password = fields.password || ''
      const hidden = fields.hidden ? 'true' : 'false'
      const escape = (v) => v.replace(/([\\;,:"])/g, '\\$1')
      return `WIFI:T:${enc};S:${escape(ssid)};P:${escape(password)};H:${hidden};;`
    }
    default:
      return ''
  }
}

export async function generatePng(payload, size) {
  return QRCode.toDataURL(payload, {
    width: size,
    margin: 2,
    color: { dark: '#1f2937', light: '#ffffff' }
  })
}

export async function generateSvg(payload, size) {
  return QRCode.toString(payload, {
    type: 'svg',
    width: size,
    margin: 2,
    color: { dark: '#1f2937', light: '#ffffff' }
  })
}
