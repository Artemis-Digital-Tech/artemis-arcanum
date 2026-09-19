import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth0 } from '@auth0/auth0-react'
import { Link, useLocation } from 'react-router-dom'
import LanguageSwitcher from './i18n/LanguageSwitcher'
import AccountMenu from './components/AccountMenu'
import Seo from './components/Seo'
import { CardFrontFace } from './components/TarotCard'
import { getCardDisplayName } from './data/cardNames'
import { TAROT_DECK } from './data/tarotDeck'
import { isAuth0Configured } from './auth/auth0Config'
import { ReadingsAPI, type SavedReading } from './services/ReadingsAPI'
import { usePlan } from './hooks/usePlan'

const cardsById = new Map(TAROT_DECK.map((c) => [c.id, c]))

function MyReadings() {
  const { t, i18n } = useTranslation()
  const location = useLocation()

  return (
    <div className="game-select">
      <Seo title={t('seo.myReadings.title')} description={t('myReadings.lede')} noindex />
      <div className="frame">
        <span className="c2"></span>
        <span className="c3"></span>
      </div>

      <header>
        <div className="wrap nav">
          <Link to=".." className="wordmark" style={{ textDecoration: 'none' }}>
            <svg viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="8.4" stroke="currentColor" strokeWidth="1" />
              <path d="M12 3.6V6M12 18v2.4M3.6 12H6M18 12h2.4" stroke="currentColor" strokeWidth="1" />
              <circle cx="12" cy="12" r="2.2" fill="currentColor" />
            </svg>
            ARCANUM <span className="idx">No. I</span>
          </Link>
          <div className="nav-utility">
            <LanguageSwitcher />
            <AccountMenu />
            <Link to=".." className="btn-ghost">
              &larr; {t('myReadings.backCta')}
            </Link>
          </div>
        </div>
        <hr className="rule" />
      </header>

      <main className="game-select-main">
        <div className="wrap">
          <div className="game-select-head">
            <div className="plate-label">
              <span className="dash"></span>
              {t('myReadings.plateLabel')}
            </div>
            <h1>{t('myReadings.title')}</h1>
            <p>{t('myReadings.lede')}</p>
          </div>

          {isAuth0Configured ? (
            <ReadingsGate returnTo={location.pathname} lang={i18n.language} />
          ) : (
            <p className="auth-notice mono">{t('auth.notConfigured')}</p>
          )}
        </div>
      </main>
    </div>
  )
}

