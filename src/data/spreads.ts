export type SpreadId = 'single' | 'three' | 'horseshoe' | 'celtic'

export interface Spread {
  id: SpreadId
  /** Number of cards drawn. Also drives the depth gauge needle position. */
  cardCount: number
  /** Translation key prefix under gameSelect.spreads.<id> */
  i18nKey: SpreadId
}

/** Ticks shown on every depth gauge, so rows read as one shared scale. */
export const DEPTH_SCALE_MAX = 10

export const SPREADS: Spread[] = [
  { id: 'single', cardCount: 1, i18nKey: 'single' },
  { id: 'three', cardCount: 3, i18nKey: 'three' },
  { id: 'horseshoe', cardCount: 7, i18nKey: 'horseshoe' },
  { id: 'celtic', cardCount: 10, i18nKey: 'celtic' },
]

export type FramingId =
  | 'pastPresentFuture'
  | 'situationActionResult'
  | 'youOtherRelationship'
  | 'mindBodySpirit'
  | 'prosConsAdvice'

/** The five framings available only for the three-card spread. */
export const THREE_CARD_FRAMINGS: FramingId[] = [
  'pastPresentFuture',
  'situationActionResult',
  'youOtherRelationship',
  'mindBodySpirit',
  'prosConsAdvice',
]
