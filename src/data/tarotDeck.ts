export type Suit = 'wands' | 'cups' | 'swords' | 'pentacles'

export type Rank =
  | 'ace'
  | 'two'
  | 'three'
  | 'four'
  | 'five'
  | 'six'
  | 'seven'
  | 'eight'
  | 'nine'
  | 'ten'
  | 'page'
  | 'knight'
  | 'queen'
  | 'king'

export interface MajorCard {
  id: string
  arcana: 'major'
  /** 0-21, The Fool through The World. */
  number: number
}

export interface MinorCard {
  id: string
  arcana: 'minor'
  suit: Suit
  rank: Rank
}

export type TarotCardData = MajorCard | MinorCard

const MAJOR_IDS = [
  'fool',
  'magician',
  'highPriestess',
  'empress',
  'emperor',
  'hierophant',
  'lovers',
  'chariot',
  'strength',
  'hermit',
  'wheelOfFortune',
  'justice',
  'hangedMan',
  'death',
  'temperance',
  'devil',
  'tower',
  'star',
  'moon',
  'sun',
  'judgement',
  'world',
] as const

const SUITS: Suit[] = ['wands', 'cups', 'swords', 'pentacles']

const RANKS: Rank[] = [
  'ace',
  'two',
  'three',
  'four',
  'five',
  'six',
  'seven',
  'eight',
  'nine',
  'ten',
  'page',
  'knight',
  'queen',
  'king',
]

const majors: MajorCard[] = MAJOR_IDS.map((id, index) => ({
  id: `major-${id}`,
  arcana: 'major',
  number: index,
}))

const minors: MinorCard[] = SUITS.flatMap((suit) =>
  RANKS.map((rank) => ({
    id: `minor-${suit}-${rank}`,
    arcana: 'minor' as const,
    suit,
    rank,
  })),
)

/** The full 78-card Rider-Waite-Smith deck, major and minor arcana. */
export const TAROT_DECK: TarotCardData[] = [...majors, ...minors]

export function isMajor(card: TarotCardData): card is MajorCard {
  return card.arcana === 'major'
}

/** Numeric rank value for a minor card, used for pip layouts (1-10, or 0 for court cards). */
export const RANK_PIPS: Record<Rank, number> = {
  ace: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  ten: 10,
  page: 0,
  knight: 0,
  queen: 0,
  king: 0,
}

export const COURT_RANKS: Rank[] = ['page', 'knight', 'queen', 'king']
