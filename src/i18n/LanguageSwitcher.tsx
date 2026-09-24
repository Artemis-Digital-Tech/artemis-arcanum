import { Link, useLocation, useParams } from 'react-router-dom'
import { SUPPORTED_LANGUAGES } from './constants'

const LABELS: Record<string, string> = {
  en: 'EN',
  pt: 'PT',
}

export default function LanguageSwitcher() {
  const { lang: currentLang } = useParams<{ lang: string }>()
  const { pathname, hash } = useLocation()
  // Every route exists in every language under the same path, so switching
  // swaps only the language segment and keeps the visitor on the same page.
  const rest = pathname.replace(/^\/[^/]+/, '')

  return (
    <div className="lang-switch" aria-label="Language">
      {SUPPORTED_LANGUAGES.map((lang, i) => (
        <span key={lang}>
          {i > 0 && <span className="lang-switch-sep">/</span>}
          <Link
            to={`/${lang}${rest}${hash}`}
            className={lang === currentLang ? 'is-active' : undefined}
            aria-current={lang === currentLang ? 'true' : undefined}
          >
            {LABELS[lang] ?? lang.toUpperCase()}
          </Link>
        </span>
      ))}
    </div>
  )
}