function ReadingsGate({ returnTo }: { returnTo: string; lang: string }) {
  const { t } = useTranslation()
  const { isAuthenticated, isLoading: authLoading, getIdTokenClaims } = useAuth0()
  const { plan } = usePlan()
  const [status, setStatus] = useState<'idle' | 'loading' | 'error' | 'done'>('idle')
  const [readings, setReadings] = useState<SavedReading[]>([])

  useEffect(() => {
    if (!isAuthenticated) return
    let cancelled = false

    async function load() {
      setStatus('loading')
      try {
        const claims = await getIdTokenClaims()
        if (!claims?.__raw) throw new Error('no id token')
        const list = await ReadingsAPI.list(claims.__raw)
        if (!cancelled) {
          setReadings(list)
          setStatus('done')
        }
      } catch {
        if (!cancelled) setStatus('error')
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [isAuthenticated, getIdTokenClaims])

  if (authLoading) {
    return <p className="auth-notice mono">{t('auth.loading')}</p>
  }

  if (!isAuthenticated) {
    return (
      <>
        <p className="auth-notice mono">{t('myReadings.signInNotice')}</p>
        <Link to="../entrar" state={{ returnTo }} className="btn-primary">
          {t('auth.signInCta')}
          <svg viewBox="0 0 24 24" fill="none">
            <path
              d="M5 12h14M13 6l6 6-6 6"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Link>
      </>
    )
  }

  if (status === 'loading' || status === 'idle') {
    return <p className="auth-notice mono">{t('myReadings.loading')}</p>
  }

  if (status === 'error') {
    return (
      <>
        <p className="auth-notice mono is-error">{t('myReadings.error')}</p>
        <button type="button" className="btn-ghost" onClick={() => setStatus('idle')}>
          {t('auth.retryCta')}
        </button>
      </>
    )
  }

  const retentionDays = plan.historyRetentionDays
  const visibleReadings =
    retentionDays === null
      ? readings
      : readings.filter((r) => Date.now() - new Date(r.createdAt).getTime() <= retentionDays * 86_400_000)
  const hiddenByRetention = readings.length - visibleReadings.length

  if (readings.length === 0) {
    return (
      <>
        <p className="auth-notice mono">{t('myReadings.empty')}</p>
        <Link to="../jogo" className="btn-primary">
          {t('myReadings.emptyCta')}
          <svg viewBox="0 0 24 24" fill="none">
            <path
              d="M5 12h14M13 6l6 6-6 6"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Link>
      </>
    )
  }

  return (
    <>
      {retentionDays !== null && (
        <p className="auth-notice mono">
          {t('myReadings.retentionNotice', { count: retentionDays })}
        </p>
      )}
      {visibleReadings.length === 0 ? (
        <p className="auth-notice mono">{t('myReadings.emptyAfterRetention')}</p>
      ) : (
        <div className="readings-list">
          {visibleReadings.map((reading) => (
            <ReadingHistoryItem key={reading.id} reading={reading} />
          ))}
        </div>
      )}
      {hiddenByRetention > 0 && (
        <p className="auth-notice mono">
          {t('myReadings.hiddenByRetention', { count: hiddenByRetention })}{' '}
          <Link to="../precos" className="btn-ghost">
            {t('myReadings.upgradeCta')}
          </Link>
        </p>
      )}
    </>
  )
}

function ReadingHistoryItem({ reading }: { reading: SavedReading }) {
  const { t, i18n } = useTranslation()
  const [expanded, setExpanded] = useState(false)

  const date = new Intl.DateTimeFormat(i18n.language, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(reading.createdAt))

  const paragraphs = reading.response.overview.split(/\n+/).filter(Boolean)

  return (
    <article className="reading-history-item">
      <button
        type="button"
        className="reading-history-head"
        aria-expanded={expanded}
        onClick={() => setExpanded((v) => !v)}
      >
        <span className="reading-history-meta mono">
          {date} &middot; {reading.spreadName}
        </span>
        <span className="reading-history-question">
          {reading.response.title || `“${reading.question}”`}
        </span>
        <svg
          className="reading-history-chevron"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {expanded && (
        <div className="reading-history-body">
          <p className="reading-page-question">
            {t('gameBoard.questionCard.label')}: &ldquo;{reading.question}&rdquo;
          </p>
          <div className="reading-overview">
            {paragraphs.map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
            {reading.response.closing && (
              <div className="reading-closing">
                <span className="reading-closing-label mono">{t('gameBoard.reading.closingLabel')}</span>
                <p>{reading.response.closing}</p>
              </div>
            )}
          </div>
          <div className="reading-cards">
            {reading.cards.map((requestCard) => {
              const card = cardsById.get(requestCard.cardId)
              const entry = reading.response.cards.find((c) => c.position === requestCard.position)
              if (!card || !entry) return null
              return (
                <div key={requestCard.position} className="reading-card-row">
                  <span className="reading-card-visual">
                    <CardFrontFace card={card} name={getCardDisplayName(card, t)} />
                  </span>
                  <div className="reading-card-copy">
                    <span className="reading-card-position mono">{requestCard.positionLabel}</span>
                    <h3 className="reading-card-name">{getCardDisplayName(card, t)}</h3>
                    <p className="reading-card-meaning">{entry.meaning}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </article>
  )
}

export default MyReadings
