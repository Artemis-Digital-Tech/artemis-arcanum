import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth0 } from '@auth0/auth0-react'
import { Link, Navigate, useLocation } from 'react-router-dom'
import { isAuth0Configured } from './auth/auth0Config'
import CardFan from './components/CardFan'
import FlyingCard from './components/FlyingCard'
import ReadingLoader from './components/ReadingLoader'
import ReadingResult from './components/ReadingResult'
import { CardFrontFace } from './components/TarotCard'
import LanguageSwitcher from './i18n/LanguageSwitcher'
import AccountMenu from './components/AccountMenu'
import Seo from './components/Seo'
import { getCardDisplayName } from './data/cardNames'
import { BOARD_ASPECT, SPREAD_LAYOUTS, THREE_CARD_POSITION_LABELS } from './data/spreadLayouts'
import { SPREADS, type FramingId, type SpreadId } from './data/spreads'
import { TAROT_DECK, isMajor, type TarotCardData } from './data/tarotDeck'
import type { ReadingRequest, ReadingResponse } from './data/reading'
import { ArcanumAPI } from './services/ArcanumAPI'
import { ReadingsAPI } from './services/ReadingsAPI'
import { shuffle } from './utils/shuffle'
import { usePlan } from './hooks/usePlan'

type ReadingStatus = 'idle' | 'loading' | 'error' | 'done'

interface GameLocationState {
  spreadId: SpreadId
  cardCount: number
  framingId: FramingId | null
}

interface Flight {
  key: number
  slotIndex: number
  card: TarotCardData
  fromRect: DOMRect
  fromRotate: number
}

function isValidState(value: unknown): value is GameLocationState {
  if (!value || typeof value !== 'object') return false
  const v = value as Partial<GameLocationState>
  return typeof v.spreadId === 'string' && typeof v.cardCount === 'number'
}

function GameBoard() {
  const location = useLocation()
  const state = location.state

  if (!isValidState(state)) {
    return <Navigate to="../jogo" replace />
  }

  return <GameBoardSession state={state} />
}

