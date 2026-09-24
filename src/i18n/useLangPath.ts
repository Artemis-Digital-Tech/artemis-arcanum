import { useParams } from 'react-router-dom'
import { DEFAULT_LANGUAGE, isSupportedLanguage } from './constants'

/**
 * Builds absolute, language-prefixed paths ("/pt/precos"). Header controls
 * render on pages at different depths (/pt, /pt/cartas/o-louco), where a
 * relative `to="precos"` would resolve under the current page instead of
 * under the language root.
 */
export function useLangPath() {
  const { lang } = useParams<{ lang: string }>()
  const current = isSupportedLanguage(lang) ? lang : DEFAULT_LANGUAGE
  return (path = '') => `/${current}${path ? `/${path}` : ''}`
}
