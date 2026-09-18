import { useEffect } from 'react'
import { Navigate, Outlet, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { DEFAULT_LANGUAGE, isSupportedLanguage } from './constants'

/**
 * Reads the :lang route param, redirects to the default language if it's
 * missing or unsupported, and keeps i18next in sync with it otherwise.
 */
export default function LanguageLayout() {
  const { lang } = useParams<{ lang: string }>()
  const { i18n } = useTranslation()

  useEffect(() => {
    if (isSupportedLanguage(lang) && i18n.language !== lang) {
      void i18n.changeLanguage(lang)
    }
  }, [lang, i18n])

  if (!isSupportedLanguage(lang)) {
    return <Navigate to={`/${DEFAULT_LANGUAGE}`} replace />
  }

  return <Outlet />
}
