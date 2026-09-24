import type { TFunction } from 'i18next'
import { CARD_SLUGS } from './cardSlugs'
import { COURT_RANKS, RANK_PIPS, TAROT_DECK, isMajor, type Suit, type TarotCardData } from './tarotDeck'

export type CardGroupId = 'majors' | Suit
export type Element = 'fire' | 'water' | 'air' | 'earth'

export interface CardGroup {
  id: CardGroupId
  /** In-page anchor on the cards index. */
  anchor: string
  cards: TarotCardData[]
}

const GROUP_ANCHORS: Record<CardGroupId, string> = {
  majors: 'arcanos-maiores',
  wands: 'paus',
  cups: 'copas',
  swords: 'espadas',
  pentacles: 'ouros',
}

/** The deck as five journeys: the Fool's 0 to XXI, then each suit Ace to King. */
export const CARD_GROUPS: CardGroup[] = (['majors', 'wands', 'cups', 'swords', 'pentacles'] as const).map((id) => ({
  id,
  anchor: GROUP_ANCHORS[id],
  cards: TAROT_DECK.filter((c) => (id === 'majors' ? isMajor(c) : !isMajor(c) && c.suit === id)),
}))

export const SUIT_ELEMENTS: Record<Suit, Element> = {
  wands: 'fire',
  cups: 'water',
  swords: 'air',
  pentacles: 'earth',
}

const ROMAN: [number, string][] = [
  [10, 'X'],
  [9, 'IX'],
  [5, 'V'],
  [4, 'IV'],
  [1, 'I'],
]

export function toRoman(n: number): string {
  if (n === 0) return '0'
  let rest = n
  let out = ''
  for (const [value, glyph] of ROMAN) {
    while (rest >= value) {
      out += glyph
      rest -= value
    }
  }
  return out
}

/** The short mark printed on a card's node: its numeral, or the court's abbreviation. */
export function cardMark(card: TarotCardData, t: TFunction): string {
  if (isMajor(card)) return toRoman(card.number)
  if (card.rank === 'ace') return t('cardsPage.rankMarks.ace')
  if (COURT_RANKS.includes(card.rank)) return t(`cardsPage.rankMarks.${card.rank}`)
  return toRoman(RANK_PIPS[card.rank])
}

export function groupOf(card: TarotCardData): CardGroup {
  const id: CardGroupId = isMajor(card) ? 'majors' : card.suit
  return CARD_GROUPS.find((g) => g.id === id)!
}

export function journeyPosition(card: TarotCardData) {
  const group = groupOf(card)
  const index = group.cards.findIndex((c) => c.id === card.id)
  return {
    group,
    index,
    prev: group.cards[index - 1] as TarotCardData | undefined,
    next: group.cards[index + 1] as TarotCardData | undefined,
  }
}

export function cardPath(card: TarotCardData): string {
  return `cartas/${CARD_SLUGS[card.id]}`
}

export function cardThumbUrl(cardId: string): string {
  return `/cards/thumb/${cardId}.webp`
}

/**
 * Grammatical gender of a card's display name, for Portuguese headings that
 * agree with it ("A Torre invertida", "O Louco invertido"). English has one
 * form for every context, so its keys simply repeat.
 */
export function nameGender(name: string): 'm' | 'f' | 'pl' {
  if (/^(Os|As) /.test(name)) return 'pl'
  if (/^(A |Rainha )/.test(name)) return 'f'
  return 'm'
}
