import { Component } from 'react'

export default class ErrorBoundary extends Component {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error) {
    console.error('حدث خطأ غير متوقع:', error)
  }

  render() {
    if (this.state.hasError) {
      const isEn = typeof document !== 'undefined' && document.documentElement.lang === 'en'
      return (
        <div className="error-fallback">
          <h2>{isEn ? 'An unexpected error occurred' : 'حدث خطأ غير متوقع'}</h2>
          <p>{isEn ? 'Try refreshing the page, and if the problem persists, try again later.' : 'حاول تحديث الصفحة، وإذا استمرت المشكلة أعد المحاولة لاحقاً.'}</p>
          <button onClick={() => window.location.reload()}>{isEn ? 'Refresh page' : 'تحديث الصفحة'}</button>
        </div>
      )
    }
    return this.props.children
  }
}
