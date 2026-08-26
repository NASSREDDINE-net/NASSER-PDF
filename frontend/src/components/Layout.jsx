import { Link, useLocation } from 'react-router-dom'
import { useLanguage, useT } from '../lib/i18n.jsx'

const NAV_LINKS = {
  ar: [
    { to: '/word-to-pdf', label: 'Word → PDF' },
    { to: '/excel-to-pdf', label: 'Excel → PDF' },
    { to: '/image-to-pdf', label: 'صور → PDF' },
    { to: '/qr-code', label: 'QR Code' },
    { to: '/pdf-editor', label: 'PDF Editor' }
  ],
  en: [
    { to: '/word-to-pdf', label: 'Word → PDF' },
    { to: '/excel-to-pdf', label: 'Excel → PDF' },
    { to: '/image-to-pdf', label: 'Image → PDF' },
    { to: '/qr-code', label: 'QR Code' },
    { to: '/pdf-editor', label: 'PDF Editor' }
  ]
}

const TXT = {
  ar: {
    tagline: 'جميع الأدوات تعمل مباشرة وبدون حفظ ملفاتك.',
    about: 'حول الموقع',
    privacy: 'الخصوصية',
    terms: 'الشروط',
    devBy: 'تطوير NASSREDDINE',
    switchTo: 'English'
  },
  en: {
    tagline: 'All tools run instantly without storing your files.',
    about: 'About',
    privacy: 'Privacy',
    terms: 'Terms',
    devBy: 'Developed by NASSREDDINE',
    switchTo: 'العربية'
  }
}

export default function Layout({ children }) {
  const location = useLocation()
  const { lang, withLang, toggleLang } = useLanguage()
  const t = useT(TXT)
  const navLinks = NAV_LINKS[lang]

  return (
    <div className="app-shell">
      <header className="site-header">
        <div className="container header-inner">
          <Link to={withLang('/')} className="brand">
            <span className="brand-badge">PDF</span>
            <span>NASSER PDF</span>
          </Link>
          <nav className="main-nav">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={withLang(link.to)}
                className={location.pathname === withLang(link.to) ? 'active' : ''}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <button type="button" className="lang-toggle" onClick={toggleLang}>
            {t.switchTo}
          </button>
        </div>
      </header>

      <main className="container main-content">{children}</main>

      <footer className="site-footer">
        <div className="container footer-inner">
          <p>© {new Date().getFullYear()} NASSER PDF. {t.tagline}</p>
          <div className="footer-links">
            <Link to={withLang('/about')}>{t.about}</Link>
            <Link to={withLang('/privacy')}>{t.privacy}</Link>
            <Link to={withLang('/terms')}>{t.terms}</Link>
            <a href="https://nassreddine.is-a.dev/" target="_blank" rel="noopener noreferrer">
              {t.devBy}
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