function GameBoardSession({ state }: { state: GameLocationState }) {
  const { t, i18n } = useTranslation()
  const { isAuthenticated, user, getIdTokenClaims } = useAuth0()
  const { spreadId, framingId } = state
  // Only a first name, and only while signed in — no email or other account
  // detail belongs in the prompt sent to the reading webhook.
  const visitorName = isAuthenticated ? user?.given_name || user?.nickname || undefined : undefined
  // Drawing cards is free for anyone; only generating the AI reading needs an
  // account. Skipped entirely while Auth0 isn't configured, so the feature
  // stays usable before `.env.local` is filled in.
  const requiresSignIn = isAuth0Configured && !isAuthenticated
  const { plan, hasReadingsLeft, readingsRemaining, recordFreeReadingUsed } = usePlan()
  const readingBlockedByQuota = !requiresSignIn && !hasReadingsLeft

  const spread = SPREADS.find((s) => s.id === spreadId)
  const slots = SPREAD_LAYOUTS[spreadId]

  const cardsById = useMemo(() => new Map(TAROT_DECK.map((c) => [c.id, c])), [])
  const [deck, setDeck] = useState<string[]>(() => shuffle(TAROT_DECK.map((c) => c.id)))
  const [landed, setLanded] = useState<Record<number, string>>({})
  const [flight, setFlight] = useState<Flight | null>(null)
  const [isDealing, setIsDealing] = useState(true)
  const [isFanCollapsed, setIsFanCollapsed] = useState(false)
  const [fanKey, setFanKey] = useState(0)
  const [question, setQuestion] = useState('')
  const [questionDraft, setQuestionDraft] = useState('')
  const [isEditingQuestion, setIsEditingQuestion] = useState(false)
  const [readingStatus, setReadingStatus] = useState<ReadingStatus>('idle')
  const [reading, setReading] = useState<ReadingResponse | null>(null)

  const slotRefs = useRef(new Map<number, HTMLElement>())

  const drawnCount = Object.keys(landed).length
  const isComplete = drawnCount >= slots.length
  const nextSlotIndex = slots.findIndex((_, i) => landed[i] === undefined)
  const hasQuestion = question.trim().length > 0
  const canEditQuestion = drawnCount === 0
  const showQuestionGate = !hasQuestion || isEditingQuestion

  useEffect(() => {
    if (showQuestionGate) return
    const timer = setTimeout(() => setIsDealing(false), 900)
    return () => clearTimeout(timer)
    // Only the deal-in flourish depends on fanKey/gate; deps kept minimal on purpose.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fanKey, showQuestionGate])

  function registerSlotRef(index: number) {
    return (el: HTMLElement | null) => {
      if (el) slotRefs.current.set(index, el)
      else slotRefs.current.delete(index)
    }
  }

  function handlePick(cardId: string, rect: DOMRect, rotate: number) {
    if (flight || isDealing || isComplete || nextSlotIndex === -1) return
    const card = cardsById.get(cardId)
    if (!card) return
    setDeck((prev) => prev.filter((id) => id !== cardId))
    setFlight({ key: Date.now(), slotIndex: nextSlotIndex, card, fromRect: rect, fromRotate: rotate })
  }

  function handleLanded() {
    setFlight((current) => {
      if (!current) return current
      setLanded((prev) => ({ ...prev, [current.slotIndex]: current.card.id }))
      return null
    })
  }

  function handleQuestionSubmit(event: FormEvent) {
    event.preventDefault()
    const trimmed = questionDraft.trim()
    if (!trimmed) return
    setQuestion(trimmed)
    setIsEditingQuestion(false)
  }

  function handleEditQuestion() {
    setQuestionDraft(question)
    setIsEditingQuestion(true)
  }

  function handleReset() {
    setDeck(shuffle(TAROT_DECK.map((c) => c.id)))
    setLanded({})
    setFlight(null)
    setIsDealing(true)
    setIsFanCollapsed(false)
    setFanKey((k) => k + 1)
    setReadingStatus('idle')
    setReading(null)
  }

  /** The semantic key for a slot ("past", "obstacles"...) — stable across languages, unlike the slot's own id for the three-card spread ("first"/"second"/"third"). */
  function positionKey(slotId: string, slotIndex: number): string {
    if (spreadId === 'three' && framingId) {
      return THREE_CARD_POSITION_LABELS[framingId][slotIndex]
    }
    return slotId
  }

  function positionLabel(slotId: string, slotIndex: number): string {
    if (spreadId === 'three' && framingId) {
      const key = positionKey(slotId, slotIndex)
      return t(`gameBoard.framingPositions.${framingId}.${key}`)
    }
    return t(`gameBoard.positions.${spreadId}.${slotId}`)
  }

  const spreadName = spread ? t(`gameSelect.spreads.${spread.i18nKey}.name`) : ''

  async function handleGenerateReading() {
    if (requiresSignIn || readingBlockedByQuota) return
    setReadingStatus('loading')
    const request: ReadingRequest = {
      question,
      language: i18n.language,
      visitorName,
      spread: {
        id: spreadId,
        name: spreadName,
        cardCount: slots.length,
        framing: framingId,
      },
      cards: slots.map((slot, index) => {
        const card = cardsById.get(landed[index] as string) as TarotCardData
        return {
          position: positionKey(slot.id, index),
          positionLabel: positionLabel(slot.id, index),
          index,
          cardId: card.id,
          cardName: getCardDisplayName(card, t),
          arcana: card.arcana,
          suit: isMajor(card) ? undefined : card.suit,
          rank: isMajor(card) ? undefined : card.rank,
        }
      }),
    }

    try {
      const result = await ArcanumAPI.generateReading(request)
      setReading(result)
      setReadingStatus('done')
      if (plan.monthlyReadingLimit !== null) recordFreeReadingUsed()
      void saveReadingForLater(request, result)
    } catch {
      setReadingStatus('error')
    }
  }

  /** Best-effort: the visitor already has their reading on screen, so a save failure (offline, saving disabled) must never surface as an error to them. */
  async function saveReadingForLater(request: ReadingRequest, result: ReadingResponse) {
    if (!isAuthenticated) return
    try {
      const claims = await getIdTokenClaims()
      if (!claims?.__raw) return
      await ReadingsAPI.save(request, result, claims.__raw)
    } catch {
      // Swallowed by design — see docstring.
    }
  }

  const flightTarget = flight ? slotRefs.current.get(flight.slotIndex) : null
  const nextPositionName =
    nextSlotIndex >= 0 ? positionLabel(slots[nextSlotIndex].id, nextSlotIndex) : ''

  return (
    <div
      className={`game-board${isComplete || showQuestionGate ? ' is-complete' : ''}${
        isFanCollapsed ? ' is-fan-collapsed' : ''
      }`}
    >
      <Seo title={t('seo.gameBoard.title')} description={t('gameBoard.lede')} noindex />
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
            <Link to="../jogo" className="btn-ghost">
              &larr; {t('gameBoard.back')}
            </Link>
          </div>
        </div>
        <hr className="rule" />
      </header>

      <main className="game-board-main">
        <div className="wrap">
          {showQuestionGate ? (
            <form className="question-gate" onSubmit={handleQuestionSubmit}>
              <div className="game-select-head">
                <div className="plate-label">
                  <span className="dash"></span>
                  {t('gameBoard.questionStep.plateLabel')}
                </div>
                <h1>{t('gameBoard.questionStep.title')}</h1>
                <p>{t('gameBoard.questionStep.lede')}</p>
              </div>
              <textarea
                className="question-input"
                value={questionDraft}
                onChange={(e) => setQuestionDraft(e.target.value)}
                placeholder={t('gameBoard.questionStep.placeholder')}
                rows={3}
                autoFocus
              />
              <div className="question-gate-actions">
                {hasQuestion && isEditingQuestion && (
                  <button type="button" className="btn-ghost" onClick={() => setIsEditingQuestion(false)}>
                    &larr; {t('gameBoard.back')}
                  </button>
                )}
                <button type="submit" className="btn-primary" disabled={!questionDraft.trim()}>
                  {t('gameBoard.questionStep.cta')}
                  <svg viewBox="0 0 24 24" fill="none">
                    <path
                      d="M5 12h14M13 6l6 6-6 6"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>
            </form>
          ) : readingStatus === 'loading' ? (
            <ReadingLoader />
          ) : readingStatus === 'done' && reading ? (
            <ReadingResult
              reading={reading}
              question={question}
              slots={slots}
              landed={landed}
              cardsById={cardsById}
              positionLabel={positionLabel}
              positionKey={positionKey}
              onReset={handleReset}
            />
          ) : (
            <>
              <div className="game-select-head">
                <div className="plate-label">
                  <span className="dash"></span>
                  {t('gameBoard.plateLabel', { spread: spreadName })}
                </div>
                <h1>{t('gameBoard.title')}</h1>
                <p>{t('gameBoard.lede')}</p>
              </div>

              <div className="question-card">
                <span className="question-card-label mono">{t('gameBoard.questionCard.label')}</span>
                <p className="question-card-text">&ldquo;{question}&rdquo;</p>
                {canEditQuestion && (
                  <button type="button" className="btn-ghost question-card-edit" onClick={handleEditQuestion}>
                    {t('gameBoard.questionCard.edit')}
                  </button>
                )}
              </div>

              <div className="board-readout">
                <span className="fan-prompt">
                  {isDealing
                    ? t('gameBoard.dealingMessage')
                    : isComplete
                      ? t('gameBoard.completeMessage')
                      : t('gameBoard.pickForPosition', { position: nextPositionName })}
                </span>
                <span className="board-readout-actions">
                  {isComplete ? (
                    <>
                      {readingStatus === 'idle' && requiresSignIn && (
                        <span className="readout-cta">
                          <span className="reading-free-tier mono">
                            {t('gameBoard.reading.signInNotice')}
                          </span>
                          <Link to="../entrar" state={{ returnTo: '../jogo' }} className="btn-primary btn-small">
                            {t('gameBoard.reading.signInCta')}
                          </Link>
                        </span>
                      )}
                      {readingStatus === 'idle' && !requiresSignIn && readingBlockedByQuota && (
                        <span className="readout-cta">
                          <span className="reading-free-tier mono">
                            {t('gameBoard.reading.quotaReachedNotice')}
                          </span>
                          <Link to="../precos" className="btn-primary btn-small">
                            {t('gameBoard.reading.upgradeCta')}
                          </Link>
                        </span>
                      )}
                      {readingStatus === 'idle' && !requiresSignIn && !readingBlockedByQuota && (
                        <span className="readout-cta">
                          <span className="reading-free-tier mono">
                            {readingsRemaining === null
                              ? t('gameBoard.reading.freeTierNotice')
                              : t('gameBoard.reading.readingsRemainingNotice', { count: readingsRemaining })}
                          </span>
                          <button
                            type="button"
                            className="btn-primary btn-small"
                            onClick={handleGenerateReading}
                          >
                            {t('gameBoard.reading.generateCta')}
                          </button>
                        </span>
                      )}
                      {readingStatus === 'error' && (
                        <>
                          <span className="reading-error mono">{t('gameBoard.reading.errorGeneric')}</span>
                          <button type="button" className="btn-ghost" onClick={handleGenerateReading}>
                            {t('gameBoard.reading.retryCta')}
                          </button>
                        </>
                      )}
                      <button type="button" className="btn-ghost" onClick={handleReset}>
                        {t('gameBoard.resetCta')}
                      </button>
                    </>
                  ) : (
                    <span className="fan-count mono">
                      {t('gameBoard.deckRemaining', { count: deck.length })}
                    </span>
                  )}
                </span>
              </div>

              <div className="board-scroll">
                <div className="board-frame" style={{ aspectRatio: BOARD_ASPECT[spreadId] }}>
                  {slots.map((slot, index) => {
                    const cardId = landed[index]
                    const card = cardId ? cardsById.get(cardId) : undefined
                    const isPending = flight?.slotIndex === index
                    const isNext = !isComplete && index === nextSlotIndex && !flight
                    const tilt = `rotate(${slot.rotation ?? 0}deg)`

                    return (
                      <div
                        key={slot.id}
                        className={`board-slot${isNext ? ' is-next' : ''}${slot.labelAbove ? ' board-slot--label-above' : ''}`}
                        style={{ left: `${slot.x}%`, top: `${slot.y}%` }}
                      >
                        <span className="board-slot-card-wrap" ref={registerSlotRef(index)}>
                          <span
                            className="board-slot-card"
                            style={{
                              transform: tilt,
                              visibility: card || isPending ? 'hidden' : 'visible',
                            }}
                          >
                            <span className="board-slot-index">{index + 1}</span>
                          </span>
                          {card && (
                            <span className="board-card" style={{ transform: tilt }}>
                              <CardFrontFace card={card} name={getCardDisplayName(card, t)} />
                            </span>
                          )}
                        </span>
                        <span className="board-slot-label">{positionLabel(slot.id, index)}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      </main>

      {!showQuestionGate && !isComplete && (
        <div className="fan-panel">
          <button
            type="button"
            className="fan-handle"
            aria-expanded={!isFanCollapsed}
            onClick={() => setIsFanCollapsed((v) => !v)}
          >
            <span>{isFanCollapsed ? t('gameBoard.expandFan') : t('gameBoard.collapseFan')}</span>
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M6 10l6 5 6-5"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <CardFan
            key={fanKey}
            cards={deck}
            disabled={isDealing || !!flight || isFanCollapsed}
            onPick={handlePick}
            ariaLabel={(index, total) => t('gameBoard.cardAriaLabel', { index, total })}
          />
        </div>
      )}

      {flight && flightTarget && (
        <FlyingCard
          key={flight.key}
          card={flight.card}
          name={getCardDisplayName(flight.card, t)}
          fromRect={flight.fromRect}
          fromRotate={flight.fromRotate}
          toEl={flightTarget}
          rotation={slots[flight.slotIndex].rotation ?? 0}
          onLanded={handleLanded}
        />
      )}
    </div>
  )
}

export default GameBoard
