import { Link } from 'react-router-dom'
import { useLanguage, useT } from '../lib/i18n.jsx'

const TXT = {
  ar: { title: '404 — الصفحة غير موجودة', text: 'الصفحة التي تبحث عنها غير متوفرة.', back: 'العودة للرئيسية' },
  en: { title: '404 — Page not found', text: 'The page you are looking for is not available.', back: 'Back to home' }
}

export default function NotFound() {
  const t = useT(TXT)
  const { withLang } = useLanguage()
  return (
    <div className="static-page" style={{ textAlign: 'center' }}>
      <h1>{t.title}</h1>
      <p>{t.text}</p>
      <Link to={withLang('/')} className="btn" style={{ display: 'inline-flex', marginTop: 16 }}>
        {t.back}
      </Link>
    </div>
  )
}
