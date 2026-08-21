import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="static-page" style={{ textAlign: 'center' }}>
      <h1>404 — الصفحة غير موجودة</h1>
      <p>الصفحة التي تبحث عنها غير متوفرة.</p>
      <Link to="/" className="btn" style={{ display: 'inline-flex', marginTop: 16 }}>
        العودة للرئيسية
      </Link>
    </div>
  )
}
