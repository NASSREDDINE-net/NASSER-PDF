import { createContext, useContext, useEffect, useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

const LanguageContext = createContext(null)

/** Given a pathname, is it under the /en prefix? */
function isEnglishPath(pathname) {
  return pathname === '/en' || pathname.startsWith('/en/')
}

/** Strip a leading /en prefix from a pathname, returning the "base" (Arabic) path. */
function stripEnPrefix(pathname) {
  if (pathname === '/en') return '/'
  if (pathname.startsWith('/en/')) return pathname.slice(3)
  return pathname
}

export function LanguageProvider({ children }) {
  const location = useLocation()
  const navigate = useNavigate()

  const lang = isEnglishPath(location.pathname) ? 'en' : 'ar'
  const basePath = stripEnPrefix(location.pathname)

  useEffect(() => {
    document.documentElement.lang = lang
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr'
  }, [lang])

  /** Turn a base (Arabic) path like "/word-to-pdf" into the current-language equivalent. */
  const withLang = (path) => {
    if (lang === 'ar') return path
    return path === '/' ? '/en' : `/en${path}`
  }

  const toggleLang = () => {
    navigate(lang === 'ar' ? (basePath === '/' ? '/en' : `/en${basePath}`) : basePath);
  }

  const value = useMemo(
    () => ({ lang, basePath, withLang, toggleLang }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [lang, basePath]
  )

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used within a LanguageProvider')
  return ctx
}

/** Pick the dictionary entry for the current language, e.g. useT(dict) where dict = { ar: {...}, en: {...} } */
export function useT(dict) {
  const { lang } = useLanguage()
  return dict[lang] || dict.ar
}
