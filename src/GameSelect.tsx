import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth0 } from '@auth0/auth0-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import DepthGauge from './components/DepthGauge'
import LanguageSwitcher from './i18n/LanguageSwitcher'
import AccountMenu from './components/AccountMenu'
import Seo from './components/Seo'
import { isAuth0Configured } from './auth/auth0Config'
import { SPREADS, THREE_CARD_FRAMINGS, type FramingId, type SpreadId } from './data/spreads'
import { usePlan } from './hooks/usePlan'

const TICKS = SPREADS.map((s) => s.cardCount)

function GameSelect() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated, isLoading: authLoading } = useAuth0()
  const { plan, readingsRemaining } = usePlan()
  const [selectedId, setSelectedId] = useState<SpreadId | null>(null)
  const [framing, setFraming] = useState<FramingId | null>(null)
  // The free-tier quota is only enforceable per account (see usePlan) — an
  // anonymous visitor has no account to count against, which is exactly the
  // loophole that let free readings go uncounted. Requiring sign-in here,
  // before any spread is even picked, closes that gap at the source.
  const requiresSignIn = isAuth0Configured && !authLoading && !isAuthenticated

  const selectedSpread = SPREADS.find((s) => s.id === selectedId) ?? null
  const needsFraming = selectedId === 'three'
  const canStart = !!selectedSpread && (!needsFraming || !!framing)
  // Once the free plan's monthly readings run out, even the spreads it does
  // allow (single/three) can't be started until the visitor upgrades —
  // otherwise the "you're out" notice above sits next to buttons that still
  // say "Escolher" as if nothing changed.
  const quotaExhausted = plan.monthlyReadingLimit !== null && readingsRemaining === 0

  type LockReason = 'plan' | 'quota' | null
  function lockReason(id: SpreadId): LockReason {
    if (!plan.allowedSpreads.includes(id)) return 'plan'
    if (quotaExhausted) return 'quota'
    return null
  }

  function selectSpread(id: SpreadId) {
    if (lockReason(id)) {
      navigate('../precos')
      return
    }
    setSelectedId(id)
    if (id !== 'three') setFraming(null)
  }

  function summaryText() {
    if (!selectedSpread) return t('gameSelect.summary.none')
    const spreadName = t(`gameSelect.spreads.${selectedSpread.i18nKey}.name`)
    if (needsFraming && !framing) return t('gameSelect.summary.needsFraming', { spread: spreadName })
    if (needsFraming && framing) {
      return t('gameSelect.summary.readyWithFraming', {
        spread: spreadName,
        framing: t(`gameSelect.framings.${framing}`),
      })
    }
    return t('gameSelect.summary.ready', { spread: spreadName })
  }

  function handleStart() {
    if (!canStart || !selectedSpread) return
    navigate('../leitura', {
      state: {
        spreadId: selectedSpread.id,
        cardCount: selectedSpread.cardCount,
        framingId: framing,
      },
    })
  }

  return (
    <div className="game-select">
      <Seo title={t('seo.gameSelect.title')} description={t('seo.gameSelect.description')} path="jogo" />
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
              &larr; {t('gameSelect.back')}
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
              {t('gameSelect.plateLabel')}
            </div>
            <h1>{t('gameSelect.title')}</h1>
            <p>{t('gameSelect.lede')}</p>
            {!requiresSignIn && plan.monthlyReadingLimit !== null && (
              <p className="free-quota-notice mono">
                {readingsRemaining === 0
                  ? t('gameBoard.reading.quotaReachedNotice')
                  : t('gameBoard.reading.readingsRemainingNotice', { count: readingsRemaining })}
              </p>
            )}
          </div>

          {requiresSignIn ? (
            <>
              <p className="auth-notice mono">{t('gameSelect.signInNotice')}</p>
              <Link
                to="../entrar"
                state={{ returnTo: location.pathname }}
                className="btn-primary"
              >
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
          ) : (
          <div className="spread-list" role="radiogroup" aria-label={t('gameSelect.title')}>
            {SPREADS.map((spread) => {
              const isSelected = spread.id === selectedId
              const reason = lockReason(spread.id)
              const locked = reason !== null
              return (
                <div
                  key={spread.id}
                  className={`spread-row${isSelected ? ' is-selected' : ''}${locked ? ' is-locked' : ''}`}
                >
                  <button
                    type="button"
                    className="spread-row-main"
                    role="radio"
                    aria-checked={isSelected}
                    onClick={() => selectSpread(spread.id)}
                  >
                    <span>
                      <DepthGauge count={spread.cardCount} ticks={TICKS} />
                      <span className="depth-gauge-count">
                        {t('gameSelect.cardCount', { count: spread.cardCount })}
                      </span>
                    </span>
                    <span className="spread-info">
                      <h3>{t(`gameSelect.spreads.${spread.i18nKey}.name`)}</h3>
                      <p>{t(`gameSelect.spreads.${spread.i18nKey}.description`)}</p>
                    </span>
                    {locked ? (
                      <span className="spread-lock-badge">
                        <svg viewBox="0 0 24 24" fill="none" width="12" height="12" aria-hidden="true">
                          <rect x="5" y="11" width="14" height="9" rx="1" stroke="currentColor" strokeWidth="1.6" />
                          <path d="M8 11V8a4 4 0 0 1 8 0v3" stroke="currentColor" strokeWidth="1.6" />
                        </svg>
                        {reason === 'quota' ? t('gameSelect.quotaLockedBadge') : t('gameSelect.lockedBadge')}
                      </span>
                    ) : (
                      <span className="spread-select-indicator">
                        {isSelected ? t('gameSelect.selectedBadge') : t('gameSelect.chooseCta')}
                      </span>
                    )}
                  </button>

                  {spread.id === 'three' && isSelected && (
                    <div className="framing-panel">
                      <div className="framing-prompt">{t('gameSelect.framingPrompt')}</div>
                      <div className="framing-chips" role="radiogroup" aria-label={t('gameSelect.framingPrompt')}>
                        {THREE_CARD_FRAMINGS.map((framingId) => (
                          <button
                            key={framingId}
                            type="button"
                            role="radio"
                            aria-checked={framing === framingId}
                            className={`framing-chip${framing === framingId ? ' is-selected' : ''}`}
                            onClick={() => setFraming(framingId)}
                          >
                            {t(`gameSelect.framings.${framingId}`)}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
          )}
        </div>
      </main>

      {!requiresSignIn && (
      <div className="confirm-bar">
        <div className="wrap confirm-bar-inner">
          <span className="confirm-summary">{summaryText()}</span>
          <button
            type="button"
            className="btn-primary"
            aria-disabled={!canStart}
            onClick={handleStart}
          >
            {t('gameSelect.startCta')}
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>
      )}
    </div>
  )
}

export default GameSelect
