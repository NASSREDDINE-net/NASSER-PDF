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
      return (
        <div className="error-fallback">
          <h2>حدث خطأ غير متوقع</h2>
          <p>حاول تحديث الصفحة، وإذا استمرت المشكلة أعد المحاولة لاحقاً.</p>
          <button onClick={() => window.location.reload()}>تحديث الصفحة</button>
        </div>
      )
    }
    return this.props.children
  }
}
