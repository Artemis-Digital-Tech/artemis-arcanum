import type { TFunction } from 'i18next'
import { COURT_RANKS, isMajor, type TarotCardData } from './tarotDeck'

/** Resolves a card's display name from the shared translation building blocks. */
export function getCardDisplayName(card: TarotCardData, t: TFunction): string {
  if (isMajor(card)) {
    const key = card.id.replace('major-', '')
    return t(`deck.cards.${key}`)
  }

  const rankLabel = COURT_RANKS.includes(card.rank)
    ? t(`cards.courts.${card.rank}`)
    : t(`cards.ranks.${card.rank}`)
  const suitLabel = t(`cards.suits.${card.suit}`)

  return t('cards.minorName', { rank: rankLabel, suit: suitLabel })
}
