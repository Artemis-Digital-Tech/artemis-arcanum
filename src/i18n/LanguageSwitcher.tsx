import { Link, useParams } from 'react-router-dom'
import { SUPPORTED_LANGUAGES } from './constants'

const LABELS: Record<string, string> = {
  en: 'EN',
  pt: 'PT',
}

export default function LanguageSwitcher() {
  const { lang: currentLang } = useParams<{ lang: string }>()

  return (
    <div className="lang-switch" aria-label="Language">
      {SUPPORTED_LANGUAGES.map((lang, i) => (
        <span key={lang}>
          {i > 0 && <span className="lang-switch-sep">/</span>}
          <Link
            to={`/${lang}`}
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
