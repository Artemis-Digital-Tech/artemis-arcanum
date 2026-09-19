import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CardFrontFace } from './TarotCard'
import { getCardDisplayName } from '../data/cardNames'
import type { ReadingResponse } from '../data/reading'
import type { SlotLayout } from '../data/spreadLayouts'
import type { TarotCardData } from '../data/tarotDeck'

type ReadingView = 'full' | 'cards'

interface ReadingResultProps {
  reading: ReadingResponse
  question: string
  slots: SlotLayout[]
  landed: Record<number, string>
  cardsById: Map<string, TarotCardData>
  positionLabel: (slotId: string, index: number) => string
  positionKey: (slotId: string, index: number) => string
  onReset: () => void
}

/** The full interactive reading page — replaces the board entirely once the agent answers. */
export default function ReadingResult({
  reading,
  question,
  slots,
  landed,
  cardsById,
  positionLabel,
  positionKey,
  onReset,
}: ReadingResultProps) {
  const { t } = useTranslation()
  const [view, setView] = useState<ReadingView>('full')

  const title = reading.title || t('gameBoard.reading.title')
  const paragraphs = reading.overview.split(/\n+/).filter(Boolean)

  return (
    <div className="reading-page">
      <div className="plate-label">
        <span className="dash"></span>
        {t('gameBoard.reading.plateLabel')}
      </div>
      <h1 className="reading-page-title">{title}</h1>
      <p className="reading-page-question">
        {t('gameBoard.questionCard.label')}: &ldquo;{question}&rdquo;
      </p>

      <div className="reading-toggle" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={view === 'full'}
          className={view === 'full' ? 'is-active' : undefined}
          onClick={() => setView('full')}
        >
          {t('gameBoard.reading.viewFull')}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={view === 'cards'}
          className={view === 'cards' ? 'is-active' : undefined}
          onClick={() => setView('cards')}
        >
          {t('gameBoard.reading.viewCards')}
        </button>
      </div>

      {view === 'full' ? (
        <div className="reading-overview">
          {paragraphs.map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
          {reading.closing && (
            <div className="reading-closing">
              <span className="reading-closing-label mono">{t('gameBoard.reading.closingLabel')}</span>
              <p>{reading.closing}</p>
            </div>
          )}
        </div>
      ) : (
        <div className="reading-cards">
          {slots.map((slot, index) => {
            const cardId = landed[index]
            const card = cardId ? cardsById.get(cardId) : undefined
            const key = positionKey(slot.id, index)
            const entry = reading.cards.find((c) => c.position === key) ?? reading.cards[index]
            if (!card || !entry) return null

            return (
              <div key={slot.id} className="reading-card-row">
                <span className="reading-card-visual">
                  <CardFrontFace card={card} name={getCardDisplayName(card, t)} />
                </span>
                <div className="reading-card-copy">
                  <span className="reading-card-position mono">{positionLabel(slot.id, index)}</span>
                  <h3 className="reading-card-name">{getCardDisplayName(card, t)}</h3>
                  <p className="reading-card-meaning">{entry.meaning}</p>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <button type="button" className="btn-primary reading-page-reset" onClick={onReset}>
        {t('gameBoard.resetCta')}
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
  )
}
