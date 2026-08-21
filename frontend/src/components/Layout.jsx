import { Link, useLocation } from 'react-router-dom'

const NAV_LINKS = [
  { to: '/word-to-pdf', label: 'Word → PDF' },
  { to: '/excel-to-pdf', label: 'Excel → PDF' },
  { to: '/image-to-pdf', label: 'صور → PDF' },
  { to: '/qr-code', label: 'QR Code' }
]

export default function Layout({ children }) {
  const location = useLocation()

  return (
    <div className="app-shell">
      <header className="site-header">
        <div className="container header-inner">
          <Link to="/" className="brand">
            <span className="brand-badge">PDF</span>
            <span>NASSER PDF</span>
          </Link>
          <nav className="main-nav">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={location.pathname === link.to ? 'active' : ''}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <main className="container main-content">{children}</main>

      <footer className="site-footer">
        <div className="container footer-inner">
          <p>© {new Date().getFullYear()} NASSER PDF. جميع الأدوات تعمل مباشرة وبدون حفظ ملفاتك.</p>
          <div className="footer-links">
            <Link to="/about">حول الموقع</Link>
            <Link to="/privacy">الخصوصية</Link>
            <Link to="/terms">الشروط</Link>
            <a href="https://nassreddine.is-a.dev/" target="_blank" rel="noopener noreferrer">
              Developed by NASSREDDINE
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
